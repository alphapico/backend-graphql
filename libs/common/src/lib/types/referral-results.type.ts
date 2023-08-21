import {
  CustomerStatus as PrismaCustomerStatus,
  EmailStatus as PrismaEmailStatus,
} from '@prisma/client';

export type ReferralResults = Array<{
  referrer_id: number;
  referee_id: number;
  tier: number;
  customerId: number;
  name: string;
  email: string;
  customerStatus: (typeof PrismaCustomerStatus)[keyof typeof PrismaCustomerStatus];
  emailStatus: (typeof PrismaEmailStatus)[keyof typeof PrismaEmailStatus];
  referralCode: string;
  referralCustomerId: number;
}>;
