import { ERROR_MESSAGES } from '@charonium/common';
import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class SetDefaultWalletInput {
  @Field(() => Int, {
    description:
      'The unique identifier of the wallet that is to be set as the default. ' +
      'This ID must be that of an existing wallet owned by the customer.',
  })
  @IsNumber()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  walletId: number;

  @Field(() => Int, {
    description:
      'The identifier of the customer who owns the wallet. ' +
      'This ensures that the default wallet is set within the context of the correct customer account.',
  })
  @IsNumber()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  customerId: number;
}
