import { Charge, Payment } from '@prisma/client';

export type ChargePayments = Charge & {
  payments: Payment[];
};
