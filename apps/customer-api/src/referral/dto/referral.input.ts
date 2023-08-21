import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ERROR_MESSAGES } from '@charonium/common';

@InputType()
export class ReferralInput {
  @Field()
  @IsNumber()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  referrerId: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  startLevel?: number;
}
