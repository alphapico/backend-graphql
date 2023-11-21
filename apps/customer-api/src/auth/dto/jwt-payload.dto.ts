import { ObjectType, Field, Directive, Int } from '@nestjs/graphql';
import { CustomerRole as PrismaCustomerRole } from '@prisma/client';
import { CustomerRole } from '@charonium/common';

@ObjectType()
export class JwtPayload {
  @Field(() => Int)
  sub: number;

  @Field()
  email: string;

  @Field(() => CustomerRole)
  role: (typeof PrismaCustomerRole)[keyof typeof PrismaCustomerRole];

  @Field()
  name: string;

  @Field(() => Int, { nullable: true })
  iat?: number;

  @Field(() => Int, { nullable: true })
  exp?: number;
}
