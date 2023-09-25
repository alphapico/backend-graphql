import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaModule, PrismaService } from '@charonium/prisma';
import {
  ERROR_MESSAGES,
  JSONWEBTOKEN_ERROR_MESSAGES,
  ReferralCodeUtil,
} from '@charonium/common';
import { Customer } from './dto/customer.dto';
import { CustomerStatus, EmailStatus } from '@prisma/client';
import { BadRequestException, forwardRef } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { AuthService } from '../auth/auth.service';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';
import { LogService } from '../log/log.service';
import { ConfigService } from '../config/config.service';

describe('CustomerService', () => {
  let customerService: CustomerService;
  // let emailService: EmailService;
  // let jwtService: JwtService;

  beforeEach(async () => {
    // const jwtServiceMock = {
    //   sign: jest.fn(),
    // };
    const authServiceMock = {}; // Provide mock implementation if necessary
    const emailServiceMock = {}; // Provide mock implementation if necessary
    const prismaServiceMock = {}; // Provide mock implementation if necessary
    const referralCodeUtilMock = {}; // Provide mock implementation if necessary
    const logServiceMock = {};
    const configServiceMock = {};

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: EmailService, useValue: emailServiceMock },
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: ReferralCodeUtil, useValue: referralCodeUtilMock },
        { provide: LogService, useValue: logServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        // {
        //   provide: JwtService,
        //   useValue: jwtServiceMock,
        // }
      ],
    }).compile();

    customerService = moduleRef.get<CustomerService>(CustomerService);
    // emailService = moduleRef.get<EmailService>(EmailService);
    // jwtService = moduleRef.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(customerService).toBeDefined();
    // expect(emailService).toBeDefined();
    // expect(jwtService).toBeDefined();
  });

  // describe('createVerificationLink', () => {
  //   it('should generate the correct verification link', () => {
  //     const mockCustomer: Customer = {
  //       customerId: 1,
  //       name: 'John Doe',
  //       email: 'john.doe@example.com',
  //       customerStatus: CustomerStatus.PENDING,
  //       emailStatus: EmailStatus.UNVERIFIED,
  //     };

  //     const jwtToken = 'test-jwt-token';
  //     jest.spyOn(jwtService, 'sign').mockReturnValue(jwtToken);

  //     const expectedVerificationLink = `${process.env.FRONTEND_DOMAIN}/verify-email?token=${jwtToken}`;

  //     const verificationLink =
  //       emailService.createVerificationLink(mockCustomer);

  //     expect(verificationLink).toEqual(expectedVerificationLink);
  //   });
  // });

  // describe('verifyEmail', () => {
  //   let prismaServiceMock: Partial<PrismaService>;
  //   let jwtServiceMock: Partial<JwtService>;

  //   beforeEach(async () => {
  //     prismaServiceMock = {
  //       customer: {
  //         findUnique: jest.fn(),
  //         update: jest.fn(),
  //         // Add the following lines to satisfy the type requirements
  //         findUniqueOrThrow: jest.fn(),
  //         findFirst: jest.fn(),
  //         findFirstOrThrow: jest.fn(),
  //         findMany: jest.fn(),
  //         create: jest.fn(),
  //         createMany: jest.fn(),
  //         delete: jest.fn(),
  //         deleteMany: jest.fn(),
  //         updateMany: jest.fn(),
  //         upsert: jest.fn(),
  //         count: jest.fn(),
  //         aggregate: jest.fn(),
  //         groupBy: jest.fn(),
  //       },
  //     };

  //     jwtServiceMock = {
  //       sign: jest.fn(),
  //       verify: jest.fn().mockImplementation(() => ({
  //         sub: 1,
  //         email: 'john.doe@example.com',
  //       })),
  //     };

  //     const moduleRef = await Test.createTestingModule({
  //       providers: [
  //         CustomerService,
  //         {
  //           provide: PrismaService,
  //           useValue: prismaServiceMock,
  //         },
  //         {
  //           provide: JwtService,
  //           useValue: jwtServiceMock,
  //         },
  //         ReferralCodeUtil,
  //       ],
  //     }).compile();

  //     customerService = moduleRef.get<CustomerService>(CustomerService);
  //   });

  //   // Test cases go here
  //   it('should return true for a valid token', async () => {
  //     const token = 'valid-token';

  //     const mockCustomer = {
  //       customerId: 1,
  //       name: 'John Doe',
  //       email: 'john.doe@example.com',
  //       customerStatus: CustomerStatus.PENDING,
  //       emailStatus: EmailStatus.UNVERIFIED,
  //     };

  //     (prismaServiceMock.customer.findUnique as jest.Mock).mockResolvedValue(
  //       mockCustomer
  //     );

  //     const result = await emailService.verifyEmail(token);

  //     expect(jwtServiceMock.verify).toHaveBeenCalledWith(token);
  //     expect(prismaServiceMock.customer.findUnique).toHaveBeenCalledWith({
  //       where: { customerId: 1 },
  //     });
  //     expect(prismaServiceMock.customer.update).toHaveBeenCalledWith({
  //       where: { customerId: 1 },
  //       data: {
  //         emailStatus: EmailStatus.VERIFIED,
  //         customerStatus: CustomerStatus.ACTIVE,
  //       },
  //     });
  //     expect(result).toBeTruthy();
  //   });

  //   it('should throw a BadRequestException for an expired token', async () => {
  //     const token = 'expired-token';

  //     const expiredTokenError = new Error();
  //     expiredTokenError.name = JSONWEBTOKEN_ERROR_MESSAGES.TokenExpiredError;

  //     jwtServiceMock.verify = jest.fn().mockImplementation(() => {
  //       throw expiredTokenError;
  //     });

  //     try {
  //       await emailService.verifyEmail(token);
  //     } catch (error) {
  //       expect(jwtServiceMock.verify).toHaveBeenCalledWith(token);
  //       expect(error).toBeInstanceOf(BadRequestException);
  //       expect(error.message).toBe(ERROR_MESSAGES.EMAIL_ERROR.TOKEN_EXPIRED);
  //     }
  //   });

  //   it('should throw a BadRequestException for an invalid token', async () => {
  //     const token = 'invalid-token';

  //     jwtServiceMock.verify = jest.fn().mockImplementation(() => {
  //       throw new Error();
  //     });

  //     await expect(emailService.verifyEmail(token)).rejects.toThrow(
  //       BadRequestException
  //     );
  //     expect(jwtServiceMock.verify).toHaveBeenCalledWith(token);
  //   });

  //   it('should throw a BadRequestException for a customer not found', async () => {
  //     const token = 'valid-token';
  //     const mockPayload = { sub: 1, email: 'john.doe@example.com' };

  //     jwtServiceMock.verify = jest.fn().mockReturnValue(mockPayload);
  //     prismaServiceMock.customer.findUnique = jest.fn().mockResolvedValue(null);

  //     await expect(emailService.verifyEmail(token)).rejects.toThrow(
  //       BadRequestException
  //     );
  //     expect(jwtServiceMock.verify).toHaveBeenCalledWith(token);
  //     expect(prismaServiceMock.customer.findUnique).toHaveBeenCalledWith({
  //       where: { customerId: mockPayload.sub },
  //     });
  //   });

  //   it('should return false for an already verified customer', async () => {
  //     const token = 'valid-token';
  //     const mockPayload = { sub: 1, email: 'john.doe@example.com' };
  //     const mockCustomer = {
  //       customerId: 1,
  //       name: 'John Doe',
  //       email: 'john.doe@example.com',
  //       customerStatus: CustomerStatus.ACTIVE,
  //       emailStatus: EmailStatus.VERIFIED,
  //     };

  //     jwtServiceMock.verify = jest.fn().mockReturnValue(mockPayload);
  //     prismaServiceMock.customer.findUnique = jest
  //       .fn()
  //       .mockResolvedValue(mockCustomer);

  //     const result = await emailService.verifyEmail(token);

  //     expect(jwtServiceMock.verify).toHaveBeenCalledWith(token);
  //     expect(prismaServiceMock.customer.findUnique).toHaveBeenCalledWith({
  //       where: { customerId: mockPayload.sub },
  //     });
  //     expect(result).toBeFalsy();
  //   });
  // });
});
