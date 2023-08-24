import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  IsOptional,
} from 'class-validator';
import { Trim } from '@charonium/common';
import { ERROR_MESSAGES } from '@charonium/common';

@InputType()
export class PurchaseTokensInput {
  @Field()
  @Trim()
  @IsString()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  redirect_url: string;

  @Field()
  @Trim()
  @IsUrl(
    { require_tld: process.env.NODE_ENV !== 'production' },
    { message: ERROR_MESSAGES.VAL.IS_URL }
  )
  cancel_url: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  packageId?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  quantity?: number;
}
