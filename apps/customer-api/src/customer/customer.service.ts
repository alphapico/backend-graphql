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
import { Customer, CustomerResult } from './dto/customer.dto';
import {
  CustomerRole,
  LogStatus,
  Prisma,
  Customer as PrismaCustomer,
} from '@prisma/client';
import {
  CONFIG,
  ERROR_MESSAGES,
  PRISMA_ERROR_MESSAGES,
  ReferralCodeUtil,
} from '@charonium/common';
import graphqlFields from 'graphql-fields';
// import { validate } from 'class-validator';
// import { ClassValidationException } from '@charonium/common';

import { EmailStatus, CustomerStatus } from '@prisma/client';
import { ResetPasswordInput } from './dto/reset-password.input';
import { AuthService } from '../auth/auth.service';
import { EmailService } from '../email/email.service';
import { RegisterAdminInput } from './dto/register-admin.input';
import { LogService } from '../log/log.service';
import { ChangePasswordInput } from './dto/change-password.input';
import { ConfigService } from '../config/config.service';
@Injectable()
export class CustomerService {
  private cache: NodeCache;
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private emailService: EmailService,
    private logService: LogService,
    private referralCodeUtil: ReferralCodeUtil,
    private configService: ConfigService
  ) {
    this.cache = new NodeCache();
  }

  async findByEmail(email: string): Promise<PrismaCustomer | null> {
    return this.prisma.customer.findUnique({ where: { email } });
  }

  async findByCustomerId(customerId: number): Promise<PrismaCustomer | null> {
    return this.prisma.customer.findUnique({
      where: { customerId },
    });
  }

  async updateCustomerStatus(
    customer: PrismaCustomer
  ): Promise<PrismaCustomer> {
    return this.prisma.customer.update({
      where: {
        customerId: customer.customerId,
      },
      data: {
        customerStatus: customer.customerStatus,
      },
    });
  }

  async register(input: RegisterInput): Promise<PrismaCustomer> {
    // const validationErrors = await validate(input);
    // if (validationErrors.length > 0) {
    //   throw new ClassValidationException(validationErrors);
    // }

    let referralCustomerId: number | undefined;

    const isReferralCodeEnabled =
      process.env.NODE_ENV === 'test'
        ? false
        : (await this.configService.getReferralCodeEnabledStatus()) || true;

    if (isReferralCodeEnabled && !input.referralCode) {
      throw new BadRequestException(ERROR_MESSAGES.REFERRAL_CODE_REQUIRED);
    }

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

  async createAdmin(email: string): Promise<PrismaCustomer> {
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

  async changePassword(
    customerId: number,
    input: ChangePasswordInput
  ): Promise<boolean> {
    const customer = await this.prisma.customer.findUnique({
      where: { customerId },
    });

    if (!customer) {
      throw new BadRequestException(ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    }

    const valid = await argon2.verify(customer.password, input.oldPassword);
    if (!valid) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_OLD_PASSWORD);
    }

    const hashedPassword = await argon2.hash(input.newPassword);

    await this.prisma.customer.update({
      where: { customerId },
      data: {
        password: hashedPassword,
      },
    });

    return true;
  }

  async getCustomer(info: any, customerId: number) {
    const fields = graphqlFields(info);
    // console.log(fields);

    const include: any = {};
    if (fields.image) {
      include.image = true;
    }
    if (fields.charges) {
      include.charges = true;
    }
    if (fields.commissions) {
      include.commissions = true;
    }
    if (fields.wallets) {
      include.wallets = true;
    }
    if (fields.purchaseActivities) {
      include.purchaseActivities = true;
    }
    if (fields.referrer) {
      include.referrer = true;
    }
    if (fields.referees) {
      include.referees = true;
    }

    // Check if the include object is empty
    const isIncludeEmpty = Object.keys(include).length === 0;
    const findUniqueArgs: any = {
      where: { customerId },
    };
    if (!isIncludeEmpty) {
      findUniqueArgs.include = include;
    }

    const customer = (await this.prisma.customer.findUnique(
      findUniqueArgs
    )) as any as Customer;

    if (!customer) {
      throw new NotFoundException(ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    }

    // Format the commission amount field
    if (customer.commissions) {
      customer.commissions.forEach((commission) => {
        if (commission.amount) {
          commission.amount = commission.amount / 100;
        }
      });
    }

    return customer;
  }

  async getCustomers(
    info: any,
    cursor?: number,
    limit = 10,
    customerStatus?: CustomerStatus,
    emailStatus?: EmailStatus,
    customerRole?: CustomerRole,
    customerId?: number
  ): Promise<CustomerResult> {
    const fields = graphqlFields(info);
    console.log(fields);

    const include: any = {};
    if (fields.data) {
      if (fields.data.image) {
        include.image = true;
      }
      if (fields.data.charges) {
        include.charges = true;
      }
      if (fields.data.commissions) {
        include.commissions = true;
      }
      if (fields.data.wallets) {
        include.wallets = true;
      }
      if (fields.data.purchaseActivities) {
        include.purchaseActivities = true;
      }
      if (fields.data.referrer) {
        include.referrer = true;
      }
      if (fields.data.referees) {
        include.referees = true;
      }
    }

    const whereClause: Prisma.CustomerWhereInput = {};

    if (customerStatus) {
      whereClause.customerStatus = customerStatus;
    }

    if (emailStatus) {
      whereClause.emailStatus = emailStatus;
    }

    if (customerRole) {
      whereClause.customerRole = customerRole;
    }

    if (customerId) {
      whereClause.customerId = customerId;
    }

    // Check if the include object is empty
    const isIncludeEmpty = Object.keys(include).length === 0;
    const findManyArgs: any = {
      take: limit + 1, // Fetch one extra record to determine if there's a next page
      cursor: cursor ? { customerId: cursor } : undefined,
      orderBy: [{ customerId: 'asc' }], //lowest values represent the earliest records
      where: whereClause,
    };

    if (!isIncludeEmpty) {
      findManyArgs.include = include;
    }

    const records = (await this.prisma.customer.findMany(
      findManyArgs
    )) as any as Customer[];

    const hasNextPage = records.length > limit;
    if (hasNextPage) {
      // Remove the extra record
      records.pop();
    }

    // Format the commission amount field
    if (records) {
      records.forEach((record) => {
        if (record.commissions) {
          record.commissions.forEach((commission) => {
            if (commission.amount) {
              commission.amount = commission.amount / 100;
            }
          });
        }
      });
    }

    return {
      data: records,
      nextPageCursor: hasNextPage
        ? records[records.length - 1].customerId
        : null,
    };
  }
}
