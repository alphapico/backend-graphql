import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterInput } from './dto/register.input';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Customer } from './dto/customer.dto';
import { ReferralCodeUtil } from '@charonium/common/utils/referralCode.util';
// import { validate } from 'class-validator';
// import { ClassValidationException } from '@charonium/common/exceptions/class-validation.exception';
import { ERROR_MESSAGES } from '@charonium/common/constants/error-messages.constant';
import { PRISMA_ERROR_MESSAGES } from '@charonium/common/constants/prisma-error-messages.constant';
import { SES } from 'aws-sdk';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import * as backoff from 'backoff';
@Injectable()
export class CustomerService {
  private ses: SES;
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private referralCodeUtil: ReferralCodeUtil
  ) {
    this.ses = new SES({
      apiVersion: '2010-12-01',
      region: process.env.AWS_REGION,
    });
  }

  async register(input: RegisterInput): Promise<Customer> {
    // const validationErrors = await validate(input);
    // if (validationErrors.length > 0) {
    //   throw new ClassValidationException(validationErrors);
    // }

    let referralCustomerId: number | undefined;

    const hashedPassword = await argon2.hash(input.password);
    const referralCode = await this.referralCodeUtil.encodeReferralCode();

    if (input.referralCode) {
      referralCustomerId = await this.referralCodeUtil.decodeReferralCode(
        input.referralCode
      );

      if (!referralCustomerId) {
        throw new BadRequestException(ERROR_MESSAGES.INVALID_REFERRAL_CODE);
      }
    }

    try {
      const customer = await this.prisma.customer.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          referralCustomerId,
          referralCode,
          emailVerified: false,
        },
      });

      // send email verification using auth service. (not implemented yet)
      // email verfication using Amazon SES. (not implemented yet)

      return customer;
    } catch (error) {
      if (
        error.code === PRISMA_ERROR_MESSAGES.CLIENT.UNIQUE_CONSTRAINT_FAILED
      ) {
        throw new ConflictException(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
      throw error;
    }
  }

  async sendEmailVerification(customer: Customer): Promise<void> {
    const payload = { email: customer.email, sub: customer.customerId };
    const token = this.jwtService.sign(payload);
    const verificationLink = `${process.env.BACKEND_DOMAIN}/verify-email?token=${token}`;

    const template = Handlebars.compile(
      fs.readFileSync(
        path.join(__dirname, '../email-templates/verification.html'),
        'utf-8'
      )
    );

    const params: SES.SendEmailRequest = {
      Source: process.env.EMAIL_FROM,
      Destination: {
        ToAddresses: [customer.email],
      },
      Message: {
        Subject: {
          Data: 'Email Verification',
        },
        Body: {
          Html: {
            Data: template({ verificationLink }),
          },
        },
      },
    };

    try {
      await this.sendEmailWithRetry(params);
    } catch (error) {
      // await this.prisma.customer.update({
      //   where: { customerId: customer.customerId },
      //   data: { emailVerified: false },
      // });
      throw new BadRequestException(
        ERROR_MESSAGES.SEND_EMAIL_VERIFICATION_FAILED
      );
    }
  }

  async sendEmailWithRetry(params: SES.SendEmailRequest): Promise<void> {
    // Wrap the sendEmail function in a backoff.call instance
    const sendEmailCall = backoff.call(
      (params: SES.SendEmailRequest, callback: (error?: Error) => void) => {
        this.ses
          .sendEmail(params)
          .promise()
          .then(() => callback())
          .catch((error) => callback(error));
      },
      params,
      (error: Error | null) => {
        if (error) {
          console.error('Failed to send email after retries:', error);

          throw new BadRequestException(
            ERROR_MESSAGES.SEND_EMAIL_VERIFICATION_FAILED
          );
        } else {
          console.log('Email sent successfully');
        }
      }
    );

    // Set the backoff strategy to Fibonacci
    const fibonacciBackoff = backoff.fibonacci({
      randomisationFactor: 0.5,
      initialDelay: 500,
      maxDelay: 60000, // Maximum delay of 60 seconds
    });

    sendEmailCall.strategy = fibonacciBackoff;

    // Set the maximum number of retries
    sendEmailCall.failAfter(3);

    // Handle retry events
    sendEmailCall.on('backoff', (number, delay) => {
      console.log(`Email send attempt failed. Retrying in ${delay} ms...`);
    });

    // Handle failed retries
    sendEmailCall.on('fail', () => {
      console.error('Failed to send email after all retries');
    });

    // Start the backoff process
    sendEmailCall.start();
  }
}
