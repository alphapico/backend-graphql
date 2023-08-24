import { Field, Int, ObjectType } from '@nestjs/graphql';

// Define a mixin function for the Pagination class
export function PaginationMixin<TItem>(TItemClass: any) {
  @ObjectType({ isAbstract: true })
  abstract class PaginationClass {
    @Field(() => [TItemClass], { nullable: 'items' })
    data: TItem[];

    @Field(() => Int, { nullable: true })
    nextPageCursor?: number;
  }
  return PaginationClass;
}
