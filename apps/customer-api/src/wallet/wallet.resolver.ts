import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { WalletService } from './wallet.service';
import { Wallet } from './dto/wallet.dto';
import { CreateWalletInput } from './dto/create-wallet.input';
import { SetDefaultWalletInput } from './dto/set-default-wallet.input';
import { UpdateWalletInput } from './dto/update-wallet.input';
import {
  CurrentUser,
  CustomerRole,
  DESCRIPTION,
  ERROR_MESSAGES,
  IJwtPayload,
} from '@charonium/common';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DeleteWalletInput } from './dto/delete-wallet.input';

@Resolver(() => Wallet)
export class WalletResolver {
  constructor(private readonly walletService: WalletService) {}

  @Query(() => [Wallet])
  @UseGuards(JwtAuthGuard)
  async getWalletsByCustomerId(
    @CurrentUser() user: IJwtPayload,
    @Args('customerId', { type: () => Int }) customerId: number
  ) {
    if (user.role !== CustomerRole.ADMIN && user.sub !== customerId) {
      throw new BadRequestException(ERROR_MESSAGES.OPERATION_NOT_ALLOWED);
    }

    return this.walletService.getWalletsByCustomerId(customerId);
  }

  @Query(() => Wallet, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async getWalletByCustomerIdAndDefault(
    @CurrentUser() user: IJwtPayload,
    @Args('customerId', { type: () => Int }) customerId: number
  ) {
    if (user.role !== CustomerRole.ADMIN && user.sub !== customerId) {
      throw new BadRequestException(ERROR_MESSAGES.OPERATION_NOT_ALLOWED);
    }

    return this.walletService.getWalletByCustomerIdAndDefault(customerId);
  }

  @Mutation(() => Wallet, { description: DESCRIPTION.CREATE_WALLET })
  @UseGuards(JwtAuthGuard)
  async createWallet(
    @CurrentUser() user: IJwtPayload,
    @Args('input') input: CreateWalletInput
  ) {
    if (user.role !== CustomerRole.ADMIN && user.sub !== input.customerId) {
      throw new BadRequestException(ERROR_MESSAGES.OPERATION_NOT_ALLOWED);
    }

    return this.walletService.createWallet(input);
  }

  @Mutation(() => Wallet, { description: DESCRIPTION.UPDATE_WALLET })
  @UseGuards(JwtAuthGuard)
  async updateWallet(
    @CurrentUser() user: IJwtPayload,
    @Args('input') input: UpdateWalletInput
  ) {
    if (user.role !== CustomerRole.ADMIN && user.sub !== input.customerId) {
      throw new BadRequestException(ERROR_MESSAGES.OPERATION_NOT_ALLOWED);
    }

    return this.walletService.updateWallet(input);
  }

  @Mutation(() => Wallet, { description: DESCRIPTION.SET_DEFAULT_WALLET })
  @UseGuards(JwtAuthGuard)
  async setDefaultWallet(
    @CurrentUser() user: IJwtPayload,
    @Args('input') input: SetDefaultWalletInput
  ) {
    if (user.role !== CustomerRole.ADMIN && user.sub !== input.customerId) {
      throw new BadRequestException(ERROR_MESSAGES.OPERATION_NOT_ALLOWED);
    }

    return this.walletService.setDefaultWallet(
      input.customerId,
      input.walletId
    );
  }

  @Mutation(() => Wallet, { description: DESCRIPTION.DELETE_WALLET })
  @UseGuards(JwtAuthGuard)
  async deleteWallet(
    @CurrentUser() user: IJwtPayload,
    @Args('input') input: DeleteWalletInput
  ) {
    if (user.role !== CustomerRole.ADMIN && user.sub !== input.customerId) {
      throw new BadRequestException(ERROR_MESSAGES.OPERATION_NOT_ALLOWED);
    }

    return this.walletService.deleteWallet(input.customerId, input.walletId);
  }
}
