import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Config {
  @Field(() => Int)
  configId: number;

  @Field(() => Int)
  referralViewLevel: number;

  @Field()
  isReferralCodeEnabled: boolean;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
