import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
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
import { ConfigService } from '../config/config.service';

@Injectable()
export class ReferralService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async getReferralMap(
    referrerId: number,
    startLevel = 0
  ): Promise<ReferralMap[]> {
    await this.validateInputs(referrerId, startLevel);

    // allow admin to set depth
    const depth = (await this.configService.getReferralViewLevel()) || 3;

    const result = await this.executeQuery(referrerId, depth);
    // Write the output to a text file
    writeDataToFile(`${this.constructor.name}/sql-query.txt`, result);
    const filteredReferralMap = this.constructReferralMap(
      result,
      startLevel,
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
    startLevel: number
  ): Promise<void> {
    if (!(await this.referrerExists(referrerId))) {
      throw new NotFoundException(ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    }

    if (startLevel < 0) {
      throw new BadRequestException(
        ERROR_MESSAGES.START_LEVEL_MUST_BE_NON_NEGATIVE
      );
    }
  }

  private async executeQuery(
    referrerId: number,
    depth: number
  ): Promise<ReferralResults> {
    const query = Prisma.sql`
      WITH RECURSIVE referrals ("referrer_id", "referee_id", level) AS (
      SELECT "customerId", "customerId", -1 as level
      FROM "Customer"
      WHERE "customerId" = ${referrerId}

      UNION

      SELECT "referralCustomerId", "customerId", 0 as level
      FROM "Customer"
      WHERE "referralCustomerId" = ${referrerId}

      UNION ALL

      SELECT r."referralCustomerId", r."customerId", level + 1
      FROM "Customer" r
      JOIN referrals ON r."referralCustomerId" = referrals."referee_id"
      WHERE level < ${depth}
      )
      SELECT DISTINCT ON ("referrer_id", "referee_id") "referrer_id", "referee_id", level, c.*
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
      throw new InternalServerErrorException(ERROR_MESSAGES.UNEXPECTED_ERROR);
    }
  }

  private constructReferralMap(
    result: ReferralResults,
    startLevel: number,
    depth: number
  ): ReferralMap[] {
    // If the result is empty, return an empty array
    if (result.length === 0) {
      return [];
    }

    // Create the referralMap and a map for quick access
    const referralMap: ReferralMap[] = [];
    const referralMapLookup: { [level: string]: ReferralMap } = {};

    for (let i = 0; i <= depth; i++) {
      const level = `level${i + startLevel}`;
      const referralMapEntry = {
        level,
        referralEntries: [],
      };
      referralMap.push(referralMapEntry);
      referralMapLookup[level] = referralMapEntry;
    }

    const referralEntriesMap: { [referrerId: number]: ReferralEntry } = {};
    const customersMap: { [customerId: number]: Customer } = {};

    for (const row of result) {
      if (row.level === -1) {
        customersMap[row.referrer_id] = {
          customerId: row.customerId,
          name: row.name,
          email: row.email,
          customerStatus: row.customerStatus,
          emailStatus: row.emailStatus,
          referralCode: row.referralCode,
          referralCustomerId: row.referralCustomerId,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          charges: [],
          commissions: [],
          wallets: [],
          purchaseActivities: [],
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
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          charges: [],
          commissions: [],
          wallets: [],
          purchaseActivities: [],
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

        const matchingLevelObj =
          referralMapLookup[`level${row.level + startLevel}`];
        if (matchingLevelObj) {
          matchingLevelObj.referralEntries.push(
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
}
