import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.connectWithRetry(20, 2, 10000);
  }

  private async connectWithRetry(
    attempts: number,
    delayFactor: number,
    maxDelay: number
  ): Promise<void> {
    for (let i = 0; i < attempts; i++) {
      try {
        await this.$connect();
        console.log('Connected to the database successfully');
        break;
      } catch (err) {
        console.log(
          `Failed to connect to the database (attempt ${i + 1}):`,
          err
        );

        // Exponential backoff calculation
        const delay = Math.min(Math.pow(delayFactor, i) * 100, maxDelay);

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
