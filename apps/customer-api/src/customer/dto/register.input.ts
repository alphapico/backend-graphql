import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsOptional,
} from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  referralCode?: string;
}
