import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { CommissionService } from './commission.service'; // Assuming the service is in the same directory
import { PurchaseActivityResult } from './dto/purchase-activity.dto';
import { PurchaseActivityBaseResult } from './dto/purchase-activity.base.dto';
import { CommissionResult } from './dto/commission.dto';
import {
  CommissionBase,
  CommissionBaseResult,
} from './dto/commission.base.dto';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser, IJwtPayload } from '@charonium/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver()
export class CommissionResolver {
  constructor(private readonly commissionService: CommissionService) {}

  @Query(() => PurchaseActivityResult, {
    name: 'getPurchaseActivitiesWithDetails',
  })
  @UseGuards(AdminGuard)
  async getPurchaseActivitiesWithDetails(
    @Args('cursor', { type: () => Int, nullable: true }) cursor?: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit?: number
  ): Promise<PurchaseActivityResult> {
    const result =
      await this.commissionService.getPurchaseActivitiesWithDetails(
        cursor,
        limit
      );
    return result;
  }

  @Query(() => PurchaseActivityBaseResult, {
    name: 'getPurchaseActivities',
  })
  @UseGuards(AdminGuard)
  async getPurchaseActivities(
    @Args('cursor', { type: () => Int, nullable: true }) cursor?: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit?: number
  ): Promise<PurchaseActivityBaseResult> {
    const result = await this.commissionService.getPurchaseActivities(
      cursor,
      limit
    );
    return result;
  }

  @Query(() => CommissionResult, {
    name: 'getCommissionsWithDetails',
  })
  @UseGuards(AdminGuard)
  async getCommissionsWithDetails(
    @Args('cursor', { type: () => Int, nullable: true }) cursor?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('customerId', { type: () => Int, nullable: true })
    customerId?: number,
    @Args('isTransferred', { type: () => Boolean, nullable: true })
    isTransferred?: boolean
  ): Promise<CommissionResult> {
    return this.commissionService.getCommissionsWithDetails(
      cursor,
      limit,
      customerId,
      isTransferred
    );
  }

  @Query(() => CommissionBaseResult, {
    name: 'getCommissions',
  })
  @UseGuards(AdminGuard)
  async getCommissions(
    @Args('cursor', { type: () => Int, nullable: true }) cursor?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('customerId', { type: () => Int, nullable: true })
    customerId?: number,
    @Args('isTransferred', { type: () => Boolean, nullable: true })
    isTransferred?: boolean
  ): Promise<CommissionBaseResult> {
    return this.commissionService.getCommissions(
      cursor,
      limit,
      customerId,
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

  @Query(() => CommissionBaseResult, {
    name: 'getCommissionsForCustomer',
  })
  @UseGuards(JwtAuthGuard)
  async getCommissionsForCustomer(
    @CurrentUser() user: IJwtPayload,
    @Args('cursor', { type: () => Int, nullable: true }) cursor?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('isTransferred', { type: () => Boolean, nullable: true })
    isTransferred?: boolean
  ): Promise<CommissionBaseResult> {
    return this.commissionService.getCommissionsForCustomer(
      user.sub,
      cursor,
      limit,
      isTransferred
    );
  }

  @Query(() => CommissionResult, {
    name: 'getCommissionsWithDetailsForCustomer',
  })
  @UseGuards(JwtAuthGuard)
  async getCommissionsWithDetailsForCustomer(
    @CurrentUser() user: IJwtPayload,
    @Args('cursor', { type: () => Int, nullable: true }) cursor?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('isTransferred', { type: () => Boolean, nullable: true })
    isTransferred?: boolean
  ): Promise<CommissionResult> {
    return this.commissionService.getCommissionsWithDetailsForCustomer(
      user.sub,
      cursor,
      limit,
      isTransferred
    );
  }
}
