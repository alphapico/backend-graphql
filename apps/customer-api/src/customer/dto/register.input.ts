import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsOptional,
} from 'class-validator';
import { Trim } from '@styx/common';
import { INPUT } from '@styx/common';
import { ERROR_MESSAGES } from '@styx/common';

@InputType()
export class RegisterInput {
  @Field({
    description:
      'The name must be a string with a length between 2 and 50 characters',
  })
  @Trim()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  @MinLength(INPUT.MIN_NAME_LENGTH, { message: ERROR_MESSAGES.VAL.MIN_LENGTH })
  @MaxLength(INPUT.MAX_NAME_LENGTH, { message: ERROR_MESSAGES.VAL.MAX_LENGTH })
  name: string;

  @Field()
  @Trim()
  @IsEmail({}, { message: ERROR_MESSAGES.VAL.IS_EMAIL })
  email: string;

  @Field({
    description:
      'The password must be a string with a length between 8 and 100 characters',
  })
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  @MinLength(INPUT.MIN_PASSWORD_LENGTH, {
    message: ERROR_MESSAGES.VAL.MIN_LENGTH,
  })
  @MaxLength(INPUT.MAX_PASSWORD_LENGTH, {
    message: ERROR_MESSAGES.VAL.MAX_LENGTH,
  })
  password: string;

  @Field({ nullable: true, description: 'The referral code is optional' })
  @Trim()
  @IsOptional()
  referralCode?: string;
}
