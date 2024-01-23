export interface Image {
  imageId: string;
  path: string;
  type: string;
  customerId: string;
  packageId: string;
  createdAt: string;
}

export interface Wallet {
  walletId: string;
  customerId: string;
  address: string;
  cryptoType: string;
  isDefault: boolean;
}

export interface Commission {
  commissionId: string;
  customerId: string;
  chargeId: string;
  tier: string;
  commissionRate: number;
  amount: number;
  currency: string;
  isTransferred: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Charge {
  chargeId: string;
  code: string;
  name: string;
  description: string;
  pricingType: string;
  addresses: string[];
  pricing: string;
  exchangeRates: Record<string, number>;
  localExchangeRates: Record<string, number>;
  hostedUrl: string;
  cancelUrl: string;
  redirectUrl: string;
  feeRate: number;
  expiresAt: string;
  paymentThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  customerId: string;
  name: string;
  email: string;
  emailStatus: string;
  customerStatus: string;
  referralCode: string;
  referralCustomerId: string;
  referrer: Customer;
  referees: Customer[];
  charges: Charge[];
  commissions: Commission[];
  wallets: Wallet[];
  image: Image;
  createdAt: string;
  updatedAt: string;
}
