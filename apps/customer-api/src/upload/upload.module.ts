import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { PrismaModule } from '@charonium/prisma';
import { UploadResolver } from './upload.resolver';

@Module({
  imports: [PrismaModule],
  providers: [UploadResolver, UploadService],
})
export class UploadModule {}
