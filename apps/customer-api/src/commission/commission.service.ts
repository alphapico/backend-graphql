import {
  Commission,
  ERROR_MESSAGES,
  handlePrismaError,
} from '@charonium/common';
import { PrismaService } from '@charonium/prisma';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Charge,
  Commission as PrismaCommission,
  Customer,
  CustomerStatus,
  Prisma,
  PurchaseActivity,
  TokenPackage,
  TokenPrice,
  PaymentStatus,
} from '@prisma/client';
import { CommissionBaseResult } from './dto/commission.base.dto';
import { CommissionResult } from './dto/commission.dto';

@Injectable()
export class CommissionService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateCommission(chargeCode: string) {
    const charge = await this.getCharge(chargeCode);

    if (!charge) {
      throw new NotFoundException(ERROR_MESSAGES.CHARGE_NOT_FOUND);
    }

    const amount = charge.purchaseActivity.amount;
    if (!amount) {
      throw new NotFoundException(ERROR_MESSAGES.AMOUNT_NOT_FOUND);
    }

    const currency = charge.purchaseActivity.currency;
    if (!currency) {
      throw new NotFoundException(ERROR_MESSAGES.CURRENCY_NOT_FOUND);
    }

    const commissionData = await this.calculateCommissions(
      charge,
      amount,
      currency
    );

    try {
      await this.performTransaction(
        commissionData,
        charge.purchaseActivity.purchaseActivityId
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  private async getCharge(chargeCode: string) {
    return await this.prisma.charge.findUnique({
      where: {
        code: chargeCode,
      },
      include: {
        customer: { include: { referrer: true } },
        purchaseActivity: {
          include: {
            package: true,
            tokenPrice: true,
          },
        },
      },
    });
  }

  private async calculateCommissions(
    charge: Charge & {
      customer: Customer & { referrer: Customer };
      purchaseActivity: PurchaseActivity & {
        package?: TokenPackage;
        tokenPrice?: TokenPrice;
      };
    },
    amount: number,
    currency: string
  ) {
    const commissionData: Commission[] = [];
    const customer = charge.customer;

    // Record the token amount for the customer itself
    // commissionData.push({
    //   customerId: customer.customerId,
    //   chargeId: charge.chargeId,
    //   tier: 0, // Tier 0 for the customer itself
    //   commissionRate: 1, // 100% of the token amount
    //   amount: amount,
    //   currency: currency,
    // });

    // Calculate commission for the referrers
    let referrer = await this.prisma.customer.findUnique({
      where: { customerId: customer.referralCustomerId },
    });
    let tier = 1;
    const commissionRates = await this.getAllCommissionRates();
    while (referrer) {
      if (referrer.customerStatus !== CustomerStatus.SUSPENDED) {
        const commissionRate = commissionRates[tier] || 0;
        // Calculate the commission amount
        const commissionDecimal = amount * commissionRate;
        // Round the result to get an integer value
        const commissionAmount = Math.floor(commissionDecimal);

        // Collect commission data
        commissionData.push({
          customerId: referrer.customerId,
          chargeId: charge.chargeId,
          tier: tier,
          commissionRate: commissionRate,
          amount: commissionAmount,
          currency: currency,
        });
      }

      referrer = await this.prisma.customer.findUnique({
        where: { customerId: referrer.referralCustomerId },
      });
      tier++;
    }

    return commissionData;
  }

  private async performTransaction(
    commissionData: Commission[],
    purchaseActivityId: number
  ) {
    // Record the commissions in the database in a single batch
    const createCommissions = this.prisma.commission.createMany({
      data: commissionData,
    });

    const confirmPurchase = this.prisma.purchaseActivity.update({
      where: { purchaseActivityId: purchaseActivityId },
      data: { purchaseConfirmed: true },
    });

    // Operations to be performed inside the transaction
    await this.prisma.$transaction([createCommissions, confirmPurchase]);
  }

  private async getAllCommissionRates(): Promise<{ [key: number]: number }> {
    const commissionTiers = await this.prisma.commissionTier.findMany();
    const rates: { [key: number]: number } = {};

    for (const tier of commissionTiers) {
      rates[tier.tier] = parseFloat(tier.commission.toString());
    }

    return rates;
  }

  async isPurchaseConfirmed(chargeCode: string): Promise<boolean> {
    const purchaseActivity = await this.prisma.purchaseActivity.findFirst({
      where: {
        charge: {
          code: chargeCode,
        },
      },
      select: { purchaseConfirmed: true },
    });

    if (!purchaseActivity) {
      return false;
    }

    return true;
  }

  async getPurchaseActivities(
    cursor?: number,
    limit = 10,
    purchaseConfirmed?: boolean,
    paymentStatus?: PaymentStatus,
    customerId?: number
  ) {
    // Build the where filter object based on provided parameters
    const whereFilter: any = {};

    if (purchaseConfirmed !== undefined) {
      whereFilter.purchaseConfirmed = purchaseConfirmed;
    }

    if (paymentStatus) {
      whereFilter.paymentStatus = paymentStatus;
    }

    if (customerId) {
      whereFilter.charge = {
        customerId: customerId,
      };
    }

    const records = await this.prisma.purchaseActivity.findMany({
      take: limit + 1, // Fetch one extra record to determine if there's a next page
      cursor: cursor ? { purchaseActivityId: cursor } : undefined,
      where: whereFilter, // Apply the filtering conditions
      orderBy: {
        updatedAt: 'desc', // Order by updatedAt in descending order
      },
    });

    const hasNextPage = records.length > limit;
    if (hasNextPage) {
      // Remove the extra record
      records.pop();
    }

    return {
      data: records,
      nextPageCursor: hasNextPage
        ? records[records.length - 1].purchaseActivityId
        : null,
    };
  }

  async getPurchaseActivitiesWithDetails(
    cursor?: number,
    limit = 10,
    purchaseConfirmed?: boolean,
    paymentStatus?: PaymentStatus,
    customerId?: number
  ) {
    // Build the where filter object based on provided parameters
    const whereFilter: any = {};

    if (purchaseConfirmed !== undefined) {
      whereFilter.purchaseConfirmed = purchaseConfirmed;
    }

    if (paymentStatus) {
      whereFilter.paymentStatus = paymentStatus;
    }

    if (customerId) {
      whereFilter.charge = {
        customerId: customerId,
      };
    }

    const records = await this.prisma.purchaseActivity.findMany({
      take: limit + 1, // Fetch one extra record to determine if there's a next page
      cursor: cursor ? { purchaseActivityId: cursor } : undefined,
      where: whereFilter, // Apply the filtering conditions
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        charge: {
          include: {
            payments: true,
            commissions: true,
          },
        },
        package: true,
        tokenPrice: true,
      },
    });

    const hasNextPage = records.length > limit;
    if (hasNextPage) {
      // Remove the extra record
      records.pop();
    }

    // Format the price fields
    const formattedRecords = records.map((record) => {
      if (record.package) {
        record.package.price = record.package.price / 100;
      }
      if (record.tokenPrice) {
        record.tokenPrice.price = record.tokenPrice.price / 100;
      }
      if (record.charge && record.charge.commissions) {
        record.charge.commissions.forEach((commission) => {
          commission.amount = commission.amount / 100;
        });
      }

      return record;
    });

    return {
      data: formattedRecords,
      nextPageCursor: hasNextPage
        ? records[records.length - 1].purchaseActivityId
        : null,
    };
  }

  async updateCommissionTransferStatus(
    commissionId: number
  ): Promise<PrismaCommission> {
    const commission = await this.prisma.commission.update({
      where: {
        commissionId: commissionId,
      },
      data: {
        isTransferred: true,
      },
    });
    return commission;
  }

  async isCommissionTransferred(commissionId: number): Promise<boolean> {
    const commission = await this.prisma.commission.findUnique({
      where: {
        commissionId: commissionId,
      },
      select: {
        isTransferred: true,
      },
    });

    return commission?.isTransferred || false;
  }

  async getCommissions(
    cursor?: number,
    limit = 10,
    customerId?: number,
    isTransferred?: boolean
  ): Promise<CommissionBaseResult> {
    const whereClause: Prisma.CommissionWhereInput = {};

    if (customerId) {
      whereClause.customerId = customerId;
    }

    if (isTransferred !== undefined) {
      whereClause.isTransferred = isTransferred;
    }

    const records = await this.prisma.commission.findMany({
      take: limit + 1, // Fetch one extra record to determine if there's a next page
      cursor: cursor ? { commissionId: cursor } : undefined,
      orderBy: [
        { isTransferred: 'asc' }, // This will ensure that 'isTransferred=false' results appear at the top
        { commissionId: 'desc' }, // largest values represent the earliest records.
      ],
      where: whereClause,
    });

    const hasNextPage = records.length > limit;
    if (hasNextPage) {
      // Remove the extra record
      records.pop();
    }

    // Format the amount field
    const formattedRecords = records.map((record) => {
      record.amount = record.amount / 100;
      return record;
    });

    return {
      data: formattedRecords,
      nextPageCursor: hasNextPage
        ? records[records.length - 1].commissionId
        : null,
    };
  }

  async getCommissionsWithDetails(
    cursor?: number,
    limit = 10,
    customerId?: number,
    isTransferred?: boolean
  ): Promise<CommissionResult> {
    const whereClause: Prisma.CommissionWhereInput = {};

    if (customerId) {
      whereClause.customerId = customerId;
    }

    if (isTransferred !== undefined) {
      whereClause.isTransferred = isTransferred;
    }

    const records = await this.prisma.commission.findMany({
      take: limit + 1, // Fetch one extra record to determine if there's a next page
      cursor: cursor ? { commissionId: cursor } : undefined,
      orderBy: [
        { isTransferred: 'asc' }, // This will ensure that 'isTransferred=false' results appear at the top
        { commissionId: 'desc' }, // largest values represent the earliest records.
      ],
      where: whereClause,
      include: {
        customer: true,
        charge: true,
      },
    });

    const hasNextPage = records.length > limit;
    if (hasNextPage) {
      // Remove the extra record
      records.pop();
    }

    // Format the amount field
    const formattedRecords = records.map((record) => {
      record.amount = record.amount / 100;
      return record;
    });

    return {
      data: formattedRecords,
      nextPageCursor: hasNextPage
        ? records[records.length - 1].commissionId
        : null,
    };
  }

  async getCommissionsForCustomer(
    customerId: number,
    cursor?: number,
    limit = 10,
    isTransferred?: boolean
  ): Promise<CommissionBaseResult> {
    const whereClause: Prisma.CommissionWhereInput = {
      customerId: customerId,
    };

    if (isTransferred !== undefined) {
      whereClause.isTransferred = isTransferred;
    }

    const records = await this.prisma.commission.findMany({
      take: limit + 1,
      cursor: cursor ? { commissionId: cursor } : undefined,
      orderBy: [
        { isTransferred: 'asc' }, // This will ensure that 'isTransferred=false' results appear at the top
        { commissionId: 'desc' }, // largest values represent the earliest records.
      ],
      where: whereClause,
    });

    const hasNextPage = records.length > limit;
    if (hasNextPage) {
      records.pop();
    }

    const formattedRecords = records.map((record) => {
      record.amount = record.amount / 100;
      return record;
    });

    return {
      data: formattedRecords,
      nextPageCursor: hasNextPage
        ? records[records.length - 1].commissionId
        : null,
    };
  }

  async getCommissionsWithDetailsForCustomer(
    customerId: number,
    cursor?: number,
    limit = 10,
    isTransferred?: boolean
  ): Promise<CommissionResult> {
    const whereClause: Prisma.CommissionWhereInput = {
      customerId: customerId,
    };

    if (isTransferred !== undefined) {
      whereClause.isTransferred = isTransferred;
    }

    const records = await this.prisma.commission.findMany({
      take: limit + 1,
      cursor: cursor ? { commissionId: cursor } : undefined,
      orderBy: [
        { isTransferred: 'asc' }, // This will ensure that 'isTransferred=false' results appear at the top
        { commissionId: 'desc' }, // largest values represent the earliest records.
      ],
      where: whereClause,
      include: {
        customer: true,
        charge: true,
      },
    });

    const hasNextPage = records.length > limit;
    if (hasNextPage) {
      records.pop();
    }

    const formattedRecords = records.map((record) => {
      record.amount = record.amount / 100;
      return record;
    });

    return {
      data: formattedRecords,
      nextPageCursor: hasNextPage
        ? records[records.length - 1].commissionId
        : null,
    };
  }
}
