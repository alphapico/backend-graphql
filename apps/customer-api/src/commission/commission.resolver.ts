import { Resolver, Query, Args, Int, Mutation, Info } from '@nestjs/graphql';
import { CommissionService } from './commission.service'; // Assuming the service is in the same directory
import { PurchaseActivityResult } from './dto/purchase-activity.dto';
import { CommissionResult } from './dto/commission.dto';
import { CommissionBase } from './dto/commission.base.dto';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import {
  CurrentUser,
  DESCRIPTION,
  IJwtPayload,
  PaymentStatus,
} from '@charonium/common';
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
    description: DESCRIPTION.GET_PURCHASE_ACTIVITIES,
  })
  @UseGuards(AdminGuard)
  async getPurchaseActivities(
    @Info() info: any,
    @Args('cursor', {
      type: () => Int,
      nullable: true,
      description:
        'An optional argument representing the ID of the last fetched item from a ' +
        'previous query. This helps in paginating results by picking up from where ' +
        'the last query left off. If it is the first query, set cursor to `null`.',
    })
    cursor?: number,
    @Args('limit', {
      type: () => Int,
      defaultValue: 10,
      description:
        'Specifies the maximum number of items to fetch in the query.',
    })
    limit?: number,
    @Args('purchaseConfirmed', {
      type: () => Boolean,
      nullable: true,
      description:
        'An optional argument to filter the results based on whether ' +
        'the purchase has been confirmed.',
    })
    purchaseConfirmed?: boolean,
    @Args('paymentStatus', {
      type: () => PaymentStatus,
      nullable: true,
      description:
        'An optional argument to filter the results based on their payment status.',
    })
    paymentStatus?: PaymentStatus,
    @Args('customerId', {
      type: () => Int,
      nullable: true,
      description:
        'An optional argument to filter the results based on the Customer ID.',
    })
    customerId?: number
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
    description: DESCRIPTION.GET_PURCHASE_ACTIVITIES_FOR_CUSTOMER,
  })
  @UseGuards(JwtAuthGuard)
  async getPurchaseActivitiesForCustomer(
    @CurrentUser() user: IJwtPayload,
    @Info() info: any,
    @Args('cursor', {
      type: () => Int,
      nullable: true,
      description:
        'An optional argument representing the ID of the last fetched item from a ' +
        'previous query. This helps in paginating results by picking up from where ' +
        'the last query left off. If it is the first query, set cursor to `null`.',
    })
    cursor?: number,
    @Args('limit', {
      type: () => Int,
      defaultValue: 10,
      description:
        'Specifies the maximum number of items to fetch in the query.',
    })
    limit?: number,
    @Args('purchaseConfirmed', {
      type: () => Boolean,
      nullable: true,
      description:
        'An optional argument to filter the results based on whether ' +
        'the purchase has been confirmed.',
    })
    purchaseConfirmed?: boolean,
    @Args('paymentStatus', {
      type: () => PaymentStatus,
      nullable: true,
      description:
        'An optional argument to filter the results based on their payment status.',
    })
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
    description: DESCRIPTION.GET_COMMISSIONS,
  })
  @UseGuards(AdminGuard)
  async getCommissions(
    @Info() info: any,
    @Args('cursor', {
      type: () => Int,
      nullable: true,
      description:
        'An optional argument representing the ID of the last fetched item from a ' +
        'previous query. This helps in paginating results by picking up from where ' +
        'the last query left off. If it is the first query, set cursor to `null`.',
    })
    cursor?: number,
    @Args('limit', {
      type: () => Int,
      nullable: true,
      description:
        'Specifies the maximum number of items to fetch in the query.',
    })
    limit?: number,
    @Args('customerId', {
      type: () => Int,
      nullable: true,
      description:
        'An optional argument to filter the results based on the Customer ID.',
    })
    customerId?: number,
    @Args('isTransferred', {
      type: () => Boolean,
      nullable: true,
      description:
        'An optional filter to include only records where the funds have either been transferred to the wallet ' +
        '(when set to `true`), are pending transfer (when set to `false`), or neither (when not provided), ' +
        'returning all records regardless of transfer status.',
    })
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
    description: DESCRIPTION.GET_COMMISSIONS_FOR_CUSTOMER,
  })
  @UseGuards(JwtAuthGuard)
  async getCommissionsForCustomer(
    @CurrentUser() user: IJwtPayload,
    @Info() info: any,
    @Args('cursor', {
      type: () => Int,
      nullable: true,
      description:
        'An optional argument representing the ID of the last fetched item from a ' +
        'previous query. This helps in paginating results by picking up from where ' +
        'the last query left off. If it is the first query, set cursor to `null`.',
    })
    cursor?: number,
    @Args('limit', {
      type: () => Int,
      nullable: true,
      description:
        'Specifies the maximum number of items to fetch in the query.',
    })
    limit?: number,
    @Args('isTransferred', {
      type: () => Boolean,
      nullable: true,
      description:
        'An optional filter to include only records where the funds have either been transferred to the wallet ' +
        '(when set to `true`), are pending transfer (when set to `false`), or neither (when not provided), ' +
        'returning all records regardless of transfer status.',
    })
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

  @Mutation(() => CommissionBase, {
    description: DESCRIPTION.UPDATE_COMMISSION_TRANSFER_STATUS,
  })
  @UseGuards(AdminGuard)
  async updateCommissionTransferStatus(
    @Args('commissionId', { type: () => Int }) commissionId: number
  ): Promise<CommissionBase> {
    return this.commissionService.updateCommissionTransferStatus(commissionId);
  }

  @Query(() => Boolean, { description: DESCRIPTION.IS_COMMISSION_TRANSFERRED })
  @UseGuards(AdminGuard)
  async isCommissionTransferred(
    @Args('commissionId', { type: () => Int }) commissionId: number
  ): Promise<boolean> {
    return this.commissionService.isCommissionTransferred(commissionId);
  }

  @Query(() => ChargeResult, { description: DESCRIPTION.GET_CHARGES })
  async getCharges(
    @Info() info: any,
    @Args('cursor', {
      type: () => Int,
      nullable: true,
      description:
        'An optional argument representing the ID of the last fetched item from a ' +
        'previous query. This helps in paginating results by picking up from where ' +
        'the last query left off. If it is the first query, set cursor to `null`.',
    })
    cursor?: number,
    @Args('limit', {
      type: () => Int,
      defaultValue: 10,
      description:
        'Specifies the maximum number of items to fetch in the query.',
    })
    limit?: number,
    @Args('customerId', {
      type: () => Int,
      nullable: true,
      description:
        'An optional argument to filter the results based on the Customer ID.',
    })
    customerId?: number,
    @Args('code', {
      type: () => String,
      nullable: true,
      description:
        'An optional argument to filter the results based on the Charge Code.',
    })
    code?: string
  ): Promise<ChargeResult> {
    return this.commissionService.getCharges(
      info,
      cursor,
      limit,
      customerId,
      code
    );
  }

  @Mutation(() => CommissionTier, {
    description: DESCRIPTION.CREATE_COMMISSION_TIER,
  })
  @UseGuards(AdminGuard)
  async createCommissionTier(
    @Args('input') input: CreateCommissionTierInput
  ): Promise<CommissionTier> {
    return this.commissionService.createCommissionTier(
      input.tier,
      input.commissionRate
    );
  }

  @Mutation(() => CommissionTier, {
    description: DESCRIPTION.UPDATE_COMMISSION_TIER,
  })
  @UseGuards(AdminGuard)
  async updateCommissionTier(
    @Args('input') input: UpdateCommissionTierInput
  ): Promise<CommissionTier> {
    return this.commissionService.updateCommissionTier(
      input.tier,
      input.commissionRate
    );
  }

  @Mutation(() => CommissionTier, {
    description: DESCRIPTION.DELETE_COMMISSION_TIER,
  })
  @UseGuards(AdminGuard)
  async deleteCommissionTier(
    @Args('tier', { type: () => Int }) tier: number
  ): Promise<CommissionTier> {
    return this.commissionService.deleteCommissionTier(tier);
  }

  @Query(() => [CommissionRate], {
    description: DESCRIPTION.GET_ALL_COMMISSION_RATES,
  })
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
