import { Field, ObjectType } from '@nestjs/graphql';
import { Customer } from '../../customer/dto/customer.dto';

@ObjectType()
export class ReferralEntry {
  @Field(() => Customer)
  referrer: Customer;

  @Field(() => [Customer])
  referees: Customer[];
}

@ObjectType()
export class ReferralMap {
  @Field(() => String)
  level: string;

  @Field(() => [ReferralEntry])
  referralEntries: ReferralEntry[];
}
