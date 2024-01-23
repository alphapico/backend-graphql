import { Field, ObjectType } from '@nestjs/graphql';
import { Charge } from './charge.dto';
import { TokenPackage } from '../../config/dto/token-package.dto';
import { TokenPrice } from '../../config/dto/token-price.dto';
import { PurchaseActivityBase } from './purchase-activity.base.dto';
import { PaginationMixin } from './pagination.mixin';

@ObjectType()
export class PurchaseActivity extends PurchaseActivityBase {
  @Field(() => Charge, { nullable: true })
  charge?: Charge;

  @Field(() => TokenPackage, { nullable: true })
  package?: TokenPackage;

  @Field(() => TokenPrice, { nullable: true })
  tokenPrice?: TokenPrice;
}

@ObjectType()
export class PurchaseActivityResult extends PaginationMixin(PurchaseActivity) {}
