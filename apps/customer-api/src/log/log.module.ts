import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { PrismaModule } from '@charonium/prisma';

@Module({
  imports: [PrismaModule],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
