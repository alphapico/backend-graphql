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
import NodeCache from 'node-cache';
import { Customer } from './dto/customer.dto';
import {
  CustomerRole,
  LogStatus,
  Customer as PrismaCustomer,
} from '@prisma/client';
import {
  CONFIG,
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
import { RegisterAdminInput } from './dto/register-admin.input';
import { LogService } from '../log/log.service';
@Injectable()
export class CustomerService {
  private cache: NodeCache;
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private emailService: EmailService,
    private logService: LogService,
    private referralCodeUtil: ReferralCodeUtil
  ) {
    this.cache = new NodeCache();
  }

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

    const cacheKey = `forgetPassword:${customer.customerId}`;
    const forgetPasswordCount = (this.cache.get(cacheKey) as number) || 0;

    const maxAllowedAttempts = CONFIG.EMAIL_RESEND_MAX_ATTEMPTS || 3;
    if (forgetPasswordCount >= maxAllowedAttempts) {
      this.logService.createLogEntry({
        level: LogStatus.ERROR,
        message: ERROR_MESSAGES.TOO_MANY_ATTEMPTS,
        code: 'BAD_REQUEST',
        statusCode: 400,
        serviceName: this.constructor.name,
        methodName: 'forgetPassword',
        customerId: customer.customerId,
        customerEmail: customer.email,
      });
      throw new BadRequestException(ERROR_MESSAGES.TOO_MANY_ATTEMPTS);
    }
    // Send the password reset email
    await this.emailService.sendPasswordResetEmail(customer);

    // Set a 1-hour TTL for the cache key
    const emailResendTTL = CONFIG.EMAIL_RESEND_TTL || 3600;
    this.cache.set(cacheKey, forgetPasswordCount + 1, emailResendTTL);

    return true;
  }

  async resendEmailVerification(email: string): Promise<boolean> {
    const customer = await this.findByEmail(email);

    if (!customer) {
      throw new NotFoundException(ERROR_MESSAGES.INVALID_INPUT_EMAIL);
    }

    const cacheKey = `resend:${customer.customerId}`;
    const resendCount = (this.cache.get(cacheKey) as number) || 0;

    const maxAllowedAttempts = CONFIG.EMAIL_RESEND_MAX_ATTEMPTS || 3;
    if (resendCount >= maxAllowedAttempts) {
      this.logService.createLogEntry({
        level: LogStatus.ERROR,
        message: ERROR_MESSAGES.TOO_MANY_ATTEMPTS,
        code: 'BAD_REQUEST',
        statusCode: 400,
        serviceName: this.constructor.name,
        methodName: 'resendEmailVerification',
        customerId: customer.customerId,
        customerEmail: customer.email,
      });
      throw new BadRequestException(ERROR_MESSAGES.TOO_MANY_ATTEMPTS);
    }

    // Resend the email verification
    await this.emailService.sendEmailVerification(customer);

    // Set a 1-hour TTL for the cache key
    const emailResendTTL = CONFIG.EMAIL_RESEND_TTL || 3600;
    this.cache.set(cacheKey, resendCount + 1, emailResendTTL);

    return true;
  }

  async resendAdminRegistrationEmail(): Promise<boolean> {
    const customer = await this.findByEmail(process.env.ADMIN_EMAIL);

    if (!customer) {
      throw new NotFoundException(ERROR_MESSAGES.INVALID_INPUT_EMAIL);
    }

    const cacheKey = `resend:${customer.customerId}`;
    const resendCount = (this.cache.get(cacheKey) as number) || 0;

    const maxAllowedAttempts = CONFIG.EMAIL_RESEND_MAX_ATTEMPTS || 3;
    if (resendCount >= maxAllowedAttempts) {
      this.logService.createLogEntry({
        level: LogStatus.ERROR,
        message: ERROR_MESSAGES.TOO_MANY_ATTEMPTS,
        code: 'BAD_REQUEST',
        statusCode: 400,
        serviceName: this.constructor.name,
        methodName: 'resendAdminRegistrationEmail',
        customerId: customer.customerId,
        customerEmail: customer.email,
      });
      throw new BadRequestException(ERROR_MESSAGES.TOO_MANY_ATTEMPTS);
    }

    // Resend the email verification
    await this.emailService.sendAdminRegistrationEmail(customer);

    // Set a 1-hour TTL for the cache key
    const emailResendTTL = CONFIG.EMAIL_RESEND_TTL || 3600;
    this.cache.set(cacheKey, resendCount + 1, emailResendTTL);

    return true;
  }

  async createAdmin(email: string): Promise<Customer> {
    const existingAdmin = await this.findByEmail(email);
    if (existingAdmin) return existingAdmin;

    const hashedPassword = await argon2.hash(
      process.env.ADMIN_INITIAL_PASSWORD
    );

    const referralCode = await this.referralCodeUtil.encodeReferralCode();
    const admin = await this.prisma.customer.create({
      data: {
        name: 'Admin',
        email: email,
        password: hashedPassword,
        customerRole: CustomerRole.ADMIN,
        referralCode,
      },
    });

    // Write the output to a text file
    // writeDataToFile(`${this.constructor.name}/admin-creation.txt`, admin);

    await this.emailService.sendAdminRegistrationEmail(admin);

    return admin;
  }

  async registerAdmin(input: RegisterAdminInput): Promise<boolean> {
    const payload = await this.authService.verifyEmailToken(input.token);

    const admin = await this.prisma.customer.findUnique({
      where: { customerId: payload.sub },
    });

    if (!admin || admin.customerRole !== CustomerRole.ADMIN) {
      throw new NotFoundException(ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    }

    const hashedPassword = await argon2.hash(input.newPassword);

    const updatedAdmin = await this.prisma.customer.update({
      where: { customerId: payload.sub },
      data: {
        name: input.newName,
        password: hashedPassword,
        emailStatus: EmailStatus.VERIFIED,
        customerStatus: CustomerStatus.ACTIVE,
      },
    });

    await this.emailService.sendWelcomeEmail(updatedAdmin, true);

    return true;
  }

  async getCustomer(customerId: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { customerId },
      include: {
        image: true,
      },
    });

    return customer;
  }
}
