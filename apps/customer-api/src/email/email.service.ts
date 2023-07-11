import { Injectable, NotFoundException } from '@nestjs/common';
import { SES, SendEmailCommandInput } from '@aws-sdk/client-ses';
import { Customer } from '../customer/dto/customer.dto';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '@charonium/prisma';
import { ERROR_MESSAGES, EmailType, SUCCESS_MESSAGES } from '@charonium/common';
import {
  EmailStatus,
  CustomerStatus,
  LogStatus,
  CustomerRole,
} from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import * as backoff from 'backoff';
import { LogService } from '../log/log.service';

@Injectable()
export class EmailService {
  private ses: SES;
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
    private logService: LogService
  ) {
    this.ses = new SES({
      apiVersion: '2010-12-01',
      region: process.env.AWS_REGION,
    });
  }

  async createLink(
    customer: Customer,
    path: string,
    isAdmin = false
  ): Promise<string> {
    const payload = {
      email: customer.email,
      sub: customer.customerId,
      role: isAdmin ? CustomerRole.ADMIN : CustomerRole.USER,
    };
    const token = await this.authService.createEmailToken(payload);
    const link = `${process.env.FRONTEND_DOMAIN}/${path}?token=${token}`;

    return link;
  }

  async createVerificationLink(
    customer: Customer,
    isAdmin = false
  ): Promise<string> {
    const path = isAdmin ? 'register-admin' : 'verify-email';
    return this.createLink(customer, path, isAdmin);
  }

  async createResetPasswordLink(customer: Customer): Promise<string> {
    return this.createLink(customer, 'reset-password');
  }

  async sendEmail(
    emailType: EmailType,
    customer: Customer,
    data: Record<string, any>,
    templatePath: string,
    subject: string
  ): Promise<void> {
    if (process.env.NODE_ENV === 'test') return;

    const template = Handlebars.compile(
      fs.readFileSync(path.join(__dirname, templatePath), 'utf-8')
    );

    const params: SendEmailCommandInput = {
      Source: `${process.env.EMAIL_NAME} <${process.env.EMAIL_FROM}>`,
      Destination: {
        ToAddresses: [customer.email],
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Html: {
            Data: template(data),
          },
        },
      },
    };

    await this.sendEmailWithRetry(emailType, params, customer);
  }

  async sendEmailVerification(customer: Customer): Promise<void> {
    const verificationLink = await this.createVerificationLink(customer);
    const data = { verificationLink };
    await this.sendEmail(
      EmailType.VERIFICATION,
      customer,
      data,
      './email-templates/verification.html',
      'Email Verification'
    );
  }

  async sendPasswordResetEmail(customer: Customer): Promise<void> {
    const resetLink = await this.createResetPasswordLink(customer);
    const data = { resetLink };
    await this.sendEmail(
      EmailType.PASSWORD_RESET,
      customer,
      data,
      './email-templates/reset-password.html',
      'Password Reset'
    );
  }

  async sendAdminRegistrationEmail(admin: Customer): Promise<void> {
    const verificationLink = await this.createVerificationLink(admin, true);
    const data = { verificationLink };
    await this.sendEmail(
      EmailType.ADMIN_REGISTRATION,
      admin,
      data,
      './email-templates/admin-registration.html',
      'Admin Registration'
    );
  }

  async sendWelcomeEmail(customer: Customer, isAdmin = false): Promise<void> {
    const data = { referralCode: customer.referralCode };
    const templatePath = isAdmin
      ? './email-templates/admin-welcome.html'
      : './email-templates/user-welcome.html';
    await this.sendEmail(
      EmailType.WELCOME,
      customer,
      data,
      templatePath,
      'Welcome'
    );
  }

  async sendEmailWithRetry(
    emailType: EmailType,
    params: SendEmailCommandInput,
    customer: Customer
  ): Promise<void> {
    // Wrap the sendEmail function in a backoff.call instance
    const sendEmailCall = backoff.call(
      (params: SendEmailCommandInput, callback: (error?: Error) => void) => {
        this.ses
          .sendEmail(params)
          .then(() => callback())
          .catch((error) => callback(error));
      },
      params,
      (error: Error | null) => {
        let message = '';
        switch (emailType) {
          case EmailType.PASSWORD_RESET:
            message = error
              ? ERROR_MESSAGES.EMAIL_ERROR.FAILED_TO_SEND_PASSWORD_RESET
              : SUCCESS_MESSAGES.EMAIL_PASSWORD_RESET_SENT;
            break;
          case EmailType.ADMIN_REGISTRATION:
            message = error
              ? ERROR_MESSAGES.EMAIL_ERROR.FAILED_TO_SEND_ADMIN_REGISTRATION
              : SUCCESS_MESSAGES.EMAIL_ADMIN_REGISTRATION_SENT;
            break;
          case EmailType.WELCOME:
            message = error
              ? ERROR_MESSAGES.EMAIL_ERROR.FAILED_TO_SEND_WELCOME
              : SUCCESS_MESSAGES.EMAIL_WELCOME_SENT;
            break;
          default:
            message = error
              ? ERROR_MESSAGES.EMAIL_ERROR.FAILED_TO_SEND_VERIFICATION
              : SUCCESS_MESSAGES.EMAIL_VERIFICATION_SENT;
            break;
        }

        const logEntry = {
          level: error ? LogStatus.ERROR : LogStatus.INFO,
          message: message,
          serviceName: this.constructor.name,
          methodName: 'sendEmailWithRetry',
          customerId: customer.customerId,
          customerEmail: customer.email,
        };

        this.logService.createLogEntry(logEntry).catch((updateError) => {
          console.error(
            `Failed to create log entry for Email:${emailType}`,
            updateError
          );
        });

        if (error) {
          console.error('Failed to send email after retries:', error);
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

  async verifyEmail(token: string): Promise<boolean> {
    const payload = await this.authService.verifyEmailToken(token);

    const customer = await this.prisma.customer.findUnique({
      where: { customerId: payload.sub },
    });

    if (!customer) {
      throw new NotFoundException(
        ERROR_MESSAGES.EMAIL_ERROR.CUSTOMER_NOT_FOUND
      );
    }

    if (customer.customerStatus !== CustomerStatus.SUSPENDED) {
      await this.prisma.customer.update({
        where: { customerId: payload.sub },
        data: {
          emailStatus: EmailStatus.VERIFIED,
          customerStatus: CustomerStatus.ACTIVE,
        },
      });

      await this.sendWelcomeEmail(customer);

      return true;
    }

    return false;
  }
}
