import { Field, Int, Float, ObjectType } from '@nestjs/graphql';
import { Customer } from '../../customer/dto/customer.dto';
import { Payment } from './payment.dto';
import { PurchaseActivity } from './purchase-activity.dto';
import { Commission } from './commission.dto';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class Charge {
  @Field(() => Int)
  chargeId: number;

  @Field(() => Int, { nullable: true })
  customerId?: number;

  @Field(() => Customer, { nullable: true })
  customer?: Customer;

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

  @Field(() => [Payment])
  payments: Payment[];

  @Field(() => [Commission])
  commissions: Commission[];

  @Field(() => PurchaseActivity, { nullable: true })
  purchaseActivity?: PurchaseActivity;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
