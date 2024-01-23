import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ERROR_MESSAGES, Trim, ImageType } from '@charonium/common';
import { ImageType as PrismaImageType } from '@prisma/client';

@InputType()
export class UploadInput {
  @Field(() => ImageType, {
    description:
      'This will be folder path in S3 bucket. The `type` can be either "PACKAGE" or "CUSTOMER" as defined in `enum ImageType`',
  })
  @IsEnum(ImageType, { message: ERROR_MESSAGES.VAL.INVALID_IMAGE_TYPE })
  type: (typeof PrismaImageType)[keyof typeof PrismaImageType];

  @Field({ description: 'Can be either "jpg", "jpeg", "png", "gif" or "webp"' })
  @Trim()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  fileExtension: string;
}
