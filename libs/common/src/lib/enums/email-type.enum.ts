import { registerEnumType } from '@nestjs/graphql';

export enum EmailType {
  VERIFICATION = 'VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

registerEnumType(EmailType, { name: 'EmailType' });
