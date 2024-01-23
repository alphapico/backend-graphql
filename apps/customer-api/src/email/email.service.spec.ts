import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { PrismaService } from '@styx/prisma';
import { LoggerService } from '@styx/logger';
import { AuthService } from '../auth/auth.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const authServiceMock = {}; // Provide mock implementation if necessary
    const prismaServiceMock = {}; // Provide mock implementation if necessary
    const loggerServiceMock = {}; // Provide mock implementation if necessary

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: LoggerService, useValue: loggerServiceMock },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
