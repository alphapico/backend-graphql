import {
  ERROR_MESSAGES,
  CONFIG,
  IsCurrencyFormat,
  IsSupportedCurrency,
} from '@charonium/common';
import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';

@InputType()
export class TokenPackageUpdateInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  tokenAmount?: number;

  @Field({
    nullable: true,
    description: 'Price should be in the format of 100 , 100.0 or 100.00 ',
  })
  @IsOptional()
  @IsNumber()
  @IsCurrencyFormat()
  price?: number;

  @Field({
    nullable: true,
    description: 'Only "EUR", "USD" and "GBP" are supporting currencies',
  })
  @IsOptional()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsSupportedCurrency()
  currency?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  isActive?: boolean;
}
