import { Module } from '@nestjs/common';
import { CoinbaseService } from './coinbase/coinbase.service';
import { CoinbaseResolver } from './coinbase/coinbase.resolver';
import { PrismaModule } from '@charonium/prisma';
import { CoinbaseController } from './coinbase/coinbase.controller';
import { EmailModule } from '../email/email.module';
import { CommissionModule } from '../commission/commission.module';
import { CommissionService } from '../commission/commission.service';

@Module({
  imports: [EmailModule, CommissionModule, PrismaModule],
  controllers: [CoinbaseController],
  providers: [CoinbaseService, CoinbaseResolver, CommissionService],
})
export class PaymentGatewayModule {}
