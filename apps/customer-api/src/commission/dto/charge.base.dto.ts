import { Field, Int, Float, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { PaginationMixin } from './pagination.mixin';

@ObjectType()
export class ChargeBase {
  @Field(() => Int)
  chargeId: number;

  @Field(() => Int, { nullable: true })
  customerId?: number;

  @Field()
  code: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  pricingType: string;

  @Field(() => GraphQLJSON)
  pricing: JSON;

  @Field(() => GraphQLJSON, { nullable: true })
  addresses?: JSON;

  @Field(() => GraphQLJSON, { nullable: true })
  exchangeRates?: JSON;

  @Field(() => GraphQLJSON, { nullable: true })
  localExchangeRates?: JSON;

  @Field()
  hostedUrl: string;

  @Field({ nullable: true })
  cancelUrl?: string;

  @Field({ nullable: true })
  redirectUrl?: string;

  @Field(() => Float)
  feeRate: number;

  @Field()
  expiresAt: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  paymentThreshold?: JSON;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class ChargeBaseResult extends PaginationMixin(ChargeBase) {}
