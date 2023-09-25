import { CryptoType, ERROR_MESSAGES } from '@charonium/common';
import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';

@InputType()
export class CreateWalletInput {
  @Field()
  @IsNumber()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  customerId: number;

  @Field()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  address: string;

  @Field(() => CryptoType)
  @IsEnum(CryptoType, { message: ERROR_MESSAGES.VAL.INVALID_CRYPTO_TYPE })
  cryptoType: CryptoType;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
