import { Module } from '@nestjs/common';
import { ReferralResolver } from './referral.resolver';
import { ReferralService } from './referral.service';
import { PrismaService } from '@styx/prisma';
import { ConfigService } from '../config/config.service';
@Module({
  providers: [ReferralResolver, ReferralService, PrismaService, ConfigService],
})
export class ReferralModule {}
