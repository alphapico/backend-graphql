import { Resolver, Query, Args } from '@nestjs/graphql';
import { ReferralService } from './referral.service';
import { ReferralMap } from './dto/referral.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReferralInput } from './dto/referral.input';

@Resolver()
export class ReferralResolver {
  constructor(private readonly referralService: ReferralService) {}

  @Query(() => [ReferralMap], { name: 'getReferralMap' })
  @UseGuards(JwtAuthGuard)
  async getReferralMap(
    @Args('input') input: ReferralInput
  ): Promise<ReferralMap[]> {
    return this.referralService.getReferralMap(
      input.referrerId,
      input.startLevel
    );
  }
}
