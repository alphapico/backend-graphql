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
  VAL: {
    IS_STRING: '$property must be a string',
    IS_EMAIL: '$property must be an email',
    IS_NOT_EMPTY: '$property should not be empty',
    MIN_LENGTH:
      '$property must be longer than or equal to $constraint1 characters',
    MAX_LENGTH:
      '$property must be shorter than or equal to $constraint1 characters',
  },

  EMAIL_ERROR: {
    TOKEN_EXPIRED: 'Verification token has expired',
    TOKEN_INVALID: 'Verification token is invalid',
    CUSTOMER_NOT_FOUND: 'Customer associated with the token was not found',
    FAILED_TO_SEND_VERIFICATION: 'Failed to send email verification',
    FAILED_TO_SEND_PASSWORD_RESET: 'Failed to send email password reset',
    FAILED_TO_SEND_ADMIN_REGISTRATION:
      'Failed to send email admin registration',
  },
};
