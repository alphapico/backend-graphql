import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  IsOptional,
} from 'class-validator';
import { Trim } from '@styx/common';
import { ERROR_MESSAGES } from '@styx/common';

@InputType()
export class PurchaseTokensInput {
  @Field({
    description:
      'The URL to which users will be redirected after a succesful payment action. ' +
      'It must be a live URL; localhost URLs are not accepted. One workaround for ' +
      'local development is to use a service like ngrok to expose your local server to ' +
      'the internet. For example, you could register and install ngrok, then run the ' +
      'command `ngrok http <FRONTEND_PORT>` to obtain a real URL that can be used here.',
  })
  @Trim()
  @IsString()
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  redirect_url: string;

  @Field({
    description:
      'The URL to which users will be redirected after a cancelled payment action. ' +
      'It must be a live URL; localhost URLs are not accepted. One workaround for ' +
      'local development is to use a service like ngrok to expose your local server to ' +
      'the internet. For example, you could register and install ngrok, then run the ' +
      'command `ngrok http <FRONTEND_PORT>` to obtain a real URL that can be used here.',
  })
  @Trim()
  @IsUrl(
    { require_tld: process.env.NODE_ENV !== 'production' },
    { message: ERROR_MESSAGES.VAL.IS_URL }
  )
  cancel_url: string;

  @Field(() => Int, {
    nullable: true,
    description:
      'An optional field used to specify a pre-defined package of tokens for purchase. ' +
      'If provided, the price, currency, and token amount will be determined based on ' +
      'the identified package. If not provided, the `quantity` field must be specified to ' +
      'determine the purchase details.',
  })
  @IsNumber()
  @IsOptional()
  packageId?: number;

  @Field(() => Int, {
    nullable: true,
    description:
      'An optional field used to specify the number of tokens to purchase when a `packageId` ' +
      'is not provided. The total amount will be calculated based on the latest token price. ' +
      'If `packageId` is provided, this field will be ignored.',
  })
  @IsNumber()
  @IsOptional()
  quantity?: number;
}
