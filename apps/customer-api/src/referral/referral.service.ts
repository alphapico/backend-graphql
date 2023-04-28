import { Injectable } from '@nestjs/common';
import { PrismaService } from '@charonium/prisma';
import { Referrer, Referree, TierMap } from './dto/referral.dto';

@Injectable()
export class ReferralService {
  constructor(private prisma: PrismaService) {}
  async getNextReferrer(referree: Referree[]): Promise<Referrer[]> {
    const nextReferrer = referree;
    return nextReferrer;
  }
  async getReferree(referrer: Referrer): Promise<Referree[]> {
    const prismaCustomer = await this.prisma.customer.findMany({
      where: {
        referralCustomerId: referrer.customerId,
        customerStatus: 'ACTIVE',
      },
      select: { customerId: true, name: true },
    });
    const referreeArr: Referree[] = prismaCustomer.map((prismaCustomerItem) => {
      const referral = new Referree();
      referral.customerId = prismaCustomerItem.customerId;
      referral.customerName = prismaCustomerItem.name;
      return referral;
    });
    return referreeArr;
  }
  async getTierMap(referrer: Referrer[]): Promise<TierMap[]> {
    const tierMapArr: TierMap[] = [];
    for (let i = 0; i < referrer.length; i++) {
      const referree = await this.getReferree(referrer[i]);
      const tierMap: TierMap = {
        referrer: referrer[i],
        referrees: referree,
      };
      tierMapArr.push(tierMap);
    }
    return tierMapArr;
  }
}
