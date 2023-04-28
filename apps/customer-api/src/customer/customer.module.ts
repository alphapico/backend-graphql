import { Module, forwardRef } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { PrismaModule } from '@charonium/prisma';
import { CustomerResolver } from './customer.resolver';
import { ReferralCodeUtil } from '@charonium/common';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [EmailModule, forwardRef(() => AuthModule), PrismaModule],
  providers: [CustomerResolver, CustomerService, ReferralCodeUtil],
  exports: [CustomerService],
})
export class CustomerModule {}
