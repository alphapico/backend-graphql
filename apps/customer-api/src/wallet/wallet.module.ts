import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletResolver } from './wallet.resolver';
import { PrismaService } from '@styx/prisma';

@Module({
  providers: [WalletResolver, WalletService, PrismaService],
})
export class WalletModule {}
