export interface Commission {
  customerId: number;
  chargeId: number;
  tier: number;
  commissionRate: number;
  amount: number;
  currency: string;
}
