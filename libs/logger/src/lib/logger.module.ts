import { PrismaService } from '@styx/prisma';
import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Module({
  providers: [LoggerService, PrismaService],
  exports: [LoggerService],
})
export class LoggerModule {}
