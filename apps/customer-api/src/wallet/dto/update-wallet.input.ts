import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { CryptoType, ERROR_MESSAGES } from '@styx/common';

@InputType()
export class UpdateWalletInput {
  @Field(() => Int, {
    description:
      'The customer identifier for whom the wallet is being updated. ' +
      'Must correspond to the ID of an existing customer in the system.',
  })
  @IsNumber()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  customerId: number;

  @Field(() => Int, {
    description:
      'The unique identifier of the wallet to be updated. ' +
      'This ID must refer to an existing wallet associated with the customer.',
  })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  walletId: number;

  @Field(() => String, {
    nullable: true,
    description:
      'An optional new blockchain address to update the wallet with. ' +
      'If provided, it should be a valid blockchain address string.',
  })
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsOptional()
  address?: string;

  @Field(() => CryptoType, {
    nullable: true,
    description:
      'An optional cryptocurrency type to update the wallet with. ' +
      'If provided, it must be one of the types defined in the `CryptoType` enum.',
  })
  @IsEnum(CryptoType, { message: ERROR_MESSAGES.VAL.INVALID_CRYPTO_TYPE })
  @IsOptional()
  cryptoType?: CryptoType;

  @Field(() => Boolean, {
    nullable: true,
    description:
      'An optional boolean indicating if the wallet should be set as the default wallet. ' +
      'If `true`, this wallet will be marked as the primary wallet for the customer. ' +
      'If `false` or omitted, the wallet will not be affected in terms of default status.',
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
