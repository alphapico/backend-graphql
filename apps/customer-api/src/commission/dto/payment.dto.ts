import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Charge } from './charge.dto';
import { PaymentStatus, UnresolvedReason } from '@charonium/common';
import {
  PaymentStatus as PrismaPaymentStatus,
  UnresolvedReason as PrismaUnresolvedReason,
} from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class Payment {
  @Field(() => Int)
  paymentId: number;

  @Field(() => Int, { nullable: true })
  chargeId?: number;

  @Field(() => Charge, { nullable: true })
  charge?: Charge;

  @Field({ nullable: true })
  network?: string;

  @Field({ nullable: true })
  transaction?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  value?: JSON;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => PaymentStatus)
  paymentStatus: (typeof PrismaPaymentStatus)[keyof typeof PrismaPaymentStatus];

  @Field(() => UnresolvedReason, { nullable: true })
  unresolvedReason?: (typeof PrismaUnresolvedReason)[keyof typeof PrismaUnresolvedReason];

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt: Date;
}
