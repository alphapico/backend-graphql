import { ChargeResource } from 'coinbase-commerce-node';

export interface ExtChargeResource extends ChargeResource {
  payment_threshold?: {
    overpayment_absolute_threshold: {
      amount: string;
      currency: string;
    };
    overpayment_relative_threshold: string;
    underpayment_absolute_threshold: {
      amount: string;
      currency: string;
    };
    underpayment_relative_threshold: string;
  };
  local_exchange_rates?: {
    [key: string]: string;
  };
  exchange_rates?: {
    [key: string]: string;
  };
  fee_rate: number;
}
