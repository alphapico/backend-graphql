import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { PrismaModule } from '@charonium/prisma';
import { EmailResolver } from './email.resolver';
import { AuthModule } from '../auth/auth.module';
import { LoggerModule } from '@charonium/logger';

@Module({
  imports: [AuthModule, PrismaModule, LoggerModule],
  providers: [EmailResolver, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
