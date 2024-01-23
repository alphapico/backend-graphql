import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PresignedUrl {
  @Field({
    description: 'Temporary URL for frontend to use upload to S3 bucket',
  })
  presignedUrl: string;

  @Field({ description: 'Basically a file path in S3 bucket' })
  key: string;
}
