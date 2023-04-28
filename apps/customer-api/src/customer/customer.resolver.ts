import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { Customer } from './dto/customer.dto';
import { RegisterInput } from './dto/register.input';
import { CustomerService } from './customer.service';
import { ResetPasswordInput } from './dto/reset-password.input';
import { EmailInput } from './dto/email.input.dto';

@Resolver(() => Customer)
export class CustomerResolver {
  constructor(private customerService: CustomerService) {}

  @Mutation(() => Customer)
  async register(@Args('input') input: RegisterInput): Promise<Customer> {
    return this.customerService.register(input);
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Args('input') input: ResetPasswordInput
  ): Promise<boolean> {
    return this.customerService.resetPassword(input);
  }

  @Mutation(() => Boolean)
  async forgetPassword(@Args('input') input: EmailInput): Promise<boolean> {
    return this.customerService.forgetPassword(input.email);
  }

  @Mutation(() => Boolean)
  async resendEmailVerification(
    @Args('input') input: EmailInput
  ): Promise<boolean> {
    return this.customerService.resendEmailVerification(input.email);
  }

  @Query(() => String)
  hello(): string {
    return 'Hello World!';
  }
}
