import { registerEnumType } from '@nestjs/graphql';

export enum EmailStatus {
  UNVERIFIED = 'UNVERIFIED',
  VERIFIED = 'VERIFIED',
}

registerEnumType(EmailStatus, { name: 'EmailStatus' });
