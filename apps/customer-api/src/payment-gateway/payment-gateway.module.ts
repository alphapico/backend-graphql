import { Module } from '@nestjs/common';
import { CoinbaseService } from './coinbase/coinbase.service';
import { CoinbaseResolver } from './coinbase/coinbase.resolver';
import { PrismaModule } from '@styx/prisma';
import { CoinbaseController } from './coinbase/coinbase.controller';
import { EmailModule } from '../email/email.module';
import { CommissionModule } from '../commission/commission.module';
import { CommissionService } from '../commission/commission.service';
import { LoggerService } from '@styx/logger';

@Module({
  imports: [EmailModule, CommissionModule, PrismaModule],
  controllers: [CoinbaseController],
  providers: [
    CoinbaseService,
    CoinbaseResolver,
    CommissionService,
    LoggerService,
  ],
})
export class PaymentGatewayModule {}
