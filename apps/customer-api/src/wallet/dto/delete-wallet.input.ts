import { ERROR_MESSAGES } from '@charonium/common';
import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class DeleteWalletInput {
  @Field()
  @IsNumber()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  walletId: number;

  @Field()
  @IsNumber()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  customerId: number;
}
