import { registerEnumType } from '@nestjs/graphql';

export enum PaymentStatus {
  NEW = 'NEW',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  UNRESOLVED = 'UNRESOLVED',
  RESOLVED = 'RESOLVED',
  EXPIRED = 'EXPIRED',
  CANCELED = 'CANCELED',
  MANUALLY_ACCEPTED = 'MANUALLY_ACCEPTED',
  MANUALLY_UNACCEPTED = 'MANUALLY_UNACCEPTED',
}

registerEnumType(PaymentStatus, { name: 'PaymentStatus' });
