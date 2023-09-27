import { INestApplication } from '@nestjs/common';

export let appInstance: INestApplication | null = null;

export function setAppInstance(app: INestApplication) {
  appInstance = app;
}
