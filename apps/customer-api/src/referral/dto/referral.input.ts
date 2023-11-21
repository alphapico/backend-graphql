import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ERROR_MESSAGES } from '@charonium/common';

@InputType()
export class ReferralInput {
  @Field(() => Int, {
    description:
      'The unique identifier (`customerId`) of the referrer at the top level of the referral hierarchy.',
  })
  @IsNumber()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  referrerId: number;

  @Field(() => Int, {
    nullable: true,
    description:
      'The starting level for the referral hierarchy naming scheme. Providing a value of 0 will name the levels as `level0`, `level1`, `level2`, and so on, incrementing the level number as the hierarchy descends. You can start at any number, and the naming scheme will increment accordingly.',
  })
  @IsNumber()
  @IsOptional()
  startLevel?: number;
}
