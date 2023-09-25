import { Resolver, Mutation, Query, Args, Info, Int } from '@nestjs/graphql';
import { Customer, CustomerResult } from './dto/customer.dto';
import { RegisterInput } from './dto/register.input';
import { CustomerService } from './customer.service';
import { ResetPasswordInput } from './dto/reset-password.input';
import { EmailInput } from './dto/email.input';
import { RegisterAdminInput } from './dto/register-admin.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  CustomerRole,
  CustomerStatus,
  EmailStatus,
  IJwtPayload,
} from '@charonium/common';
import { AdminGuard } from '../auth/admin.guard';
import { FreshTokenGuard } from '../auth/fresh-token.guard';
import { ChangePasswordInput } from './dto/change-password.input';

@Resolver(() => Customer)
export class CustomerResolver {
  constructor(private customerService: CustomerService) {}

  @Mutation(() => Customer)
  async register(@Args('input') input: RegisterInput): Promise<Customer> {
    const customer = await this.customerService.register(input);
    return {
      ...customer,
      charges: [],
      commissions: [],
      wallets: [],
      purchaseActivities: [],
    };
  }

  @Mutation(() => Boolean)
  async registerAdmin(
    @Args('input') input: RegisterAdminInput
  ): Promise<boolean> {
    return this.customerService.registerAdmin(input);
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

  @Mutation(() => Boolean)
  async resendAdminRegistrationEmail(): Promise<boolean> {
    return this.customerService.resendAdminRegistrationEmail();
  }

  @Mutation(() => Boolean)
  @UseGuards(FreshTokenGuard)
  async changePassword(
    @CurrentUser() user: IJwtPayload,
    @Args('input') input: ChangePasswordInput
  ): Promise<boolean> {
    return this.customerService.changePassword(user.sub, input);
  }

  @Query(() => CustomerResult)
  @UseGuards(AdminGuard)
  async getCustomers(
    @Info() info: any,
    @Args('cursor', { type: () => Int, nullable: true }) cursor?: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit?: number,
    @Args('customerStatus', { type: () => CustomerStatus, nullable: true })
    customerStatus?: CustomerStatus,
    @Args('emailStatus', { type: () => EmailStatus, nullable: true })
    emailStatus?: EmailStatus,
    @Args('customerRole', { type: () => CustomerRole, nullable: true })
    customerRole?: CustomerRole,
    @Args('customerId', { type: () => Int, nullable: true })
    customerId?: number
  ): Promise<CustomerResult> {
    return this.customerService.getCustomers(
      info,
      cursor,
      limit,
      customerStatus,
      emailStatus,
      customerRole,
      customerId
    );
  }

  @Query(() => Customer)
  @UseGuards(JwtAuthGuard)
  async me(
    @Info() info: any,
    @CurrentUser() user: IJwtPayload
  ): Promise<Customer> {
    return this.customerService.getCustomer(info, user.sub);
  }

  @Query(() => String)
  hello(): string {
    return 'Hello World!';
  }
}
