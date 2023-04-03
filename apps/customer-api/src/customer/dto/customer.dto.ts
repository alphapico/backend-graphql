import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CustomerStatus } from '@charonium/common/enums/customer-status.enum';
import {
  Customer as PrismaCustomer,
  CustomerStatus as PrismaCustomerStatus,
} from '@prisma/client';

type CustomerOmitted = Omit<
  PrismaCustomer,
  'emailVerified' | 'password' | 'tokenVersion' | 'createdAt' | 'updatedAt'
>;

type CustomerPartial = Partial<
  Pick<CustomerOmitted, 'referralCode' | 'referralCustomerId'>
> &
  Omit<CustomerOmitted, 'referralCode' | 'referralCustomerId'>;

@ObjectType()
export class Customer implements CustomerPartial {
  @Field(() => ID)
  customerId: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => CustomerStatus)
  customerStatus: (typeof PrismaCustomerStatus)[keyof typeof PrismaCustomerStatus];

  @Field({ nullable: true })
  referralCode?: string;

  @Field(() => ID, { nullable: true })
  referralCustomerId?: number;

  @Field(() => Customer, { nullable: true })
  referrer?: Customer;

  @Field(() => Customer, { nullable: true })
  referree?: Customer;
}
