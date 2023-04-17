import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { ReferralService } from './referral.service';
import { Referrer, ReferralMap, Referree } from './dto/referral.dto';
import { PrismaService } from '../prisma/prisma.service';

@Resolver()
export class ReferralResolver {
    constructor(
        private referralService: ReferralService,
        private prisma: PrismaService
    ) { }
    @Query(() => [ReferralMap])
    async getReferralMap(@Args("customerId", { type: () => Int }) customerId: number): Promise<ReferralMap[]> {
        const referralMapArr: ReferralMap[] = [];
        const referrer = new Referrer();
        const config = await this.prisma.config.findFirst({
            where: { configId: 1 },
            select: { value: true }
        });
        const customerName = await this.prisma.customer.findFirst({
            where: { customerId: customerId },
            select: { name: true }
        });
        const numTier = config.value;
        let referrerArr = [];
        referrer.customerId = customerId;
        referrer.customerName = customerName.name;
        referrerArr.push(referrer);
        for (let i = 0; i <= numTier; i++) {
            const tmpReferralMap = await this.referralService.getTierMap(referrerArr);
            const tmpReferreeArr = tmpReferralMap.map(item => item.referrees);
            const referralMap: ReferralMap = {
                tier: i,
                tierMaps: tmpReferralMap
            }
            referralMapArr.push(referralMap);
            referrerArr = await this.referralService.getNextReferrer(tmpReferreeArr.flat());
        }
        return referralMapArr;
    }
}
