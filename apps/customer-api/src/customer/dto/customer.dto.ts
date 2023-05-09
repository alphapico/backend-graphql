import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CustomerStatus } from '@charonium/common';
import { EmailStatus } from '@charonium/common';
import {
  Customer as PrismaCustomer,
  CustomerStatus as PrismaCustomerStatus,
  EmailStatus as PrismaEmailStatus,
} from '@prisma/client';

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
  referrees?: Customer[];
}
