import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsOptional,
} from 'class-validator';
import { Trim } from '@charonium/common';
import { INPUT } from '@charonium/common';
import { ERROR_MESSAGES } from '@charonium/common';

@InputType()
export class RegisterInput {
  @Field()
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

  @Field()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  @MinLength(INPUT.MIN_PASSWORD_LENGTH, {
    message: ERROR_MESSAGES.VAL.MIN_LENGTH,
  })
  @MaxLength(INPUT.MAX_PASSWORD_LENGTH, {
    message: ERROR_MESSAGES.VAL.MAX_LENGTH,
  })
  password: string;

  @Field({ nullable: true })
  @Trim()
  @IsOptional()
  referralCode?: string;
}
