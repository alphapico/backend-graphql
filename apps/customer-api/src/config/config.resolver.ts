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

@Resolver()
export class ConfigResolver {
  constructor(private readonly configService: ConfigService) {}

  @Mutation(() => TokenPrice)
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

  @Mutation(() => TokenPackage)
  @UseGuards(AdminGuard)
  async createTokenPackage(
    @Args('input') input: TokenPackageCreateInput
  ): Promise<TokenPackage> {
    return this.configService.createTokenPackage(input);
  }

  @Mutation(() => TokenPackage)
  @UseGuards(AdminGuard)
  async editTokenPackage(
    @Args('packageId', { type: () => Int }) packageId: number,
    @Args('input') input: TokenPackageUpdateInput
  ): Promise<TokenPackage> {
    return this.configService.editTokenPackage(packageId, input);
  }

  @Mutation(() => TokenPackage)
  @UseGuards(AdminGuard)
  async deleteTokenPackage(
    @Args('packageId', { type: () => Int }) packageId: number
  ): Promise<TokenPackage> {
    return this.configService.deleteTokenPackage(packageId);
  }

  @Mutation(() => TokenPackage)
  @UseGuards(AdminGuard)
  async toggleTokenPackageStatus(
    @Args('packageId', { type: () => Int }) packageId: number
  ): Promise<TokenPackage> {
    return this.configService.toggleTokenPackageStatus(packageId);
  }

  @Query(() => TokenPackage, { nullable: true })
  async getTokenPackage(
    @Args('packageId', { type: () => Int }) packageId: number
  ): Promise<TokenPackage | null> {
    return this.configService.getTokenPackage(packageId);
  }

  @Query(() => [TokenPackage], { nullable: 'items' })
  async getAllTokenPackages(): Promise<TokenPackage[]> {
    return this.configService.getAllTokenPackages();
  }

  @Query(() => [TokenPackage], { nullable: 'items' })
  async getAllTokenPackagesByStatus(
    @Args('isActive', { type: () => Boolean }) isActive: boolean
  ): Promise<TokenPackage[]> {
    return this.configService.getAllTokenPackagesByStatus(isActive);
  }

  @Mutation(() => Config)
  @UseGuards(AdminGuard)
  async setReferralViewLevel(
    @Args('depth', { type: () => Int }) depth: number
  ): Promise<Config> {
    return this.configService.setReferralViewLevel(depth);
  }

  @Mutation(() => Config)
  @UseGuards(AdminGuard)
  async setReferralCodeEnabledStatus(
    @Args('status', { type: () => Boolean }) status: boolean
  ): Promise<Config> {
    return this.configService.setReferralCodeEnabledStatus(status);
  }

  @Query(() => Config, { nullable: true })
  @UseGuards(AdminGuard)
  async getConfig(): Promise<Config> {
    return this.configService.getConfig();
  }
}
