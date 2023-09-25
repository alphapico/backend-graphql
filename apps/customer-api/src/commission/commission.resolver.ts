import { Resolver, Query, Args, Int, Mutation, Info } from '@nestjs/graphql';
import { CommissionService } from './commission.service'; // Assuming the service is in the same directory
import { PurchaseActivityResult } from './dto/purchase-activity.dto';
import { CommissionResult } from './dto/commission.dto';
import { CommissionBase } from './dto/commission.base.dto';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser, IJwtPayload, PaymentStatus } from '@charonium/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChargeResult } from './dto/charge.dto';
import {
  CommissionRate,
  CommissionTier,
  CreateCommissionTierInput,
  UpdateCommissionTierInput,
} from './dto/commission-tier.dto';
import { ReferrerResult } from './dto/referrer-result.dto';

@Resolver()
export class CommissionResolver {
  constructor(private readonly commissionService: CommissionService) {}

  @Query(() => PurchaseActivityResult, {
    name: 'getPurchaseActivities',
  })
  @UseGuards(AdminGuard)
  async getPurchaseActivities(
    @Info() info: any,
    @Args('cursor', { type: () => Int, nullable: true }) cursor?: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit?: number,
    @Args('purchaseConfirmed', { type: () => Boolean, nullable: true })
    purchaseConfirmed?: boolean,
    @Args('paymentStatus', { type: () => PaymentStatus, nullable: true })
    paymentStatus?: PaymentStatus,
    @Args('customerId', { type: () => Int, nullable: true }) customerId?: number
  ): Promise<PurchaseActivityResult> {
    return this.commissionService.getPurchaseActivities(
      info,
      cursor,
      limit,
      purchaseConfirmed,
      paymentStatus,
      customerId
    );
  }

  @Query(() => PurchaseActivityResult, {
    name: 'getPurchaseActivitiesForCustomer',
  })
  @UseGuards(JwtAuthGuard)
  async getPurchaseActivitiesForCustomer(
    @CurrentUser() user: IJwtPayload,
    @Info() info: any,
    @Args('cursor', { type: () => Int, nullable: true }) cursor?: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit?: number,
    @Args('purchaseConfirmed', { type: () => Boolean, nullable: true })
    purchaseConfirmed?: boolean,
    @Args('paymentStatus', { type: () => PaymentStatus, nullable: true })
    paymentStatus?: PaymentStatus
  ): Promise<PurchaseActivityResult> {
    return this.commissionService.getPurchaseActivities(
      info,
      cursor,
      limit,
      purchaseConfirmed,
      paymentStatus,
      user.sub
    );
  }

  @Query(() => CommissionResult, {
    name: 'getCommissions',
  })
  @UseGuards(AdminGuard)
  async getCommissions(
    @Info() info: any,
    @Args('cursor', { type: () => Int, nullable: true }) cursor?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('customerId', { type: () => Int, nullable: true })
    customerId?: number,
    @Args('isTransferred', { type: () => Boolean, nullable: true })
    isTransferred?: boolean
  ): Promise<CommissionResult> {
    return this.commissionService.getCommissions(
      info,
      cursor,
      limit,
      customerId,
      isTransferred
    );
  }

  @Query(() => CommissionResult, {
    name: 'getCommissionsForCustomer',
  })
  @UseGuards(JwtAuthGuard)
  async getCommissionsForCustomer(
    @CurrentUser() user: IJwtPayload,
    @Info() info: any,
    @Args('cursor', { type: () => Int, nullable: true }) cursor?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('isTransferred', { type: () => Boolean, nullable: true })
    isTransferred?: boolean
  ): Promise<CommissionResult> {
    return this.commissionService.getCommissions(
      info,
      cursor,
      limit,
      user.sub,
      isTransferred
    );
  }

  @Mutation(() => CommissionBase)
  @UseGuards(AdminGuard)
  async updateCommissionTransferStatus(
    @Args('commissionId', { type: () => Int }) commissionId: number
  ): Promise<CommissionBase> {
    return this.commissionService.updateCommissionTransferStatus(commissionId);
  }

  @Query(() => Boolean)
  @UseGuards(AdminGuard)
  async isCommissionTransferred(
    @Args('commissionId', { type: () => Int }) commissionId: number
  ): Promise<boolean> {
    return this.commissionService.isCommissionTransferred(commissionId);
  }

  @Query(() => ChargeResult)
  async getCharges(
    @Info() info: any,
    @Args('cursor', { type: () => Int, nullable: true }) cursor?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('customerId', { type: () => Int, nullable: true })
    customerId?: number,
    @Args('code', { type: () => String, nullable: true }) code?: string
  ): Promise<ChargeResult> {
    return this.commissionService.getCharges(
      info,
      cursor,
      limit,
      customerId,
      code
    );
  }

  @Mutation(() => CommissionTier)
  @UseGuards(AdminGuard)
  async createCommissionTier(
    @Args('input') input: CreateCommissionTierInput
  ): Promise<CommissionTier> {
    return this.commissionService.createCommissionTier(
      input.tier,
      input.commissionRate
    );
  }

  @Mutation(() => CommissionTier)
  @UseGuards(AdminGuard)
  async updateCommissionTier(
    @Args('input') input: UpdateCommissionTierInput
  ): Promise<CommissionTier> {
    return this.commissionService.updateCommissionTier(
      input.tier,
      input.commissionRate
    );
  }

  @Mutation(() => CommissionTier)
  @UseGuards(AdminGuard)
  async deleteCommissionTier(
    @Args('tier', { type: () => Int }) tier: number
  ): Promise<CommissionTier> {
    return this.commissionService.deleteCommissionTier(tier);
  }

  @Query(() => [CommissionRate])
  @UseGuards(JwtAuthGuard)
  async getAllCommissionRates(): Promise<CommissionRate[]> {
    const ratesMap = await this.commissionService.getAllCommissionRates();
    const ratesArray: CommissionRate[] = [];

    for (const [tier, commissionRate] of Object.entries(ratesMap)) {
      ratesArray.push({
        tier: parseInt(tier),
        commissionRate: commissionRate,
      });
    }

    return ratesArray;
  }

  @Query(() => [ReferrerResult])
  @UseGuards(AdminGuard)
  async getAllReferrers(
    @Args('referralCustomerId', { type: () => Int, nullable: true })
    referralCustomerId: number,
    @Args('tier', { type: () => Int })
    tier: number
  ): Promise<ReferrerResult[]> {
    return this.commissionService.getAllReferrers(referralCustomerId, tier);
  }

  @Mutation(() => Int)
  @UseGuards(AdminGuard)
  async calculateCommission(
    @Args('chargeCode')
    chargeCode: string
  ): Promise<number> {
    return this.commissionService.calculateCommission(chargeCode);
  }
}
