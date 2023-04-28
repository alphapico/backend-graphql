import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { PrismaModule } from '@charonium/prisma';
import { EmailResolver } from './email.resolver';
import { AuthModule } from '../auth/auth.module';
import { LogModule } from '../log/log.module';

@Module({
  imports: [AuthModule, PrismaModule, LogModule],
  providers: [EmailResolver, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
