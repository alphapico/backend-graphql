import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '@charonium/prisma';
import { RegisterInput } from './dto/register.input';

import * as argon2 from 'argon2';
import { Customer } from './dto/customer.dto';
import { Customer as PrismaCustomer } from '@prisma/client';
import {
  ERROR_MESSAGES,
  PRISMA_ERROR_MESSAGES,
  ReferralCodeUtil,
} from '@charonium/common';
// import { validate } from 'class-validator';
// import { ClassValidationException } from '@charonium/common';

import { EmailStatus, CustomerStatus } from '@prisma/client';
import { ResetPasswordInput } from './dto/reset-password.input';
import { AuthService } from '../auth/auth.service';
import { EmailService } from '../email/email.service';
@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private emailService: EmailService,
    private referralCodeUtil: ReferralCodeUtil
  ) {}

  async findByEmail(email: string): Promise<PrismaCustomer | null> {
    return this.prisma.customer.findUnique({ where: { email } });
  }

  async findByCustomerId(customerId: number): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { customerId },
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
        },
      });

      await this.emailService.sendEmailVerification(customer);

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

  async resetPassword(input: ResetPasswordInput): Promise<boolean> {
    const payload = await this.authService.verifyEmailToken(input.token);

    const customer = await this.prisma.customer.findUnique({
      where: { customerId: payload.sub },
    });

    if (!customer) {
      throw new BadRequestException(ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    }

    const hashedPassword = await argon2.hash(input.newPassword);

    if (customer.customerStatus !== CustomerStatus.SUSPENDED) {
      await this.prisma.customer.update({
        where: { customerId: payload.sub },
        data: {
          password: hashedPassword,
          emailStatus: EmailStatus.VERIFIED,
          customerStatus: CustomerStatus.ACTIVE,
        },
      });

      return true;
    }

    return false;
  }

  async forgetPassword(email: string): Promise<boolean> {
    const customer = await this.findByEmail(email);

    if (!customer) {
      throw new NotFoundException(ERROR_MESSAGES.INVALID_INPUT_EMAIL);
    }
    // Send the password reset email
    await this.emailService.sendPasswordResetEmail(customer);

    return true;
  }

  // auth.service.ts
  async resendEmailVerification(email: string): Promise<boolean> {
    const customer = await this.findByEmail(email);

    if (!customer) {
      throw new NotFoundException(ERROR_MESSAGES.INVALID_INPUT_EMAIL);
    }

    // Resend the email verification
    await this.emailService.sendEmailVerification(customer);

    return true;
  }
}
