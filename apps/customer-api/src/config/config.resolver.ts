import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql';
import { ConfigService } from './config.service';
import { TokenPriceCreateInput } from './dto/token-price-create.input';
import { TokenPrice } from './dto/token-price.dto';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { TokenPackage } from './dto/token-package.dto';
import { TokenPackageCreateInput } from './dto/token-package-create.input';
import { TokenPackageUpdateInput } from './dto/token-package-update.input';
import { Config } from './dto/config.dto';
import { DESCRIPTION } from '@styx/common';

@Resolver()
export class ConfigResolver {
  constructor(private readonly configService: ConfigService) {}

  @Mutation(() => TokenPrice, {
    description: DESCRIPTION.SET_OR_EDIT_TOKEN_PRICE,
  })
  @UseGuards(AdminGuard)
  async setOrEditTokenPrice(
    @Args('input') input: TokenPriceCreateInput
  ): Promise<TokenPrice> {
    return this.configService.setOrEditTokenPrice(input);
  }

  @Query(() => TokenPrice, { nullable: true })
  async getTokenPrice(): Promise<TokenPrice | null> {
    return this.configService.getTokenPrice();
  }

  @Mutation(() => TokenPackage, {
    description: DESCRIPTION.CREATE_TOKEN_PACKAGE,
  })
  @UseGuards(AdminGuard)
  async createTokenPackage(
    @Args('input') input: TokenPackageCreateInput
  ): Promise<TokenPackage> {
    return this.configService.createTokenPackage(input);
  }

  @Mutation(() => TokenPackage, { description: DESCRIPTION.EDIT_TOKEN_PACKAGE })
  @UseGuards(AdminGuard)
  async editTokenPackage(
    @Args('packageId', { type: () => Int }) packageId: number,
    @Args('input') input: TokenPackageUpdateInput
  ): Promise<TokenPackage> {
    return this.configService.editTokenPackage(packageId, input);
  }

  @Mutation(() => TokenPackage, {
    description: DESCRIPTION.DELETE_TOKEN_PACKAGE,
  })
  @UseGuards(AdminGuard)
  async deleteTokenPackage(
    @Args('packageId', { type: () => Int }) packageId: number
  ): Promise<TokenPackage> {
    return this.configService.deleteTokenPackage(packageId);
  }

  @Mutation(() => TokenPackage, {
    description: DESCRIPTION.TOGGLE_TOKEN_PACKAGE_STATUS,
  })
  @UseGuards(AdminGuard)
  async toggleTokenPackageStatus(
    @Args('packageId', { type: () => Int }) packageId: number
  ): Promise<TokenPackage> {
    return this.configService.toggleTokenPackageStatus(packageId);
  }

  @Query(() => TokenPackage, {
    nullable: true,
    description: DESCRIPTION.GET_TOKEN_PACKAGE,
  })
  async getTokenPackage(
    @Args('packageId', { type: () => Int }) packageId: number
  ): Promise<TokenPackage | null> {
    return this.configService.getTokenPackage(packageId);
  }

  @Query(() => [TokenPackage], { nullable: 'items' })
  async getAllTokenPackages(): Promise<TokenPackage[]> {
    return this.configService.getAllTokenPackages();
  }

  @Query(() => [TokenPackage], {
    nullable: 'items',
    description: DESCRIPTION.GET_ALL_TOKEN_PACKAGES_BY_STATUS,
  })
  async getAllTokenPackagesByStatus(
    @Args('isActive', { type: () => Boolean }) isActive: boolean
  ): Promise<TokenPackage[]> {
    return this.configService.getAllTokenPackagesByStatus(isActive);
  }

  @Mutation(() => Config, { description: DESCRIPTION.SET_REFERRAL_VIEW_LEVEL })
  @UseGuards(AdminGuard)
  async setReferralViewLevel(
    @Args('depth', { type: () => Int }) depth: number
  ): Promise<Config> {
    return this.configService.setReferralViewLevel(depth);
  }

  @Mutation(() => Config, {
    description: DESCRIPTION.SET_REFERRAL_CODE_ENABLED_STATUS,
  })
  @UseGuards(AdminGuard)
  async setReferralCodeEnabledStatus(
    @Args('status', { type: () => Boolean }) status: boolean
  ): Promise<Config> {
    return this.configService.setReferralCodeEnabledStatus(status);
  }

  @Query(() => Config, { nullable: true, description: DESCRIPTION.GET_CONFIG })
  @UseGuards(AdminGuard)
  async getConfig(): Promise<Config> {
    return this.configService.getConfig();
  }
}
