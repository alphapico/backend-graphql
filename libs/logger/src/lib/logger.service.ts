import { PrismaService } from '@charonium/prisma';
import { Injectable } from '@nestjs/common';
import { LogStatus } from '@prisma/client';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { format as dateFormat } from 'date-fns';

type JsonInput =
  | null
  | boolean
  | number
  | string
  | JsonInput[]
  | { [key: string]: JsonInput };

interface ErrorOptions {
  message: string;
  trace?: string;
  serviceName?: string;
  methodName?: string;
  metadata?: any;
  errorCategory?: string;
}

interface InfoOptions {
  message: string;
  serviceName?: string;
  methodName?: string;
  metadata?: any;
  infoCategory?: string;
}

@Injectable()
export class LoggerService {
  private readonly logger: winston.Logger;

  constructor(private readonly prisma: PrismaService) {
    const logDirectory = this.getLogDirectory();
    this.logger = winston.createLogger({
      level: 'info', // Set the default level to 'error'
      format: winston.format.combine(
        //winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
        // winston.format.printf((info) => {
        //   return `${info.timestamp} [${info.level}]: ${info.message}`;
        // })
      ),
      transports: [
        new DailyRotateFile({
          level: 'info',
          filename: `${logDirectory}/logging-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });
  }

  private getLogDirectory(): string {
    switch (process.env.TEST_TYPE) {
      case 'unit':
        return 'logs/unit-tests';
      case 'e2e':
        return 'logs/e2e-tests';
      default:
        return 'logs';
    }
  }

  error(options: ErrorOptions): any {
    const sanitizedMetadata = this.sanitizeData(options.metadata);
    this.logger.error(options.message, {
      timestamp: dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      level: 'error',
      category: options.errorCategory,
      serviceName: options.serviceName,
      methodName: options.methodName,
      ...sanitizedMetadata,
      trace: options.trace,
    });
  }

  info(options: InfoOptions): any {
    const sanitizedMetadata = this.sanitizeData(options.metadata);
    this.logger.info(options.message, {
      timestamp: dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      level: 'info',
      infoCategory: options.infoCategory,
      serviceName: options.serviceName,
      methodName: options.methodName,
      ...sanitizedMetadata,
    });
  }

  sanitizeData(data: any): any {
    const sensitiveFields = ['password', 'oldPassword', 'newPassword'];

    // Recursive function to sanitize nested data
    function sanitize(obj: any) {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (sensitiveFields.includes(key)) {
            obj[key] = '***REDACTED***';
          } else if (typeof obj[key] === 'object') {
            // If the value is an object or array, recurse into it
            sanitize(obj[key]);
          }
        }
      }
    }

    sanitize(data);
    return data;
  }

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
