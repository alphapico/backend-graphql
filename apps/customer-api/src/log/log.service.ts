import { JsonInput } from '@charonium/common';
import { PrismaService } from '@charonium/prisma';
import { Injectable } from '@nestjs/common';
import { LogStatus } from '@prisma/client';

@Injectable()
export class LogService {
  constructor(private readonly prisma: PrismaService) {}

  async createLogEntry({
    level,
    message,
    code,
    statusCode,
    details,
    serviceName,
    methodName,
    requestId,
    customerId,
    customerEmail,
  }: {
    level: LogStatus;
    message: string;
    code?: string;
    statusCode?: number;
    details?: JsonInput;
    serviceName?: string;
    methodName?: string;
    requestId?: number;
    customerId?: number;
    customerEmail?: string;
  }) {
    await this.prisma.log.create({
      data: {
        level,
        message,
        code,
        statusCode,
        details,
        serviceName,
        methodName,
        requestId,
        customerId,
        customerEmail,
      },
    });
  }
}
