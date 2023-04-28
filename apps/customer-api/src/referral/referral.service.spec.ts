import { Test, TestingModule } from '@nestjs/testing';
import { ReferralService } from './referral.service';
import { PrismaService } from '@charonium/prisma';

describe('ReferralService', () => {
  let service: ReferralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReferralService, PrismaService],
    }).compile();

    service = module.get<ReferralService>(ReferralService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
