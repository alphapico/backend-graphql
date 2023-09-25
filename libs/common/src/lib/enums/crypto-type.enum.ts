import { registerEnumType } from '@nestjs/graphql';

export enum CryptoType {
  DAI = 'DAI',
  USDC = 'USDC',
  PUSDC = 'PUSDC',
  PWETH = 'PWETH',
  USDT = 'USDT',
  APE = 'APE',
  BTC = 'BTC',
  PMATIC = 'PMATIC',
  DOGE = 'DOGE',
  ETH = 'ETH',
  LTC = 'LTC',
  SHIB = 'SHIB',
  BCH = 'BCH',
}

registerEnumType(CryptoType, { name: 'CryptoType' });
