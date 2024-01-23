import { CustomerStatus as PrismaCustomerStatus } from '@prisma/client';

export type ReferrerResults = Array<{
  customerId: number;
  name?: string;
  customerStatus: (typeof PrismaCustomerStatus)[keyof typeof PrismaCustomerStatus];
  referralCustomerId?: number;
  tier: number;
}>;
