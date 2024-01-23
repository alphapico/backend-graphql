// referrer-result.dto.ts
import { Field, ObjectType, Int } from '@nestjs/graphql';
import { CustomerStatus } from '@styx/common';
import { CustomerStatus as PrismaCustomerStatus } from '@prisma/client';

@ObjectType()
export class ReferrerResult {
  @Field(() => Int)
  customerId: number;

  @Field({ nullable: true })
  name?: string;

  @Field(() => CustomerStatus)
  customerStatus: (typeof PrismaCustomerStatus)[keyof typeof PrismaCustomerStatus];

  @Field(() => Int, { nullable: true })
  referralCustomerId?: number;

  @Field(() => Int)
  tier: number;
}
