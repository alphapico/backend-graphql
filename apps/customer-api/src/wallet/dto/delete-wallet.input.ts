import { ERROR_MESSAGES } from '@charonium/common';
import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class DeleteWalletInput {
  @Field(() => Int, {
    description:
      'The unique identifier of the wallet to be deleted. This ID must correspond ' +
      'to an existing wallet associated with the customer specified by the `customerId` field.',
  })
  @IsNumber()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  walletId: number;

  @Field(() => Int, {
    description:
      'The identifier of the customer who owns the wallet. This field ensures that ' +
      'the deletion operation is scoped to wallets under the ownership of the specified customer.',
  })
  @IsNumber()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  customerId: number;
}
