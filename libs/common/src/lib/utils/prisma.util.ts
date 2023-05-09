import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PRISMA_ERROR_MESSAGES } from '../constants';

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
