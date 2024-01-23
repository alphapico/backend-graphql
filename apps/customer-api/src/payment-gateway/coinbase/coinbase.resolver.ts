import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CoinbaseService } from './coinbase.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser, DESCRIPTION, IJwtPayload } from '@styx/common';
// import { CreateChargeInput } from './dto/create-charge.input';
import { PurchaseTokensInput } from './dto/purchase-tokens.input';

@Resolver()
export class CoinbaseResolver {
  constructor(private coinbaseService: CoinbaseService) {}

  @Mutation(() => String, { description: DESCRIPTION.PURCHASE_TOKENS })
  @UseGuards(JwtAuthGuard)
  async purchaseTokens(
    @Args('input') input: PurchaseTokensInput,
    @CurrentUser() user: IJwtPayload
  ): Promise<string> {
    const { redirect_url, cancel_url, packageId, quantity } = input;
    const { name, email } = user;

    const charge = await this.coinbaseService.purchaseTokens(
      email,
      name,
      redirect_url,
      cancel_url,
      packageId,
      quantity
    );

    return charge.code;
  }

  // @Mutation(() => String)
  // @UseGuards(JwtAuthGuard)
  // async createCharge(
  //   @Args('createChargeInput') createChargeInput: CreateChargeInput,
  //   @CurrentUser() user: IJwtPayload
  // ): Promise<string> {
  //   const { amount, currency, description, redirect_url, cancel_url } =
  //     createChargeInput;
  //   const { name, email } = user;

  //   const charge = await this.coinbaseService.createCharge(
  //     amount,
  //     currency,
  //     email,
  //     name,
  //     description,
  //     redirect_url,
  //     cancel_url
  //   );

  //   return charge.code;
  // }
}
