import { PrismaService } from '@charonium/prisma';
import { Injectable } from '@nestjs/common';
import { TokenPriceCreateInput } from './dto/token-price-create.input';
import { TokenPackage, TokenPrice } from '@prisma/client';
import { TokenPackageCreateInput } from './dto/token-package-create.input';
import { TokenPackageUpdateInput } from './dto/token-package-update.input';

@Injectable()
export class ConfigService {
  constructor(private readonly prisma: PrismaService) {}

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

  async deleteTokenPackage(packageId: number): Promise<TokenPackage> {
    return await this.prisma.tokenPackage.update({
      where: { packageId: packageId },
      data: { deletedAt: new Date() },
    });
  }

  async toggleTokenPackageStatus(packageId: number): Promise<TokenPackage> {
    const existingPackage = await this.prisma.tokenPackage.findUnique({
      where: { packageId: packageId },
    });
    return await this.prisma.tokenPackage.update({
      where: { packageId: packageId },
      data: { isActive: !existingPackage.isActive },
    });
  }

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
}
