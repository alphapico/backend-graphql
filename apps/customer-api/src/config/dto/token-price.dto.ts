import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenPrice {
  @Field(() => Int)
  tokenPriceId: number;

  @Field()
  currency: string;

  @Field()
  price: number;

  @Field({ nullable: true })
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt: Date;
}
