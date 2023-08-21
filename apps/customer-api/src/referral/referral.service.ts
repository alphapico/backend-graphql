import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@charonium/prisma';
import { ReferralMap, ReferralEntry } from './dto/referral.dto';
import { Prisma } from '@prisma/client';
import { Customer } from '../customer/dto/customer.dto';
import {
  CustomerStatus,
  ERROR_MESSAGES,
  PRISMA_ERROR_MESSAGES,
  ReferralResults,
} from '@charonium/common';
// import * as fs from 'fs';
import { writeDataToFile } from '@charonium/common';

@Injectable()
export class ReferralService {
  constructor(private readonly prisma: PrismaService) {}

  async getReferralMap(
    referrerId: number,
    startTier = 0
  ): Promise<ReferralMap[]> {
    await this.validateInputs(referrerId, startTier);

    // allow admin to set depth
    const depth = 3;

    const result = await this.executeQuery(referrerId, depth);
    // Write the output to a text file
    writeDataToFile(`${this.constructor.name}/sql-query.txt`, result);
    const filteredReferralMap = this.constructReferralMap(
      result,
      startTier,
      depth
    );
    // Write the output to a text file
    writeDataToFile(
      `${this.constructor.name}/referral-map.txt`,
      filteredReferralMap
    );

    return filteredReferralMap;
  }

  private async referrerExists(referrerId: number): Promise<boolean> {
    const referrer = await this.prisma.customer.findUnique({
      where: { customerId: referrerId },
    });
    return !!referrer;
  }

  private async validateInputs(
    referrerId: number,
    startTier: number
  ): Promise<void> {
    if (!(await this.referrerExists(referrerId))) {
      throw new NotFoundException(ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    }

    if (startTier < 0) {
      throw new BadRequestException(
        ERROR_MESSAGES.START_TIER_MUST_BE_NON_NEGATIVE
      );
    }
  }

  private async executeQuery(
    referrerId: number,
    depth: number
  ): Promise<ReferralResults> {
    const query = Prisma.sql`
      WITH RECURSIVE referrals ("referrer_id", "referee_id", tier) AS (
      SELECT "customerId", "customerId", -1 as tier
      FROM "Customer"
      WHERE "customerId" = ${referrerId}

      UNION

      SELECT "referralCustomerId", "customerId", 0 as tier
      FROM "Customer"
      WHERE "referralCustomerId" = ${referrerId}

      UNION ALL

      SELECT r."referralCustomerId", r."customerId", tier + 1
      FROM "Customer" r
      JOIN referrals ON r."referralCustomerId" = referrals."referee_id"
      WHERE tier < ${depth}
      )
      SELECT DISTINCT ON ("referrer_id", "referee_id") "referrer_id", "referee_id", tier, c.*
      FROM referrals
      JOIN "Customer" c ON referrals."referee_id" = c."customerId"
      WHERE c."customerStatus" <> ${CustomerStatus.PENDING}::"CustomerStatus"
      ORDER BY "referrer_id", "referee_id";
      `;

    try {
      return await this.prisma.$queryRaw(query);
    } catch (error) {
      this.handleQueryError(error);
    }
  }

  private handleQueryError(error: any): void {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case PRISMA_ERROR_MESSAGES.CLIENT.RAW_QUERY_FAILED:
          throw new BadRequestException(ERROR_MESSAGES.RAW_QUERY_FAILED);
        default:
          throw new BadRequestException(
            ERROR_MESSAGES.PRISMA_CLIENT_REQUEST_ERROR
          );
      }
    } else {
      throw new HttpException(
        ERROR_MESSAGES.UNEXPECTED_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private constructReferralMap(
    result: ReferralResults,
    startTier: number,
    depth: number
  ): ReferralMap[] {
    // If the result is empty, return an empty array
    if (result.length === 0) {
      return [];
    }

    // Create the referralMap and a map for quick access
    const referralMap: ReferralMap[] = [];
    const referralMapLookup: { [tier: string]: ReferralMap } = {};

    for (let i = 0; i <= depth; i++) {
      const tier = `tier${i + startTier}`;
      const referralMapEntry = {
        tier,
        referralEntries: [],
      };
      referralMap.push(referralMapEntry);
      referralMapLookup[tier] = referralMapEntry;
    }

    const referralEntriesMap: { [referrerId: number]: ReferralEntry } = {};
    const customersMap: { [customerId: number]: Customer } = {};

    for (const row of result) {
      if (row.tier === -1) {
        customersMap[row.referrer_id] = {
          customerId: row.customerId,
          name: row.name,
          email: row.email,
          customerStatus: row.customerStatus,
          emailStatus: row.emailStatus,
          referralCode: row.referralCode,
          referralCustomerId: row.referralCustomerId,
        };
        continue;
      }

      if (!customersMap[row.referee_id]) {
        customersMap[row.referee_id] = {
          customerId: row.customerId,
          name: row.name,
          email: row.email,
          customerStatus: row.customerStatus,
          emailStatus: row.emailStatus,
          referralCode: row.referralCode,
          referralCustomerId: row.referralCustomerId,
        };
      }

      if (!referralEntriesMap[row.referrer_id]) {
        if (!customersMap[row.referrer_id]) {
          continue;
        }

        referralEntriesMap[row.referrer_id] = {
          referrer: customersMap[row.referrer_id],
          referees: [],
        };

        const matchingTierObj =
          referralMapLookup[`tier${row.tier + startTier}`];
        if (matchingTierObj) {
          matchingTierObj.referralEntries.push(
            referralEntriesMap[row.referrer_id]
          );
        }
      }

      if (!customersMap[row.referee_id]) {
        continue;
      }

      referralEntriesMap[row.referrer_id].referees.push(
        customersMap[row.referee_id]
      );
    }

    const filteredReferralMap = referralMap.filter(
      (map) => map.referralEntries.length > 0
    );

    return filteredReferralMap;
  }

  // async getReferralMap(
  //   referrerId: number,
  //   startTier = 0
  // ): Promise<ReferralMap[]> {
  //   const referrerExists = await this.prisma.customer.findUnique({
  //     where: { customerId: referrerId },
  //   });

  //   if (!referrerExists) {
  //     throw new NotFoundException(ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
  //   }

  //   if (startTier < 0) {
  //     throw new BadRequestException(
  //       ERROR_MESSAGES.START_TIER_MUST_BE_NON_NEGATIVE
  //     );
  //   }

  //   const depth = 3;

  //   let result: Array<{
  //     referrer_id: number;
  //     referee_id: number;
  //     tier: number;
  //     customerId: number;
  //     name: string;
  //     email: string;
  //     customerStatus: (typeof PrismaCustomerStatus)[keyof typeof PrismaCustomerStatus];
  //     emailStatus: (typeof PrismaEmailStatus)[keyof typeof PrismaEmailStatus];
  //     referralCode: string;
  //     referralCustomerId: number;
  //   }>;

  //   try {
  //     const query = Prisma.sql`
  //     WITH RECURSIVE referrals ("referrer_id", "referee_id", tier) AS (
  //     SELECT "customerId", "customerId", -1 as tier
  //     FROM "Customer"
  //     WHERE "customerId" = ${referrerId}

  //     UNION

  //     SELECT "referralCustomerId", "customerId", 0 as tier
  //     FROM "Customer"
  //     WHERE "referralCustomerId" = ${referrerId}

  //     UNION ALL

  //     SELECT r."referralCustomerId", r."customerId", tier + 1
  //     FROM "Customer" r
  //     JOIN referrals ON r."referralCustomerId" = referrals."referee_id"
  //     WHERE tier < ${depth}
  //     )
  //     SELECT DISTINCT ON ("referrer_id", "referee_id") "referrer_id", "referee_id", tier, c.*
  //     FROM referrals
  //     JOIN "Customer" c ON referrals."referee_id" = c."customerId"
  //     WHERE c."customerStatus" <> ${CustomerStatus.PENDING}::"CustomerStatus"
  //     ORDER BY "referrer_id", "referee_id";
  //     `;

  //     result = await this.prisma.$queryRaw(query);
  //   } catch (error) {
  //     if (error instanceof Prisma.PrismaClientKnownRequestError) {
  //       switch (error.code) {
  //         case PRISMA_ERROR_MESSAGES.CLIENT.RAW_QUERY_FAILED:
  //           throw new BadRequestException(ERROR_MESSAGES.RAW_QUERY_FAILED);
  //         default:
  //           throw new BadRequestException(
  //             ERROR_MESSAGES.PRISMA_CLIENT_REQUEST_ERROR
  //           );
  //       }
  //     } else {
  //       throw new HttpException(
  //         ERROR_MESSAGES.UNEXPECTED_ERROR,
  //         HttpStatus.INTERNAL_SERVER_ERROR
  //       );
  //     }
  //   }

  //   // Write the output to a text file
  //   // writeDataToFile(`${this.constructor.name}/sql-query.txt`, result);

  //   // If the result is empty, return an empty array
  //   if (result.length === 0) {
  //     return [];
  //   }

  //   // Create the referralMap and a map for quick access
  //   const referralMap: ReferralMap[] = [];
  //   const referralMapLookup: { [tier: string]: ReferralMap } = {};

  //   for (let i = 0; i <= depth; i++) {
  //     const tier = `tier${i + startTier}`;
  //     const referralMapEntry = {
  //       tier,
  //       referralEntries: [],
  //     };
  //     referralMap.push(referralMapEntry);
  //     referralMapLookup[tier] = referralMapEntry;
  //   }

  //   const referralEntriesMap: { [referrerId: number]: ReferralEntry } = {};
  //   const customersMap: { [customerId: number]: Customer } = {};

  //   for (const row of result) {
  //     if (row.tier === -1) {
  //       customersMap[row.referrer_id] = {
  //         customerId: row.customerId,
  //         name: row.name,
  //         email: row.email,
  //         customerStatus: row.customerStatus,
  //         emailStatus: row.emailStatus,
  //         referralCode: row.referralCode,
  //         referralCustomerId: row.referralCustomerId,
  //       };
  //       continue;
  //     }

  //     if (!customersMap[row.referee_id]) {
  //       customersMap[row.referee_id] = {
  //         customerId: row.customerId,
  //         name: row.name,
  //         email: row.email,
  //         customerStatus: row.customerStatus,
  //         emailStatus: row.emailStatus,
  //         referralCode: row.referralCode,
  //         referralCustomerId: row.referralCustomerId,
  //       };
  //     }

  //     if (!referralEntriesMap[row.referrer_id]) {
  //       if (!customersMap[row.referrer_id]) {
  //         continue;
  //       }

  //       referralEntriesMap[row.referrer_id] = {
  //         referrer: customersMap[row.referrer_id],
  //         referees: [],
  //       };

  //       const matchingTierObj =
  //         referralMapLookup[`tier${row.tier + startTier}`];
  //       if (matchingTierObj) {
  //         matchingTierObj.referralEntries.push(
  //           referralEntriesMap[row.referrer_id]
  //         );
  //       }
  //     }

  //     if (!customersMap[row.referee_id]) {
  //       continue;
  //     }

  //     referralEntriesMap[row.referrer_id].referees.push(
  //       customersMap[row.referee_id]
  //     );
  //   }

  //   const filteredReferralMap = referralMap.filter(
  //     (map) => map.referralEntries.length > 0
  //   );

  //   // Write the output to a text file
  //   // writeDataToFile(
  //   //   `${this.constructor.name}/referral-map.txt`,
  //   //   filteredReferralMap
  //   // );

  //   return filteredReferralMap;
  // }

  // Get the number of referral tiers from the database.
  //   async getNumTier(): Promise<number> {
  //     const numTier = await this.prisma.config.findUnique({
  //       where: {
  //         configId: 1,
  //       },
  //       select: {
  //         value: true,
  //       },
  //     });
  //     return numTier.value;
  //   }
}
