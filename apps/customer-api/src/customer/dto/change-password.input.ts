// change-password.input.ts
import { ERROR_MESSAGES, INPUT } from '@charonium/common';
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  @MinLength(INPUT.MIN_PASSWORD_LENGTH, {
    message: ERROR_MESSAGES.VAL.MIN_LENGTH,
  })
  @MaxLength(INPUT.MAX_PASSWORD_LENGTH, {
    message: ERROR_MESSAGES.VAL.MAX_LENGTH,
  })
  oldPassword: string;

  @Field()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  @MinLength(INPUT.MIN_PASSWORD_LENGTH, {
    message: ERROR_MESSAGES.VAL.MIN_LENGTH,
  })
  @MaxLength(INPUT.MAX_PASSWORD_LENGTH, {
    message: ERROR_MESSAGES.VAL.MAX_LENGTH,
  })
  newPassword: string;
}
