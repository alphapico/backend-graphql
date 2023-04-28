import { InputType, Field } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';
import { Trim } from '@charonium/common';
import { ERROR_MESSAGES } from '@charonium/common';

@InputType()
export class EmailInput {
  @Field()
  @Trim()
  @IsEmail({}, { message: ERROR_MESSAGES.VAL.IS_EMAIL })
  email: string;
}
