import { Module } from '@nestjs/common';
import { ReferralResolver } from './referral.resolver';
import { ReferralService } from './referral.service';
import { PrismaService } from '@charonium/prisma';
@Module({
  providers: [ReferralResolver, ReferralService, PrismaService],
})
export class ReferralModule {}
