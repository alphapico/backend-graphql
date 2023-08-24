import { ObjectType, Field } from '@nestjs/graphql';
import { CustomerRole as PrismaCustomerRole } from '@prisma/client';
import { CustomerRole } from '@charonium/common';

@ObjectType()
export class JwtPayload {
  @Field()
  sub: number;

  @Field()
  email: string;

  @Field(() => CustomerRole)
  role: (typeof PrismaCustomerRole)[keyof typeof PrismaCustomerRole];

  @Field()
  name: string;

  @Field({ nullable: true })
  iat?: number;

  @Field({ nullable: true })
  exp?: number;
}
