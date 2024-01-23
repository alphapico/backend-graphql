import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PresignedPost {
  @Field()
  url: string;

  @Field(() => [FieldRecord])
  fields: FieldRecord[];
}

@ObjectType()
export class FieldRecord {
  @Field()
  key: string;

  @Field()
  value: string;
}
