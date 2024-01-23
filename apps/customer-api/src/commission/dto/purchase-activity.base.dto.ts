import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { PaginationMixin } from './pagination.mixin';
import { PaymentStatus } from '@styx/common';
import { PaymentStatus as PrismaPaymentStatus } from '@prisma/client';

@ObjectType()
export class PurchaseActivityBase {
  @Field(() => Int)
  purchaseActivityId: number;

  @Field()
  purchaseCode: string;

  @Field(() => Int, { nullable: true })
  chargeId?: number;

  @Field(() => Int, { nullable: true })
  customerId?: number;

  @Field(() => Int, { nullable: true })
  packageId?: number;

  @Field(() => Int, { nullable: true })
  tokenPriceId?: number;

  @Field(() => Float, { nullable: true })
  tokenAmount?: number;

  @Field()
  price: number;

  @Field()
  amount: number;

  @Field()
  currency: string;

  @Field()
  purchaseConfirmed: boolean;

  @Field(() => PaymentStatus)
  paymentStatus: (typeof PrismaPaymentStatus)[keyof typeof PrismaPaymentStatus];

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class PurchaseActivityBaseResult extends PaginationMixin(
  PurchaseActivityBase
) {}
