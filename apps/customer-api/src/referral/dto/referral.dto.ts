import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Referree {
  @Field(() => Int)
  customerId: number;
  @Field()
  customerName: string;
}
@ObjectType()
export class Referrer {
  @Field(() => Int)
  customerId: number;
  @Field()
  customerName: string;
}
@ObjectType()
export class TierMap {
  @Field(() => Referrer)
  referrer: Referrer;
  @Field(() => [Referree])
  referrees: Referree[];
}
@ObjectType()
export class ReferralMap {
  @Field(() => Int)
  tier: number;
  @Field(() => [TierMap])
  tierMaps: TierMap[];
}
