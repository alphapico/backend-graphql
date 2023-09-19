import { ERROR_MESSAGES } from '@charonium/common';
import { Field, Int, ObjectType, Float, InputType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

@ObjectType()
export class CommissionTier {
  @Field(() => Int)
  commissionTierId: number;

  @Field(() => Int)
  tier: number;

  @Field(() => Float)
  commissionRate: number;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class CommissionRate {
  @Field(() => Int)
  tier: number;

  @Field(() => Float)
  commissionRate: number;
}

@InputType()
export class CreateCommissionTierInput {
  @Field(() => Int)
  @IsInt({ message: ERROR_MESSAGES.VAL.IS_INT })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  tier: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0.0)
  @Max(0.9999)
  commissionRate: number;
}

@InputType()
export class UpdateCommissionTierInput {
  @Field(() => Int, { nullable: true })
  @IsInt({ message: ERROR_MESSAGES.VAL.IS_INT })
  tier: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0.0)
  @Max(0.9999)
  commissionRate: number;
}
