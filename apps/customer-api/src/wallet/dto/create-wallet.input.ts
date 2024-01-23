import { CryptoType, ERROR_MESSAGES } from '@charonium/common';
import { InputType, Field, Int } from '@nestjs/graphql';
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
  @Field(() => Int, {
    description:
      'The unique identifier of the customer to whom the wallet belongs. ' +
      "This field must be populated with an existing customer's ID.",
  })
  @IsNumber()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  customerId: number;

  @Field({
    description:
      'The blockchain address for the wallet. This should be a valid string ' +
      "that represents the wallet's address on the blockchain.",
  })
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  address: string;

  @Field(() => CryptoType, {
    description:
      'The type of cryptocurrency that the wallet will hold. Valid options ' +
      "are defined by the `CryptoType` enum, such as 'DAI', 'USDC', 'ETH', etc. " +
      'This field must match one of the predefined cryptocurrency types.',
  })
  @IsEnum(CryptoType, { message: ERROR_MESSAGES.VAL.INVALID_CRYPTO_TYPE })
  cryptoType: CryptoType;

  @Field({
    nullable: true,
    description:
      'An optional boolean flag indicating whether this wallet should be set ' +
      'as the default wallet for the associated customer. If `true`, this wallet ' +
      'is considered the primary wallet for transactions. If omitted, the wallet ' +
      'is not set as the default by default.',
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
