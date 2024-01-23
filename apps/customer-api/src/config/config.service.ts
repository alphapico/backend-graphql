import { PrismaService } from '@styx/prisma';
import { Injectable } from '@nestjs/common';
import { TokenPriceCreateInput } from './dto/token-price-create.input';
import { TokenPackage, TokenPrice } from '@prisma/client';
import { TokenPackageCreateInput } from './dto/token-package-create.input';
import { TokenPackageUpdateInput } from './dto/token-package-update.input';
import { Config } from './dto/config.dto';
import { LogError } from '@styx/common';

@Injectable()
export class ConfigService {
  constructor(private readonly prisma: PrismaService) {}

  @LogError
  async setOrEditTokenPrice(priceDetails: TokenPriceCreateInput) {
    // Convert the user-friendly decimal format to integer format
    const priceInCents = Math.round(priceDetails.price * 100);
    priceDetails.price = priceInCents;

    const existingPrice = await this.prisma.tokenPrice.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (existingPrice) {
      // If it exists, update it
      const tokenPrice = await this.prisma.tokenPrice.update({
        where: { tokenPriceId: existingPrice.tokenPriceId },
        data: priceDetails,
      });
      tokenPrice.price = tokenPrice.price / 100;
      return tokenPrice;
    } else {
      // If it doesn't exist, create a new one
      const tokenPrice = await this.prisma.tokenPrice.create({
        data: priceDetails,
      });
      tokenPrice.price = tokenPrice.price / 100;
      return tokenPrice;
    }
  }

  @LogError
  async getTokenPrice(): Promise<TokenPrice | null> {
    const tokenPrice = await this.prisma.tokenPrice.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (tokenPrice) {
      // Convert the integer format back to the user-friendly decimal format
      tokenPrice.price = tokenPrice.price / 100;
      return tokenPrice;
    }

    return null;
  }

  @LogError
  async createTokenPackage(
    packageDetails: TokenPackageCreateInput
  ): Promise<TokenPackage> {
    // Convert price to integer format
    packageDetails.price = packageDetails.price * 100;

    const tokenPackage = await this.prisma.tokenPackage.create({
      data: packageDetails,
    });
    tokenPackage.price = tokenPackage.price / 100;
    return tokenPackage;
  }

  @LogError
  async editTokenPackage(
    packageId: number,
    packageDetails: TokenPackageUpdateInput
  ): Promise<TokenPackage> {
    // Convert price to integer format if it's provided
    if (packageDetails.price !== undefined) {
      packageDetails.price = packageDetails.price * 100;
    }

    const tokenPackage = await this.prisma.tokenPackage.update({
      where: { packageId: packageId },
      data: packageDetails,
    });
    tokenPackage.price = tokenPackage.price / 100;
    return tokenPackage;
  }

  @LogError
  async deleteTokenPackage(packageId: number): Promise<TokenPackage> {
    return await this.prisma.tokenPackage.update({
      where: { packageId: packageId },
      data: { deletedAt: new Date() },
    });
  }

  @LogError
  async toggleTokenPackageStatus(packageId: number): Promise<TokenPackage> {
    const existingPackage = await this.prisma.tokenPackage.findUnique({
      where: { packageId: packageId },
    });
    return await this.prisma.tokenPackage.update({
      where: { packageId: packageId },
      data: { isActive: !existingPackage.isActive },
    });
  }

  @LogError
  async getTokenPackage(packageId: number): Promise<TokenPackage | null> {
    const tokenPackage = await this.prisma.tokenPackage.findUnique({
      where: { packageId: packageId },
      include: {
        image: true,
      },
    });

    if (!tokenPackage || tokenPackage.deletedAt) {
      return null;
    }

    // Convert the integer format back to user-friendly decimal format
    tokenPackage.price = tokenPackage.price / 100;
    return tokenPackage;
  }

  @LogError
  async getAllTokenPackages(): Promise<TokenPackage[]> {
    const tokenPackages = await this.prisma.tokenPackage.findMany({
      where: { deletedAt: null },
      include: {
        image: true,
      },
    });

    // Convert the integer format back to user-friendly decimal format for each package
    tokenPackages.forEach((pkg) => {
      pkg.price = pkg.price / 100;
    });

    return tokenPackages;
  }

  @LogError
  async getAllTokenPackagesByStatus(
    isActive: boolean
  ): Promise<TokenPackage[]> {
    const tokenPackages = await this.prisma.tokenPackage.findMany({
      where: { isActive: isActive, deletedAt: null },
      include: {
        image: true,
      },
    });

    // Convert the integer format back to user-friendly decimal format for each package
    tokenPackages.forEach((pkg) => {
      pkg.price = pkg.price / 100;
    });

    return tokenPackages;
  }

  @LogError
  async setReferralViewLevel(depth: number): Promise<Config> {
    let updatedConfig: Config;
    const existingConfig = await this.prisma.config.findFirst();

    if (existingConfig) {
      updatedConfig = await this.prisma.config.update({
        where: { configId: existingConfig.configId },
        data: { referralViewLevel: depth },
      });
    } else {
      updatedConfig = await this.prisma.config.create({
        data: { referralViewLevel: depth },
      });
    }

    return updatedConfig;
  }

  @LogError
  async getReferralViewLevel(): Promise<number | null> {
    const config = await this.prisma.config.findFirst();
    return config?.referralViewLevel || null;
  }

  @LogError
  async setReferralCodeEnabledStatus(status: boolean): Promise<Config> {
    let updatedConfig: Config;
    const existingConfig = await this.prisma.config.findFirst();

    if (existingConfig) {
      updatedConfig = await this.prisma.config.update({
        where: { configId: existingConfig.configId },
        data: { isReferralCodeEnabled: status },
      });
    } else {
      updatedConfig = await this.prisma.config.create({
        data: { isReferralCodeEnabled: status },
      });
    }

    return updatedConfig;
  }

  @LogError
  async getReferralCodeEnabledStatus(): Promise<boolean | null> {
    const config = await this.prisma.config.findFirst();
    return config?.isReferralCodeEnabled || null;
  }

  @LogError
  async getConfig(): Promise<Config> {
    return this.prisma.config.findFirst();
  }
}
