import {
  ERROR_MESSAGES,
  IsCurrencyFormat,
  IsSupportedCurrency,
} from '@charonium/common';
import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class TokenPriceCreateInput {
  @Field({
    description:
      'You can set price in the format of 2 , 2.0 or 2.00 . Set in the format of 2.000 will be invalid',
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
}
