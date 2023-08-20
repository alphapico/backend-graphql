import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';
import { Trim } from '@charonium/common';
import { ERROR_MESSAGES } from '@charonium/common';

@InputType()
export class CreateChargeInput {
  @Field()
  @IsNumber()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  amount: number;

  @Field()
  @Trim()
  @IsString()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  currency: string;

  @Field()
  @Trim()
  @IsString()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  description: string;

  @Field()
  @Trim()
  @IsUrl(
    { require_tld: process.env.NODE_ENV !== 'production' },
    { message: ERROR_MESSAGES.VAL.IS_URL }
  )
  redirect_url: string;

  @Field()
  @Trim()
  @IsUrl(
    { require_tld: process.env.NODE_ENV !== 'production' },
    { message: ERROR_MESSAGES.VAL.IS_URL }
  )
  cancel_url: string;

  //   @Field({ nullable: true })
  //   pricing_type?: 'no_price' | 'fixed_price';
}
