import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { PrismaModule } from '@styx/prisma';
import { EmailResolver } from './email.resolver';
import { AuthModule } from '../auth/auth.module';
import { LoggerModule } from '@styx/logger';

@Module({
  imports: [AuthModule, PrismaModule, LoggerModule],
  providers: [EmailResolver, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
