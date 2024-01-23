import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ERROR_MESSAGES, ImageType, Trim } from '@charonium/common';
import { ImageType as PrismaImageType } from '@prisma/client';

@InputType()
export class SaveImageInput {
  @Field({
    description:
      'Send a full path like this: `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key-from-generatePresignedUrl}`',
  })
  @Trim()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  path: string;

  @Field(() => ImageType, {
    description: 'Can be either "PACKAGE" or "CUSTOMER"',
  })
  @IsEnum(ImageType, { message: ERROR_MESSAGES.VAL.INVALID_IMAGE_TYPE })
  type: (typeof PrismaImageType)[keyof typeof PrismaImageType];

  @Field(() => Int, {
    nullable: true,
    description:
      'Optional. You must include either `packageId` or `customerId` dependng on the `type`',
  })
  @IsOptional()
  @IsInt({ message: ERROR_MESSAGES.VAL.IS_INT })
  customerId?: number;

  @Field(() => Int, {
    nullable: true,
    description:
      'Optional. You must include either `packageId` or `customerId` dependng on the `type`',
  })
  @IsOptional()
  @IsInt({ message: ERROR_MESSAGES.VAL.IS_INT })
  packageId?: number;
}
