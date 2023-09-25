import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { PrismaModule } from '@charonium/prisma';
import { ConfigResolver } from './config.resolver';

@Module({
  imports: [PrismaModule],
  providers: [ConfigService, ConfigResolver],
  exports: [ConfigService],
})
export class ConfigModule {}
