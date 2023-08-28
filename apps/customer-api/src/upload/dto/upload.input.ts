import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ERROR_MESSAGES, Trim, ImageType } from '@charonium/common';
import { ImageType as PrismaImageType } from '@prisma/client';

@InputType()
export class UploadInput {
  @Field(() => ImageType)
  @IsEnum(ImageType, { message: ERROR_MESSAGES.VAL.INVALID_IMAGE_TYPE })
  type: (typeof PrismaImageType)[keyof typeof PrismaImageType];

  @Field()
  @Trim()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  fileExtension: string;
}
