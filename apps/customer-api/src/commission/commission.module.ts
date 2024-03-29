import { Module } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { PrismaModule } from '@styx/prisma';
import { CommissionResolver } from './commission.resolver';

@Module({
  imports: [PrismaModule],
  providers: [CommissionService, CommissionResolver],
})
export class CommissionModule {}
