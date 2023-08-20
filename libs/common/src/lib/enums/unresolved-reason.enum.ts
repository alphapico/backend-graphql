import { registerEnumType } from '@nestjs/graphql';

export enum UnresolvedReason {
  UNDERPAID = 'UNDERPAID',
  OVERPAID = 'OVERPAID',
  DELAYED = 'DELAYED',
  MULTIPLE = 'MULTIPLE',
  OTHER = 'OTHER',
}

registerEnumType(UnresolvedReason, { name: 'UnresolvedReason' });
