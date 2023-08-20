import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenPackage {
  @Field(() => Int)
  packageId: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  tokenAmount: number;

  @Field()
  price: number;

  @Field()
  currency: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
