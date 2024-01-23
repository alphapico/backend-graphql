import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : [],
    });
  }

  async onModuleInit() {
    await this.connectWithRetry(20, 2, 10000);

    // Add middleware for logging
    if (process.env.NODE_ENV === 'development') {
      this.$use(async (params, next) => {
        const before = Date.now();
        const result = await next(params);
        const after = Date.now();
        console.log(
          `Query: ${params.model}.${params.action}`,
          `Duration: ${after - before}ms`,
          `Data: ${JSON.stringify(params.args, null, 2)}`
        );
        return result;
      });
    }
  }

  private async connectWithRetry(
    attempts: number,
    delayFactor: number,
    maxDelay: number
  ): Promise<void> {
    for (let i = 0; i < attempts; i++) {
      try {
        await this.$connect();
        // should put this on file during production
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
