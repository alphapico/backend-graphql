import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, MinLength, MaxLength, IsString } from 'class-validator';
import { Trim } from '@styx/common';
import { INPUT } from '@styx/common';
import { ERROR_MESSAGES } from '@styx/common';

@InputType()
export class RegisterAdminInput {
  @Field()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  token: string;

  @Field()
  @Trim()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  @MinLength(INPUT.MIN_NAME_LENGTH, { message: ERROR_MESSAGES.VAL.MIN_LENGTH })
  @MaxLength(INPUT.MAX_NAME_LENGTH, { message: ERROR_MESSAGES.VAL.MAX_LENGTH })
  newName: string;

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
