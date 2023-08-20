import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { PaginationMixin } from './pagination.mixin';

@ObjectType()
export class PurchaseActivityBase {
  @Field(() => Int)
  purchaseActivityId: number;

  @Field(() => Int, { nullable: true })
  chargeId?: number;

  @Field(() => Int, { nullable: true })
  packageId?: number;

  @Field(() => Int, { nullable: true })
  tokenPriceId?: number;

  @Field(() => Float, { nullable: true })
  tokenAmount?: number;

  @Field()
  amount: number;

  @Field()
  currency: string;

  @Field()
  purchaseConfirmed: boolean;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class PurchaseActivityBaseResult extends PaginationMixin(
  PurchaseActivityBase
) {}
