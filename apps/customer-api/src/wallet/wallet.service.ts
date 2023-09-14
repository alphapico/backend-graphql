import { PrismaService } from '@charonium/prisma';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWalletInput } from './dto/create-wallet.input';
import { UpdateWalletInput } from './dto/update-wallet.input';
import { CryptoType } from '@prisma/client';
import { ERROR_MESSAGES } from '@charonium/common';
import { isAddress } from 'web3-validator';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getWalletsByCustomerId(customerId: number) {
    return this.prisma.wallet.findMany({ where: { customerId } });
  }

  async getWalletByCustomerIdAndDefault(customerId: number) {
    return this.prisma.wallet.findFirst({
      where: { customerId, isDefault: true },
    });
  }

  private async isValidEthAddress(address: string): Promise<boolean> {
    return isAddress(address);
  }

  async createWallet(input: CreateWalletInput) {
    const existingWallets = await this.prisma.wallet.findMany({
      where: { customerId: input.customerId },
    });

    const hasEthWallet = existingWallets.some(
      (wallet) => wallet.cryptoType === CryptoType.ETH
    );

    if (!hasEthWallet && input.cryptoType !== CryptoType.ETH) {
      throw new BadRequestException(ERROR_MESSAGES.ETH_WALLET_REQUIRED);
    }

    if (
      input.cryptoType === CryptoType.ETH &&
      !(await this.isValidEthAddress(input.address))
    ) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_ETH_ADDRESS);
    }

    if (existingWallets.length === 0) {
      input.isDefault = true;
    }

    return this.prisma.wallet.create({ data: input });
  }

  async updateWallet(input: UpdateWalletInput) {
    const { walletId, ...updateData } = input;

    const existingWallet = await this.prisma.wallet.findUnique({
      where: { walletId },
    });

    if (!existingWallet) {
      throw new NotFoundException(ERROR_MESSAGES.WALLET_NOT_FOUND);
    }

    const otherWallets = await this.prisma.wallet.findMany({
      where: {
        customerId: existingWallet.customerId,
        NOT: { walletId: existingWallet.walletId },
      },
    });

    const hasOtherEthWallet = otherWallets.some(
      (wallet) => wallet.cryptoType === CryptoType.ETH
    );

    if (
      existingWallet.cryptoType === CryptoType.ETH &&
      !hasOtherEthWallet &&
      updateData.cryptoType &&
      updateData.cryptoType !== CryptoType.ETH
    ) {
      throw new BadRequestException(ERROR_MESSAGES.ETH_WALLET_REQUIRED);
    }

    if (
      updateData.cryptoType === CryptoType.ETH &&
      updateData.address &&
      !(await this.isValidEthAddress(updateData.address))
    ) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_ETH_ADDRESS);
    }

    return this.prisma.wallet.update({
      where: { walletId },
      data: updateData,
    });
  }

  async setDefaultWallet(customerId: number, walletId: number) {
    await this.prisma.wallet.updateMany({
      where: { customerId },
      data: { isDefault: false },
    });

    return this.prisma.wallet.update({
      where: { walletId },
      data: { isDefault: true },
    });
  }
}
