import { supportedCurrencyList } from './config.constant';

export const ERROR_MESSAGES = {
  INVALID_REFERRAL_CODE: 'Invalid referral code',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  INVALID_INPUT_EMAIL: 'Customer associated with this email does not exist',
  INVALID_INPUT_PASSWORD: 'Incorrect password',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  INVALID_ACCESS_TOKEN: 'Invalid access token',
  CUSTOMER_NOT_FOUND: 'Customer not found',
  CUSTOMER_NOT_VERIFIED: 'Customer not verified',
  CUSTOMER_SUSPENDED: 'Customer is suspended',
  TOO_MANY_ATTEMPTS: 'Too many attempts',
  INVALID_FILE_EXTENSION: 'Invalid file extension',
  FAILED_GENERATE_PRESIGNED_URL: 'Failed to generate pre-signed URL',
  START_TIER_MUST_BE_NON_NEGATIVE: 'Start tier must be non-negative',
  RAW_QUERY_FAILED: 'Raw query failed',
  PRISMA_CLIENT_REQUEST_ERROR: 'Client request error',
  UNEXPECTED_ERROR: 'An unexpected error occurred',
  FAILED_CREATE_CHARGE: 'Failed to create charge',
  UNEXPECTED_CHARGE_STRUCTURE: 'Unexpected charge object structure',
  CHARGE_NOT_FOUND: 'Charge not found',
  PAYMENT_NOT_FOUND: 'Payment not found',
  CURRENCY_MISMATCH: 'Currency mismatch',
  TOKEN_PACKAGE_NOT_FOUND: 'Token Package not found',
  TOKEN_PRICE_NOT_FOUND: 'Token Price not found',
  TOKEN_AMOUNT_NOT_FOUND: 'Token Amount not found',
  QUANTITY_TOKEN_NOT_PROVIDED: 'Quantity token not provided',
  FAILED_RECORDING_NEW_CHARGE: 'Failed recording new charge',
  FAILED_HANDLING_CHARGE_EVENT: 'Failed handling charge event',
  AMOUNT_NOT_FOUND: 'Amount not found',
  CURRENCY_NOT_FOUND: 'Currency not found',
  VAL: {
    IS_STRING: '$property must be a string',
    IS_EMAIL: '$property must be an email',
    IS_URL: '$property must be a URL',
    IS_NOT_EMPTY: '$property should not be empty',
    IS_VALID_CURRENCY_FORMAT: 'Invalid currency format',
    IS_SUPPORTED_CURRENCY: `currency must be one of the following: ${supportedCurrencyList}`,
    IS_CURRENCY_FORMAT: 'price must be a valid currency format',
    MIN_LENGTH:
      '$property must be longer than or equal to $constraint1 characters',
    MAX_LENGTH:
      '$property must be shorter than or equal to $constraint1 characters',
  },
  PRISMA: {
    DATABASE_ERROR: 'Database error',
  },

  EMAIL_ERROR: {
    TOKEN_EXPIRED: 'Verification token has expired',
    TOKEN_INVALID: 'Verification token is invalid',
    CUSTOMER_NOT_FOUND: 'Customer associated with the token was not found',
    FAILED_TO_SEND_VERIFICATION: 'Failed to send email verification',
    FAILED_TO_SEND_PASSWORD_RESET: 'Failed to send email password reset',
    FAILED_TO_SEND_ADMIN_REGISTRATION:
      'Failed to send email admin registration',
    FAILED_TO_SEND_WELCOME: 'Failed to send email welcome',
    FAILED_TO_SEND_UNRESOLVED_UNDERPAID:
      'Failed to send Unresolved (Underpaid) email',
    FAILED_TO_SEND_ADMIN_UNRESOLVED_UNDERPAID:
      'Failed to send Unresolved (Underpaid) email to Admin',
    FAILED_TO_SEND_ADMIN_UNRESOLVED_OVERPAID:
      'Failed to send Unresolved (Overpaid) email to Admin',
    FAILED_TO_SEND_ADMIN_UNRESOLVED_DELAYED:
      'Failed to send Unresolved (Delayed) email to Admin',
    FAILED_TO_SEND_ADMIN_UNRESOLVED_MULTIPLE:
      'Failed to send Unresolved (Multiple) email to Admin',
    FAILED_TO_SEND_ADMIN_UNRESOLVED_OTHER:
      'Failed to send Unresolved (Other) email to Admin',
  },
};
