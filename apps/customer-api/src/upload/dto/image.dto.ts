import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Image {
  @Field(() => Int)
  imageId: number;

  @Field(() => String)
  path: string;

  @Field(() => Date)
  createdAt: Date;
}
