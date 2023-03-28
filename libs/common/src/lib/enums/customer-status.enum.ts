import { registerEnumType } from '@nestjs/graphql';

export enum CustomerStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

registerEnumType(CustomerStatus, { name: 'CustomerStatus' });
