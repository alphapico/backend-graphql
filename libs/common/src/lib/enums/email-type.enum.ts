import { registerEnumType } from '@nestjs/graphql';

export enum EmailType {
  VERIFICATION = 'VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  ADMIN_REGISTRATION = 'ADMIN_REGISTRATION',
  WELCOME = 'WELCOME',
}

registerEnumType(EmailType, { name: 'EmailType' });
