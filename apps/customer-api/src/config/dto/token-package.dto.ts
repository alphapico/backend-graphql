import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Image } from '../../upload/dto/image.dto';

@ObjectType()
export class TokenPackage {
  @Field(() => Int)
  packageId: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  tokenAmount: number;

  @Field()
  price: number;

  @Field()
  currency: string;

  @Field()
  isActive: boolean;

  @Field(() => Image, { nullable: true })
  image?: Image;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field({ nullable: true })
  deletedAt?: Date;
}
