import { CustomerRole, PrismaClient } from '@prisma/client';
import axios from 'axios';
import { execSync } from 'child_process';
import { healthUrl } from './test-setup';
import fs from 'fs-extra';
import path from 'path';

export const prisma = new PrismaClient();
const RETRIES = 5;
const INITIAL_WAIT_TIME_MS = 1000;

export async function connectToDatabase() {
  await prisma.$connect();
}

export async function disconnectFromDatabase() {
  await prisma.$disconnect();
}

export async function clearDatabase() {
  const tableNames = Object.keys(prisma);

  const deletePromises = tableNames.map((tableName) => {
    if (prisma[tableName]) {
      const deleteMany = prisma[tableName].deleteMany;
      if (typeof deleteMany === 'function') {
        // Only delete non-admin customers
        if (tableName === 'customer') {
          return deleteMany.call(prisma[tableName], {
            where: { customerRole: { not: CustomerRole.ADMIN } },
          });
        }
        return deleteMany.call(prisma[tableName]);
      }
    }
  });

  await Promise.all(deletePromises);
}

export async function waitForHealthyDBService(
  serviceName: string
): Promise<void> {
  const wait = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i < RETRIES; i++) {
    try {
      // execSync(
      //   `docker-compose -f docker-compose.e2e.yml --env-file .e2e.env ps | grep ${serviceName} | grep '(healthy)'`
      // );
      // console.log(`Service ${serviceName} is healthy.`);
      // return;
      const output = execSync(
        `docker-compose -f docker-compose.e2e.yml --env-file .e2e.env exec ${serviceName} pg_isready -U ${process.env.POSTGRES_USER} -d ${process.env.POSTGRES_DB}`
      );
      if (output && output.toString().includes('accepting connections')) {
        console.log(`Service ${serviceName} is healthy.`);
        return;
      }
    } catch (error) {
      // using exponential backoff (with dampening) in retrying the health check
      const waitTimeMs = INITIAL_WAIT_TIME_MS * 2 ** i;
      console.log(
        `Waiting for service ${serviceName} to be healthy. Retrying in ${
          waitTimeMs / 1000
        } seconds...`
      );
      await wait(waitTimeMs);
    }
  }

  throw new Error(
    `Service ${serviceName} is not healthy after several attempts.`
  );
}

export async function waitForAPIReady(): Promise<void> {
  for (let i = 0; i < RETRIES; i++) {
    try {
      const response = await axios.get(healthUrl);

      if (
        response.status === 200 &&
        response.data.message === 'Server is ready'
      ) {
        console.log('Server is ready');
        return;
      }
    } catch (error) {
      console.error(
        `Attempt ${i + 1} to check server readiness failed: ${error.message}`
      );
    }

    // Exponential backoff with dampening
    const waitTimeMs = INITIAL_WAIT_TIME_MS * 2 ** i;
    console.log(
      `Waiting for server to be ready. Retrying in ${
        waitTimeMs / 1000
      } seconds...`
    );
    await new Promise((resolve) => setTimeout(resolve, waitTimeMs));
  }

  throw new Error('Server is not ready after several attempts.');
}

export function execAndWait(cmd, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const output = execSync(cmd, options);
      resolve(output);
    } catch (error) {
      reject(error);
    }
  });
}

export const clearDebugsFolder = async () => {
  const debugsFolderPath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    'customer-api-e2e',
    'debugs'
  );
  try {
    await fs.emptyDir(debugsFolderPath);
    console.log('Cleared debugs folder:', debugsFolderPath);
  } catch (err) {
    console.error('Error while clearing debugs folder:', err);
  }
};
