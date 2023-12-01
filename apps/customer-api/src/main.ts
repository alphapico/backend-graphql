import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
// import cookieParser from 'cookie-parser';

import { AppModule } from './app/app.module';
import { PrismaService } from '@charonium/prisma';
import { CustomerService } from './customer/customer.service';
import { setAppInstance } from '@charonium/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setAppInstance(app);
  const prismaService = app.get(PrismaService);
  const customerService = app.get(CustomerService);
  await prismaService.enableShutdownHooks(app);

  // app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_DOMAIN,
    credentials: true, // To allow sending cookies and authorization headers
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await customerService.createAdmin(adminEmail);
  }

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
