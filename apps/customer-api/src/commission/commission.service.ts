import {
  Commission,
  ERROR_MESSAGES,
  LogError,
  PurchaseActivityRecord,
  ReferrerResults,
} from '@styx/common';
import { PrismaService } from '@styx/prisma';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { CommissionResult } from './dto/commission.dto';
import graphqlFields from 'graphql-fields';
import { CommissionTier } from './dto/commission-tier.dto';

@Injectable()
export class CommissionService {
  constructor(private readonly prisma: PrismaService) {}

  @LogError
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

    await this.performTransaction(
      commissionData,
      charge.purchaseActivity.purchaseActivityId
    );
    return charge.chargeId;
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

    const commissionRates = await this.getAllCommissionRates();
    const maxTier = Math.max(...Object.keys(commissionRates).map(Number));

    const referrers = await this.getAllReferrers(
      customer.referralCustomerId,
      maxTier
    );

    // Calculate commission for the referrers
    let tier = 1;

    for (const referrer of referrers) {
      if (referrer.customerStatus === CustomerStatus.ACTIVE) {
        const commissionRate = commissionRates[tier] || 0;
        if (commissionRate > 0) {
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
      }

      tier++;
    }

    return commissionData;
  }

  async getAllReferrers(
    referralCustomerId: number,
    maxTier: number
  ): Promise<ReferrerResults> {
    const query = Prisma.sql`
    WITH RECURSIVE referrers AS (
        SELECT "customerId", "name", "referralCustomerId", "customerStatus", 1 as "tier"
        FROM "Customer"
        WHERE "customerId" = ${referralCustomerId}

        UNION ALL

        SELECT c."customerId", c."name", c."referralCustomerId", c."customerStatus", r."tier" + 1
        FROM "Customer" c
        JOIN referrers r ON c."customerId" = r."referralCustomerId"
        WHERE r."tier" < ${maxTier}
    )
    SELECT * FROM referrers
    `;

    return await this.prisma.$queryRaw(query);
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

  async getAllCommissionRates(): Promise<{ [key: number]: number }> {
    const commissionTiers = await this.prisma.commissionTier.findMany({
      orderBy: {
        tier: 'asc',
      },
    });
    const commissionRates: { [key: number]: number } = {};

    for (const tier of commissionTiers) {
      commissionRates[tier.tier] = parseFloat(tier.commissionRate.toString());
    }

    return commissionRates;
  }

  @LogError
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

  @LogError
  async createCommissionTier(
    tier: number,
    commissionRate: number
  ): Promise<CommissionTier> {
    try {
      const commissionTier = await this.prisma.commissionTier.create({
        data: {
          tier,
          commissionRate,
        },
      });
      return {
        ...commissionTier,
        commissionRate: parseFloat(commissionTier.commissionRate.toFixed(4)),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          ERROR_MESSAGES.COMMISSION_TIER_ALREADY_EXISTS
        );
      }
      throw error;
    }
  }

  @LogError
  async updateCommissionTier(
    tier: number,
    commissionRate: number
  ): Promise<CommissionTier> {
    const existingTier = await this.prisma.commissionTier.findUnique({
      where: { tier },
    });

    if (!existingTier) {
      throw new NotFoundException(ERROR_MESSAGES.COMMISSION_TIER_NOT_FOUND);
    }

    const commissionTier = await this.prisma.commissionTier.update({
      where: { tier },
      data: { commissionRate },
    });
    return {
      ...commissionTier,
      commissionRate: parseFloat(commissionTier.commissionRate.toFixed(4)),
    };
  }

  @LogError
  async deleteCommissionTier(tier: number): Promise<CommissionTier> {
    const existingTier = await this.prisma.commissionTier.findUnique({
      where: { tier },
    });

    if (!existingTier) {
      throw new NotFoundException(ERROR_MESSAGES.COMMISSION_TIER_NOT_FOUND);
    }

    const commissionTier = await this.prisma.commissionTier.delete({
      where: { tier },
    });
    return {
      ...commissionTier,
      commissionRate: parseFloat(commissionTier.commissionRate.toFixed(4)),
    };
  }

  @LogError
  async getPurchaseActivities(
    info: any,
    cursor?: number,
    limit = 10,
    purchaseConfirmed?: boolean,
    paymentStatus?: PaymentStatus,
    customerId?: number
  ) {
    // Use graphql-fields to determine which fields were requested
    const fields = graphqlFields(info);
    // Build the include object based on the requested fields
    const include: any = {};

    if (fields.data) {
      if (fields.data.charge) {
        include.charge = {
          include: {},
        };
        // Check if payments field was requested
        if (fields.data.charge.payments) {
          include.charge.include.payments = true;
        }
        // Check if commissions field was requested
        if (fields.data.charge.commissions) {
          include.charge.include.commissions = true;
        }
      }

      if (fields.data.package) {
        include.package = true;
      }

      if (fields.data.tokenPrice) {
        include.tokenPrice = true;
      }
    }

    // Check if the include.charge.include object is empty
    if (include.charge && Object.keys(include.charge.include).length === 0) {
      delete include.charge;
    }

    // Build the where filter object based on provided parameters
    const whereFilter: any = {};

    if (purchaseConfirmed !== undefined) {
      whereFilter.purchaseConfirmed = purchaseConfirmed;
    }

    if (paymentStatus) {
      whereFilter.paymentStatus = paymentStatus;
    }

    if (customerId) {
      whereFilter.customerId = customerId;
    }

    // Check if the include object is empty
    const isIncludeEmpty = Object.keys(include).length === 0;
    const findManyArgs: any = {
      take: limit + 1, // Fetch one extra record to determine if there's a next page
      cursor: cursor ? { purchaseActivityId: cursor } : undefined,
      where: whereFilter, // Apply the filtering conditions
      orderBy: {
        updatedAt: 'desc',
      },
    };

    if (!isIncludeEmpty) {
      findManyArgs.include = include;
    }
    const records = await this.prisma.purchaseActivity.findMany(findManyArgs);

    const hasNextPage = records.length > limit;
    if (hasNextPage) {
      // Remove the extra record
      records.pop();
    }

    // Format the price fields
    const formattedRecords = (records as PurchaseActivityRecord[]).map(
      (record) => {
        const { package: pkg, tokenPrice, charge } = record;

        const formattedPackage = pkg && {
          ...pkg,
          price: pkg.price ? pkg.price / 100 : pkg.price,
        };

        const formattedTokenPrice = tokenPrice && {
          ...tokenPrice,
          price: tokenPrice.price ? tokenPrice.price / 100 : tokenPrice.price,
        };

        const formattedCommissions = charge?.commissions?.map((commission) => ({
          ...commission,
          amount: commission.amount
            ? commission.amount / 100
            : commission.amount,
        }));

        const formattedCharge = charge && {
          ...charge,
          commissions: formattedCommissions || charge.commissions,
        };

        return {
          ...record,
          package: formattedPackage || record.package,
          tokenPrice: formattedTokenPrice || record.tokenPrice,
          charge: formattedCharge || record.charge,
        };
      }
    );

    // const formattedRecords = (records as PurchaseActivityRecord[]).map(
    //   (record) => {
    //     if (record.package && record.package.price) {
    //       record.package.price = record.package.price / 100;
    //     }
    //     if (record.tokenPrice && record.tokenPrice.price) {
    //       record.tokenPrice.price = record.tokenPrice.price / 100;
    //     }
    //     if (record.charge && record.charge.commissions) {
    //       record.charge.commissions.forEach((commission) => {
    //         if (commission.amount) {
    //           commission.amount = commission.amount / 100;
    //         }
    //       });
    //     }

    //     return record;
    //   }
    // );

    return {
      data: formattedRecords,
      nextPageCursor: hasNextPage
        ? records[records.length - 1].purchaseActivityId
        : null,
    };
  }

  @LogError
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

  @LogError
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

  @LogError
  async getReferrerCommissionByCharge(chargeId: number) {
    const commissions = await this.prisma.commission.findMany({
      where: { chargeId },
      include: { customer: true },
    });

    return commissions;
  }

  @LogError
  async getCommissions(
    info: any,
    cursor?: number,
    limit = 10,
    customerId?: number,
    isTransferred?: boolean
  ): Promise<CommissionResult> {
    const fields = graphqlFields(info);

    const include: any = {};

    if (fields.data) {
      if (fields.data.customer) {
        include.customer = true;
      }
      if (fields.data.charge) {
        include.charge = true;
      }
    }

    const whereClause: Prisma.CommissionWhereInput = {};

    if (customerId) {
      whereClause.customerId = customerId;
    }

    if (isTransferred !== undefined) {
      whereClause.isTransferred = isTransferred;
    }

    // Check if the include object is empty
    const isIncludeEmpty = Object.keys(include).length === 0;
    const findManyArgs: any = {
      take: limit + 1, // Fetch one extra record to determine if there's a next page
      cursor: cursor ? { commissionId: cursor } : undefined,
      orderBy: [
        { isTransferred: 'asc' }, // This will ensure that 'isTransferred=false' results appear at the top
        { commissionId: 'desc' }, // largest values represent the earliest records.
      ],
      where: whereClause,
    };

    if (!isIncludeEmpty) {
      findManyArgs.include = include;
    }
    const records = await this.prisma.commission.findMany(findManyArgs);

    const hasNextPage = records.length > limit;
    if (hasNextPage) {
      // Remove the extra record
      records.pop();
    }

    // Format the amount field
    const formattedRecords = records.map((record) => {
      if (record.amount) {
        record.amount = record.amount / 100;
      }

      return record;
    });

    return {
      data: formattedRecords,
      nextPageCursor: hasNextPage
        ? records[records.length - 1].commissionId
        : null,
    };
  }

  @LogError
  async getCharges(
    info: any, // This is the GraphQL resolver's info argument
    cursor?: number,
    limit = 10,
    customerId?: number,
    code?: string
  ) {
    const fields = graphqlFields(info);

    // console.log({ fields });

    const include: any = {};

    if (fields.data) {
      if (fields.data.customer) {
        include.customer = true;
      }
      if (fields.data.payments) {
        include.payments = true;
      }
      if (fields.data.commissions) {
        include.commissions = true;
      }
      if (fields.data.purchaseActivity) {
        include.purchaseActivity = true;
      }
    }

    // Build the where filter object based on provided parameters
    const whereFilter: any = {};

    if (customerId) {
      whereFilter.customerId = customerId;
    }

    if (code) {
      whereFilter.code = code;
    }

    // Check if the include object is empty
    const isIncludeEmpty = Object.keys(include).length === 0;
    const findManyArgs: any = {
      take: limit + 1,
      cursor: cursor ? { chargeId: cursor } : undefined,
      where: whereFilter,
      orderBy: {
        createdAt: 'desc',
      },
    };

    if (!isIncludeEmpty) {
      findManyArgs.include = include;
    }
    const records = await this.prisma.charge.findMany(findManyArgs);

    const hasNextPage = records.length > limit;
    if (hasNextPage) {
      records.pop();
    }

    return {
      data: records,
      nextPageCursor: hasNextPage ? records[records.length - 1].chargeId : null,
    };
  }
}
