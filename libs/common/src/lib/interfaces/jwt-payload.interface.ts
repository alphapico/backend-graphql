import { CustomerRole } from '@prisma/client';

export interface IJwtPayload {
  sub: number;
  name: string;
  email: string;
  role: CustomerRole;
  iat?: number;
  exp?: number;
}
