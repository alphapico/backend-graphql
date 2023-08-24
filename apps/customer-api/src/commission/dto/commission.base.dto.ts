import { Field, Int, Float, ObjectType } from '@nestjs/graphql';
import { PaginationMixin } from './pagination.mixin';

@ObjectType()
export class CommissionBase {
  @Field(() => Int)
  commissionId: number;

  @Field(() => Int, { nullable: true })
  customerId?: number;

  @Field(() => Int, { nullable: true })
  chargeId?: number;

  @Field(() => Int)
  tier: number;

  @Field(() => Float)
  commissionRate: number;

  @Field()
  amount: number;

  @Field()
  currency: string;

  @Field()
  isTransferred: boolean;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class CommissionBaseResult extends PaginationMixin(CommissionBase) {}
