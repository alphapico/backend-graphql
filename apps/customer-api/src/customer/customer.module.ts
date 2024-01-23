import { Module, forwardRef } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { PrismaModule } from '@charonium/prisma';
import { CustomerResolver } from './customer.resolver';
import { ReferralCodeUtil } from '@charonium/common';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';
import { LoggerModule } from '@charonium/logger';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [
    EmailModule,
    forwardRef(() => AuthModule),
    PrismaModule,
    LoggerModule,
  ],
  providers: [
    CustomerResolver,
    CustomerService,
    ReferralCodeUtil,
    ConfigService,
  ],
  exports: [CustomerService],
})
export class CustomerModule {}
