import { CustomerRole } from '@prisma/client';

export interface IJwtPayload {
  sub: number;
  email: string;
  role: CustomerRole;
  iat?: number;
  exp?: number;
}
