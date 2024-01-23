import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { PrismaService } from '@charonium/prisma';

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const prismaServiceMock = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
