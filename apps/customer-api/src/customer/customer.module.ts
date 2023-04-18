import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerResolver } from './customer.resolver';
import { ReferralCodeUtil } from '@charonium/common/utils/referralCode.util';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [
    CustomerResolver,
    CustomerService,
    PrismaService,
    ReferralCodeUtil,
  ],
})
export class CustomerModule {}
