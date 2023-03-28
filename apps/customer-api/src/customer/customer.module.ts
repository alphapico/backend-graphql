import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerResolver } from './customer.resolver';
import { ReferralCodeUtil } from '@charonium/common/utils/referralCode.util';

@Module({
  providers: [
    CustomerResolver,
    CustomerService,
    PrismaService,
    ReferralCodeUtil,
  ],
})
export class CustomerModule {}
