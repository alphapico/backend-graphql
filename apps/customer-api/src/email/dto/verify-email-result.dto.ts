import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class VerifyEmailResult {
  @Field({ nullable: true })
  success?: boolean;

  @Field({ nullable: true })
  message?: string;
}
