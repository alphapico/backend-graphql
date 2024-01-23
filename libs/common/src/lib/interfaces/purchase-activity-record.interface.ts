import { PaymentStatus, UnresolvedReason } from '../enums';

export interface PurchaseActivityRecord {
  package?: {
    packageId?: number;
    name?: string;
    description?: string;
    tokenAmount?: number;
    price?: number;
    currency?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  };
  tokenPrice?: {
    tokenPriceId?: number;
    currency?: string;
    price?: number;
    createdAt?: Date;
    updatedAt?: Date;
  };
  charge?: {
    chargeId?: number;
    customerId?: number;
    code?: string;
    name?: string;
    description?: string;
    pricingType?: string;
    pricing?: JSON;
    addresses?: JSON;
    exchangeRates?: JSON;
    localExchangeRates?: JSON;
    hostedUrl?: string;
    cancelUrl?: string;
    redirectUrl?: string;
    feeRate?: number;
    expiresAt?: Date;
    paymentThreshold?: JSON;
    createdAt?: Date;
    updatedAt?: Date;
    payments?: {
      paymentId?: number;
      chargeId?: number;
      network?: string;
      transaction?: string;
      value?: JSON;
      type?: string;
      status?: string;
      paymentStatus?: PaymentStatus;
      unresolvedReason?: UnresolvedReason;
      createdAt?: Date;
      updatedAt?: Date;
    }[];
    commissions?: {
      commissionId?: number;
      customerId?: number;
      chargeId?: number;
      tier?: number;
      commissionRate?: number;
      amount?: number;
      currency?: string;
      isTransferred?: boolean;
      createdAt?: Date;
      updatedAt?: Date;
    }[];
  };
}
