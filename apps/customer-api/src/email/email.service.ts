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

  async createVerificationLink(
    customer: Customer,
    isAdmin = false
  ): Promise<string> {
    const payload = {
      email: customer.email,
      sub: customer.customerId,
      role: isAdmin ? CustomerRole.ADMIN : CustomerRole.USER,
    };
    const token = await this.authService.createEmailToken(payload);
    const verificationLink = `${process.env.FRONTEND_DOMAIN}/${
      isAdmin ? 'register-admin' : 'verify-email'
    }?token=${token}`;

    return verificationLink;
  }

  async sendEmailVerification(customer: Customer): Promise<void> {
    if (process.env.NODE_ENV === 'test') return;

    const verificationLink = await this.createVerificationLink(customer);

    const template = Handlebars.compile(
      fs.readFileSync(
        path.join(__dirname, './email-templates/verification.html'),
        'utf-8'
      )
    );

    const params: SendEmailCommandInput = {
      Source: `${process.env.EMAIL_NAME} <${process.env.EMAIL_FROM}>`,
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

    await this.sendEmailWithRetry(EmailType.VERIFICATION, params, customer);
  }

  async createResetPasswordLink(customer: Customer): Promise<string> {
    const payload = {
      email: customer.email,
      sub: customer.customerId,
      role: CustomerRole.USER,
    };
    const token = await this.authService.createEmailToken(payload);
    const resetLink = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`;

    return resetLink;
  }

  // customer.service.ts
  async sendPasswordResetEmail(customer: Customer): Promise<void> {
    if (process.env.NODE_ENV === 'test') return;

    const resetLink = await this.createResetPasswordLink(customer);

    const template = Handlebars.compile(
      fs.readFileSync(
        path.join(__dirname, './email-templates/reset-password.html'),
        'utf-8'
      )
    );

    const params: SendEmailCommandInput = {
      Source: `${process.env.EMAIL_NAME} <${process.env.EMAIL_FROM}>`,
      Destination: {
        ToAddresses: [customer.email],
      },
      Message: {
        Subject: {
          Data: 'Password Reset',
        },
        Body: {
          Html: {
            Data: template({ resetLink }),
          },
        },
      },
    };

    await this.sendEmailWithRetry(EmailType.PASSWORD_RESET, params, customer);
  }

  async sendAdminRegistrationEmail(admin: Customer): Promise<void> {
    if (process.env.NODE_ENV === 'test') return;

    const verificationLink = await this.createVerificationLink(admin, true);

    const template = Handlebars.compile(
      fs.readFileSync(
        path.join(__dirname, './email-templates/admin-registration.html'),
        'utf-8'
      )
    );

    const params: SendEmailCommandInput = {
      Source: `${process.env.EMAIL_NAME} <${process.env.EMAIL_FROM}>`,
      Destination: {
        ToAddresses: [admin.email],
      },
      Message: {
        Subject: {
          Data: 'Admin Registration',
        },
        Body: {
          Html: {
            Data: template({ verificationLink }),
          },
        },
      },
    };

    await this.sendEmailWithRetry(EmailType.ADMIN_REGISTRATION, params, admin);
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
        if (error) {
          console.error('Failed to send email after retries:', error);

          if (emailType == EmailType.PASSWORD_RESET) {
            this.logService
              .createLogEntry({
                level: LogStatus.ERROR,
                message:
                  ERROR_MESSAGES.EMAIL_ERROR.FAILED_TO_SEND_PASSWORD_RESET,
                serviceName: this.constructor.name,
                methodName: 'sendEmailWithRetry',
                customerId: customer.customerId,
                customerEmail: customer.email,
              })
              .catch((updateError) => {
                console.error(
                  `Failed to create log entry for Email:${EmailType.PASSWORD_RESET}`,
                  updateError
                );
              });
          } else if (emailType == EmailType.ADMIN_REGISTRATION) {
            this.logService
              .createLogEntry({
                level: LogStatus.ERROR,
                message:
                  ERROR_MESSAGES.EMAIL_ERROR.FAILED_TO_SEND_ADMIN_REGISTRATION,
                serviceName: this.constructor.name,
                methodName: 'sendEmailWithRetry',
                customerId: customer.customerId,
                customerEmail: customer.email,
              })
              .catch((updateError) => {
                console.error(
                  `Failed to create log entry for Email:${EmailType.ADMIN_REGISTRATION}`,
                  updateError
                );
              });
          } else {
            this.logService
              .createLogEntry({
                level: LogStatus.ERROR,
                message: ERROR_MESSAGES.EMAIL_ERROR.FAILED_TO_SEND_VERIFICATION,
                serviceName: this.constructor.name,
                methodName: 'sendEmailWithRetry',
                customerId: customer.customerId,
                customerEmail: customer.email,
              })
              .catch((updateError) => {
                console.error(
                  `Failed to create log entry for Email:${EmailType.VERIFICATION}`,
                  updateError
                );
              });
          }
        } else {
          console.log('Email sent successfully');

          if (emailType == EmailType.PASSWORD_RESET) {
            this.logService
              .createLogEntry({
                level: LogStatus.INFO,
                message: SUCCESS_MESSAGES.EMAIL_PASSWORD_RESET_SENT,
                serviceName: this.constructor.name,
                methodName: 'sendEmailWithRetry',
                customerId: customer.customerId,
                customerEmail: customer.email,
              })
              .catch((updateError) => {
                console.error(
                  `Failed to create log entry for Email:${EmailType.PASSWORD_RESET}`,
                  updateError
                );
              });
          } else if (emailType == EmailType.ADMIN_REGISTRATION) {
            this.logService
              .createLogEntry({
                level: LogStatus.INFO,
                message: SUCCESS_MESSAGES.EMAIL_ADMIN_REGISTRATION_SENT,
                serviceName: this.constructor.name,
                methodName: 'sendEmailWithRetry',
                customerId: customer.customerId,
                customerEmail: customer.email,
              })
              .catch((updateError) => {
                console.error(
                  `Failed to create log entry for Email:${EmailType.ADMIN_REGISTRATION}`,
                  updateError
                );
              });
          } else {
            this.logService
              .createLogEntry({
                level: LogStatus.INFO,
                message: SUCCESS_MESSAGES.EMAIL_VERIFICATION_SENT,
                serviceName: this.constructor.name,
                methodName: 'sendEmailWithRetry',
                customerId: customer.customerId,
                customerEmail: customer.email,
              })
              .catch((updateError) => {
                console.error(
                  `Failed to create log entry for Email:${EmailType.VERIFICATION}`,
                  updateError
                );
              });
          }
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

  // async sendEmailWithRetry(params: SendEmailCommandInput): Promise<void> {
  //   const maxRetries = 3;
  //   const initialDelay = 500;
  //   const maxDelay = 60000;
  //   const randomizationFactor = 0.5;

  //   for (let attempt = 1; attempt <= maxRetries; attempt++) {
  //     try {
  //       await this.ses.sendEmail(params);
  //       console.log('Email sent successfully');
  //       return;
  //     } catch (error) {
  //       if (attempt === maxRetries) {
  //         console.error('Failed to send email after all retries');

  //         throw error;
  //       } else {
  //         const delay = Math.min(
  //           initialDelay *
  //             Math.pow(2, attempt - 1) *
  //             (1 + Math.random() * randomizationFactor),
  //           maxDelay
  //         );
  //         console.log(`Email send attempt failed. Retrying in ${delay} ms...`);
  //         await new Promise((resolve) => setTimeout(resolve, delay));
  //       }
  //     }
  //   }
  // }

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

      return true;
    }

    return false;
  }
}
