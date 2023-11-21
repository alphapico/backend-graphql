import {
  CONFIG,
  ERROR_MESSAGES,
  IsCurrencyFormat,
  IsSupportedCurrency,
} from '@charonium/common';
import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class TokenPackageCreateInput {
  @Field()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  description?: string;

  @Field()
  @IsNumber()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  tokenAmount: number;

  @Field({
    description:
      'You can set price in the format of 100 , 100.0 or 100.00 . Set in the format of 100.000 will be invalid',
  })
  @IsNumber()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  @IsCurrencyFormat()
  price: number;

  @Field({
    description: 'Only "EUR", "USD" and "GBP" are supporting currencies',
  })
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  @IsSupportedCurrency()
  currency: string;

  @Field()
  @IsBoolean()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  isActive: boolean;
}
