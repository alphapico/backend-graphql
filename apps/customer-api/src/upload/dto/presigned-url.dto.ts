import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PresignedUrl {
  @Field()
  presignedUrl: string;

  @Field()
  key: string;
}
