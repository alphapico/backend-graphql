import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { CryptoType, ERROR_MESSAGES } from '@charonium/common';

@InputType()
export class UpdateWalletInput {
  @Field()
  @IsNumber()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  customerId: number;

  @Field()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  walletId: number;

  @Field({ nullable: true })
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsOptional()
  address?: string;

  @Field(() => CryptoType, { nullable: true })
  @IsEnum(CryptoType, { message: ERROR_MESSAGES.VAL.INVALID_CRYPTO_TYPE })
  @IsOptional()
  cryptoType?: CryptoType;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
