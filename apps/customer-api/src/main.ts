/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app/app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,

      // exceptionFactory: (errors) => {
      //   const messages = errors.map(
      //     (error) =>
      //       `${
      //         error.property
      //       } has failed the following constraints: ${Object.values(
      //         error.constraints
      //       ).join(', ')}`
      //   );

      //   return new BadRequestException(messages);
      // },
    })
  );

  // const globalPrefix = 'api';
  // app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3333;
  await app.listen(port);

  // Logger.log(
  //   `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  // );

  // Handle shutdown signals
  process.on('SIGTERM', async () => {
    Logger.log('SIGTERM signal received. Gracefully shutting down...');
    await app.close();
  });

  process.on('SIGINT', async () => {
    Logger.log('SIGINT signal received. Gracefully shutting down...');
    await app.close();
  });
}

bootstrap();
