import { registerEnumType } from '@nestjs/graphql';

export enum CustomerRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER',
}

registerEnumType(CustomerRole, { name: 'CustomerRole' });
