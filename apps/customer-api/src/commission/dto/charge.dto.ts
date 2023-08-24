import { Field, ObjectType } from '@nestjs/graphql';
import { Customer } from '../../customer/dto/customer.dto';
import { Payment } from './payment.dto';
import { PurchaseActivity } from './purchase-activity.dto';
import { Commission } from './commission.dto';
import { ChargeBase } from './charge.base.dto';
import { PaginationMixin } from './pagination.mixin';

@ObjectType()
export class Charge extends ChargeBase {
  @Field(() => Customer, { nullable: true })
  customer?: Customer;

  @Field(() => [Payment], { nullable: 'items' })
  payments: Payment[];

  @Field(() => [Commission], { nullable: 'items' })
  commissions: Commission[];

  @Field(() => PurchaseActivity, { nullable: true })
  purchaseActivity?: PurchaseActivity;
}

@ObjectType()
export class ChargeResult extends PaginationMixin(Charge) {}
