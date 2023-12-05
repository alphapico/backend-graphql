import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { LoggerService } from '@charonium/logger';
import { ModuleRef } from '@nestjs/core';
import { appInstance } from '../global-ref';
import { ERROR_MESSAGES } from '../constants';

export function LogError(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  if (process.env.TEST_TYPE === 'unit') return descriptor;

  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    const moduleRef = appInstance?.get<ModuleRef>(ModuleRef);
    if (!moduleRef) {
      throw new Error(ERROR_MESSAGES.MODULEREF_NOT_AVAILABLE);
    }
    const logService = moduleRef.get(LoggerService, { strict: false });

    try {
      return await originalMethod.apply(context, args);
    } catch (error) {
      if (logService) {
        if (isError(error) && logService) {
          logService.error({
            message: error.message,
            trace: error.stack,
            serviceName: context?.constructor?.name,
            methodName: propertyKey,
            metadata: { args },
            errorCategory: error.constructor?.name,
          });
        }
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException(error.message);
      }

      if (
        error instanceof Prisma.PrismaClientInitializationError ||
        error instanceof Prisma.PrismaClientKnownRequestError ||
        error instanceof Prisma.PrismaClientUnknownRequestError ||
        error instanceof Prisma.PrismaClientRustPanicError
      ) {
        throw new InternalServerErrorException(error.message);
      }

      // If the error is not one of the Prisma errors, re-throw it
      throw error;
    }
  };

  return descriptor;
}

function isError(err: any): err is Error {
  return err instanceof Error;
}
