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
  @Field()
  @Trim()
  @IsString({ message: ERROR_MESSAGES.VAL.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  path: string;

  @Field(() => ImageType)
  @IsEnum(ImageType, { message: ERROR_MESSAGES.VAL.INVALID_IMAGE_TYPE })
  type: (typeof PrismaImageType)[keyof typeof PrismaImageType];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt({ message: ERROR_MESSAGES.VAL.IS_INT })
  customerId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt({ message: ERROR_MESSAGES.VAL.IS_INT })
  packageId?: number;
}
