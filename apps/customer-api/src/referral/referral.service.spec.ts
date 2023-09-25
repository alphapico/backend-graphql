import { Test, TestingModule } from '@nestjs/testing';
import { ReferralService } from './referral.service';
import { PrismaService } from '@charonium/prisma';
import { ConfigService } from '../config/config.service';

describe('ReferralService', () => {
  let service: ReferralService;

  beforeEach(async () => {
    const prismaServiceMock = {};
    const configServiceMock = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralService,
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<ReferralService>(ReferralService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
