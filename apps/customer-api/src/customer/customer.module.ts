import { Module, forwardRef } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { PrismaModule } from '@styx/prisma';
import { CustomerResolver } from './customer.resolver';
import { ReferralCodeUtil } from '@styx/common';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';
import { LoggerModule } from '@styx/logger';
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
