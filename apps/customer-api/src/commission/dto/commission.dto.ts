import { Field, ObjectType } from '@nestjs/graphql';
import { Customer } from '../../customer/dto/customer.dto';
import { Charge } from './charge.dto';
import { CommissionBase } from './commission.base.dto';
import { PaginationMixin } from './pagination.mixin';

@ObjectType()
export class Commission extends CommissionBase {
  @Field(() => Customer, { nullable: true })
  customer?: Customer;

  @Field(() => Charge, { nullable: true })
  charge?: Charge;
}

@ObjectType()
export class CommissionResult extends PaginationMixin(Commission) {}
