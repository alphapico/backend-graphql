import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ERROR_MESSAGES, PRISMA_ERROR_MESSAGES } from '../constants';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export async function retryPrismaOperation<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoffFactor = 2
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === PRISMA_ERROR_MESSAGES.COMMON.DB_SERVER_UNREACHABLE &&
      retries > 0
    ) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      const newDelay = delay * backoffFactor;
      return await retryPrismaOperation(
        operation,
        retries - 1,
        newDelay,
        backoffFactor
      );
    }
    throw error;
  }
}

export function handlePrismaError(error: any) {
  console.error('An error occurred while performing the transaction:', error);

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new BadRequestException(error.message);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new InternalServerErrorException(error.message);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    throw new InternalServerErrorException(error.message);
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    throw new InternalServerErrorException(error.message);
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    throw new InternalServerErrorException(error.message);
  }

  // If the error doesn't match any known type, throw a generic error
  throw new InternalServerErrorException(ERROR_MESSAGES.PRISMA.DATABASE_ERROR);
}
