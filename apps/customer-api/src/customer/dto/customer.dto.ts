import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CustomerStatus } from '@charonium/common';
import { EmailStatus } from '@charonium/common';
import {
  Customer as PrismaCustomer,
  CustomerStatus as PrismaCustomerStatus,
  EmailStatus as PrismaEmailStatus,
} from '@prisma/client';
import { Image } from '../../upload/dto/image.dto';
import { Charge } from '../../commission/dto/charge.dto';
import { Commission } from '../../commission/dto/commission.dto';
import { Wallet } from '../../wallet/dto/wallet.dto';
import { PaginationMixin } from '../../commission/dto/pagination.mixin';
import { PurchaseActivity } from '../../commission/dto/purchase-activity.dto';

type CustomerOmitted = Omit<
  PrismaCustomer,
  | 'emailStatus'
  | 'customerRole'
  | 'password'
  | 'tokenVersion'
  | 'createdAt'
  | 'updatedAt'
>;

type CustomerPartial = Partial<
  Pick<CustomerOmitted, 'referralCode' | 'referralCustomerId'>
> &
  Omit<CustomerOmitted, 'referralCode' | 'referralCustomerId'>;

@ObjectType()
export class Customer implements CustomerPartial {
  @Field(() => Int)
  customerId: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => EmailStatus)
  emailStatus: (typeof PrismaEmailStatus)[keyof typeof PrismaEmailStatus];

  @Field(() => CustomerStatus)
  customerStatus: (typeof PrismaCustomerStatus)[keyof typeof PrismaCustomerStatus];

  @Field({ nullable: true })
  referralCode?: string;

  @Field(() => Int, { nullable: true })
  referralCustomerId?: number;

  @Field(() => Customer, { nullable: true })
  referrer?: Customer;

  @Field(() => [Customer], { nullable: true })
  referees?: Customer[];

  @Field(() => [PurchaseActivity], { nullable: 'items' })
  purchaseActivities: PurchaseActivity[];

  @Field(() => [Charge], { nullable: 'items' })
  charges: Charge[];

  @Field(() => [Commission], { nullable: 'items' })
  commissions: Commission[];

  @Field(() => [Wallet], { nullable: 'items' })
  wallets: Wallet[];

  @Field(() => Image, { nullable: true })
  image?: Image;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class CustomerResult extends PaginationMixin(Customer) {}
