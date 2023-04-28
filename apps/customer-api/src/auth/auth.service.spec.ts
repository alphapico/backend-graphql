import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { CustomerService } from '../customer/customer.service';
import { PrismaService } from '@charonium/prisma';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const customerServiceMock = {}; // Provide mock implementation if necessary
    const prismaServiceMock = {}; // Provide mock implementation if necessary
    const accessTokenJwtServiceMock = {}; // Provide mock implementation if necessary
    const refreshTokenJwtServiceMock = {}; // Provide mock implementation if necessary
    const emailTokenJwtServiceMock = {}; // Provide mock implementation if necessary

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '15m' },
        }),
      ],
      providers: [
        AuthService,
        { provide: CustomerService, useValue: customerServiceMock },
        { provide: PrismaService, useValue: prismaServiceMock },
        {
          provide: 'ACCESS_TOKEN_JWT_SERVICE',
          useValue: accessTokenJwtServiceMock,
        },
        {
          provide: 'REFRESH_TOKEN_JWT_SERVICE',
          useValue: refreshTokenJwtServiceMock,
        },
        {
          provide: 'EMAIL_TOKEN_JWT_SERVICE',
          useValue: emailTokenJwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
