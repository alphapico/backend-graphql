import { ImageType } from '@styx/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ImageType as PrismaImageType } from '@prisma/client';

@ObjectType()
export class Image {
  @Field(() => Int)
  imageId: number;

  @Field(() => String)
  path: string;

  @Field(() => ImageType)
  type: (typeof PrismaImageType)[keyof typeof PrismaImageType];

  @Field(() => Int, { nullable: true })
  customerId?: number;

  @Field(() => Int, { nullable: true })
  packageId?: number;

  @Field(() => Date)
  createdAt: Date;
}
