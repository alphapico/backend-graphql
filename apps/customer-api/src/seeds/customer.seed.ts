import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { PrismaService } from '@styx/prisma';
import dotenv from 'dotenv';
dotenv.config({ path: '.serve.env' });
async function seedCustomers(prisma: PrismaService) {
  await prisma.customer.updateMany({
    data: {
      customerStatus: 'ACTIVE',
    },
  });
}
async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  try {
    // Seed customers
    await seedCustomers(prisma); // 50 is the number of fake customers you want to generate

    console.log('Seeding completed.');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
    await app.close();
  }
}

main();
