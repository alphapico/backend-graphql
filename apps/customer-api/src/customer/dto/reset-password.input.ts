import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength, IsNotEmpty, MaxLength } from 'class-validator';
import { INPUT } from '@charonium/common';
import { ERROR_MESSAGES } from '@charonium/common';

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  token: string;

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
