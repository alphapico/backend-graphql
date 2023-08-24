export const CONFIG = {
  PRESIGNED_S3_URL_TTL: 60 * 10, // 10 minutes expiration
  MIN_IMG_FILE_SIZE: 10 * 1024, // 10KB
  MAX_IMG_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  SUPPORTED_IMG_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],

  EMAIL_FOOTER: '',
  EMAIL_RESEND_MAX_ATTEMPTS: 3,
  EMAIL_RESEND_TTL: 3600,

  ACCESS_TOKEN_EXPIRATION: '15m',
  REFRESH_TOKEN_EXPIRATION: '1d',
  EMAIL_TOKEN_EXPIRATION: '1h',

  COINBASE_SUPPORTED_FIAT: ['USD', 'GBP', 'EUR'],
};

function formatCurrencies(currencies: string[]): string {
  const copiedCurrencies = [...currencies]; // Make a copy of the currencies array

  if (copiedCurrencies.length === 0) return '';
  if (copiedCurrencies.length === 1) return copiedCurrencies[0];

  const lastCurrency = copiedCurrencies.pop();
  return `${copiedCurrencies.join(', ')} or ${lastCurrency}`;
}

export const supportedCurrencyList = formatCurrencies(
  CONFIG.COINBASE_SUPPORTED_FIAT
);
