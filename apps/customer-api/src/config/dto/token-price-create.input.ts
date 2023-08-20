import {
  ERROR_MESSAGES,
  IsCurrencyFormat,
  IsSupportedCurrency,
} from '@charonium/common';
import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class TokenPriceCreateInput {
  @Field()
  @IsNumber()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  @IsCurrencyFormat()
  price: number;

  @Field()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  @IsSupportedCurrency()
  currency: string;
}
