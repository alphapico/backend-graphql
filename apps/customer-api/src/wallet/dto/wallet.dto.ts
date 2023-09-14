import { CryptoType } from '@charonium/common';
import { CryptoType as PrismaCryptoType } from '@prisma/client';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Wallet {
  @Field(() => Int)
  walletId: number;

  @Field(() => Int)
  customerId: number;

  @Field()
  address: string;

  @Field(() => CryptoType)
  cryptoType: (typeof PrismaCryptoType)[keyof typeof PrismaCryptoType];

  @Field()
  isDefault: boolean;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
