import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { Customer } from './dto/customer.dto';
import { RegisterInput } from './dto/register.input';
import { CustomerService } from './customer.service';

@Resolver(() => Customer)
export class CustomerResolver {
  constructor(private customerService: CustomerService) {}

  @Mutation(() => Customer)
  async register(@Args('input') input: RegisterInput): Promise<Customer> {
    return this.customerService.register(input);
  }

  @Query(() => String)
  hello(): string {
    return 'Hello World!';
  }
}
