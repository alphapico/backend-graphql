import { ERROR_MESSAGES } from '@charonium/common';
import { Field, Int, ObjectType, Float, InputType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

@ObjectType()
export class CommissionTier {
  @Field(() => Int)
  commissionTierId: number;

  @Field(() => Int, {
    description:
      'The tier represents the level in the referral hierarchy.' +
      ' A tier of 1 indicates a direct referral, while higher tier numbers indicate' +
      ' referrals further up the hierarchy. For instance, in a scenario where User A' +
      ' refers User B, and User B refers User C, User B is at tier 1 for User C,' +
      ' and User A is at tier 2 for User C.',
  })
  tier: number;

  @Field(() => Float, {
    description:
      'The commission rate is a decimal value ranging from 0.0 to 1.0 (or 0% to 100%), ' +
      'representing the commission percentage assigned to a particular tier in the referral hierarchy. ' +
      'This rate determines the percentage of commission a user at a specific tier receives for a referral. ' +
      'For instance, a commission rate of 0.1 corresponds to a 10% commission rate, whereas a commission rate ' +
      'of 0.9999 corresponds to a 99.99% commission rate. In the database, this field is represented as a ' +
      'Decimal with a precision of 4 decimal places, ensuring accurate commission rate calculations ' +
      'down to the hundredth of a percent.',
  })
  commissionRate: number;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class CommissionRate {
  @Field(() => Int, {
    description:
      'The tier represents the level in the referral hierarchy.' +
      ' A tier of 1 indicates a direct referral, while higher tier numbers indicate' +
      ' referrals further up the hierarchy. For instance, in a scenario where User A' +
      ' refers User B, and User B refers User C, User B is at tier 1 for User C,' +
      ' and User A is at tier 2 for User C.',
  })
  tier: number;

  @Field(() => Float, {
    description:
      'The commission rate is a decimal value ranging from 0.0 to 1.0 (or 0% to 100%), ' +
      'representing the commission percentage assigned to a particular tier in the referral hierarchy. ' +
      'This rate determines the percentage of commission a user at a specific tier receives for a referral. ' +
      'For instance, a commission rate of 0.1 corresponds to a 10% commission rate, whereas a commission rate ' +
      'of 0.9999 corresponds to a 99.99% commission rate. In the database, this field is represented as a ' +
      'Decimal with a precision of 4 decimal places, ensuring accurate commission rate calculations ' +
      'down to the hundredth of a percent.',
  })
  commissionRate: number;
}

@InputType()
export class CreateCommissionTierInput {
  @Field(() => Int, {
    description:
      'The tier represents the level in the referral hierarchy.' +
      ' A tier of 1 indicates a direct referral, while higher tier numbers indicate' +
      ' referrals further up the hierarchy. For instance, in a scenario where User A' +
      ' refers User B, and User B refers User C, User B is at tier 1 for User C,' +
      ' and User A is at tier 2 for User C.',
  })
  @IsInt({ message: ERROR_MESSAGES.VAL.IS_INT })
  @IsNotEmpty({ message: ERROR_MESSAGES.VAL.IS_NOT_EMPTY })
  tier: number;

  @Field(() => Float, {
    description:
      'The commission rate is a decimal value ranging from 0.0 to 1.0 (or 0% to 100%), ' +
      'representing the commission percentage assigned to a particular tier in the referral hierarchy. ' +
      'This rate determines the percentage of commission a user at a specific tier receives for a referral. ' +
      'For instance, a commission rate of 0.1 corresponds to a 10% commission rate, whereas a commission rate ' +
      'of 0.9999 corresponds to a 99.99% commission rate. In the database, this field is represented as a ' +
      'Decimal with a precision of 4 decimal places, ensuring accurate commission rate calculations ' +
      'down to the hundredth of a percent.',
  })
  @IsNumber()
  @Min(0.0)
  @Max(1.0)
  commissionRate: number;
}

@InputType()
export class UpdateCommissionTierInput {
  @Field(() => Int, {
    nullable: true,
    description:
      'The tier represents the level in the referral hierarchy.' +
      ' A tier of 1 indicates a direct referral, while higher tier numbers indicate' +
      ' referrals further up the hierarchy. For instance, in a scenario where User A' +
      ' refers User B, and User B refers User C, User B is at tier 1 for User C,' +
      ' and User A is at tier 2 for User C.',
  })
  @IsInt({ message: ERROR_MESSAGES.VAL.IS_INT })
  tier: number;

  @Field(() => Float, {
    nullable: true,
    description:
      'Optional field. The commission rate is a decimal value ranging from 0.0 to 1.0 (or 0% to 100%), ' +
      'representing the commission percentage assigned to a particular tier in the referral hierarchy. ' +
      'This rate determines the percentage of commission a user at a specific tier receives for a referral. ' +
      'For instance, a commission rate of 0.1 corresponds to a 10% commission rate, whereas a commission rate ' +
      'of 0.9999 corresponds to a 99.99% commission rate. In the database, this field is represented as a ' +
      'Decimal with a precision of 4 decimal places, ensuring accurate commission rate calculations ' +
      'down to the hundredth of a percent.',
  })
  @IsNumber()
  @Min(0.0)
  @Max(1.0)
  commissionRate: number;
}
