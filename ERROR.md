# Error Documentation

## HTTPException

|                       Exception                        | Code                       | Status Code | Message                    | Use When                                                                                                                                           |
| :----------------------------------------------------: | -------------------------- | ----------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
|     $${\textcolor{Orange}{BadRequestException}}$$      | BAD_REQUEST                | 400         | Bad Request                | The request has bad syntax or is incomplete.                                                                                                       |
|    $${\textcolor{Orange}{UnauthorizedException}}$$     | UNAUTHORIZED               | 401         | Unauthorized               | Authentication is required and has failed or has not been provided.                                                                                |
|      $${\textcolor{Orange}{NotFoundException}}$$       | NOT_FOUND                  | 404         | Not Found                  | The requested resource could not be found.                                                                                                         |
|      $${\textcolor{Orange}{ForbiddenException}}$$      | FORBIDDEN                  | 403         | Forbidden                  | The client does not have permission to access the requested resource.                                                                              |
|            $\text{NotAcceptableException}$             | NOT_ACCEPTABLE             | 406         | Not Acceptable             | The requested resource is only capable of generating content not acceptable by the client.                                                         |
|   $${\textcolor{Orange}{RequestTimeoutException}}$$    | REQUEST_TIMEOUT            | 408         | Request Timeout            | The server timed out waiting for the request.                                                                                                      |
|               $\text{ConflictException}$               | CONFLICT                   | 409         | Conflict                   | The request could not be completed due to a conflict with the current state of the target resource.                                                |
|                 $\text{GoneException}$                 | GONE                       | 410         | Gone                       | The requested resource is no longer available and will not be available again.                                                                     |
|       $\text{HttpVersionNotSupportedException}$        | HTTP_VERSION_NOT_SUPPORTED | 505         | HTTP Version Not Supported | The server does not support the HTTP protocol version used in the request.                                                                         |
|           $\text{PayloadTooLargeException}$            | PAYLOAD_TOO_LARGE          | 413         | Payload Too Large          | The request is larger than the server is willing or able to process.                                                                               |
|         $\text{UnsupportedMediaTypeException}$         | UNSUPPORTED_MEDIA_TYPE     | 415         | Unsupported Media Type     | The request entity has a media type that the server or resource does not support.                                                                  |
|         $\text{UnprocessableEntityException}$          | UNPROCESSABLE_ENTITY       | 422         | Unprocessable Entity       | The server understands the content type of the request entity, but the server is unable to process it.                                             |
| $${\textcolor{Orange}{InternalServerErrorException}}$$ | INTERNAL_SERVER_ERROR      | 500         | Internal Server Error      | A generic error message when an unexpected condition was encountered and no more specific message exists.                                          |
|   $${\textcolor{Orange}{NotImplementedException}}$$    | NOT_IMPLEMENTED            | 501         | Not Implemented            | The server lacks the ability to fulfill the request, usually due to an unimplemented feature or method.                                            |
|              $\text{ImATeapotException}$               | I_AM_A_TEAPOT              | 418         | I'm a teapot               | As an April Fools' joke or as a light-hearted way to indicate a non-standard error condition. . It's not meant to be used in serious applications. |
|  $${\textcolor{Orange}{MethodNotAllowedException}}$$   | METHOD_NOT_ALLOWED         | 405         | Method Not Allowed         | The client sends an HTTP request with a method not supported for the requested resource.                                                           |
|              $\text{BadGatewayException}$              | BAD_GATEWAY                | 502         | Bad Gateway                | The server is acting as a proxy or gateway and received an invalid response from the upstream server.                                              |
| $${\textcolor{Orange}{ServiceUnavailableException}}$$  | SERVICE_UNAVAILABLE        | 503         | Service Unavailable        | The server is currently unable to handle the request due to temporary overload or maintenance.                                                     |
|            $\text{GatewayTimeoutException}$            | GATEWAY_TIMEOUT            | 504         | Gateway Timeout            | The server is acting as a proxy or gateway and did not receive a timely response from the upstream server.                                         |
|          $\text{PreconditionFailedException}$          | PRECONDITION_FAILED        | 412         | Precondition Failed        | One or more conditions specified in the request headers evaluate to false on the server                                                            |

<br />

## Error Handling

From GraphQL Output, notice that `message` key can has value `string`, `array` or totally not exist

```tsx
// Example 1
// it should not register a new customer with an invalid referral code
"extensions": {
      "code": "BAD_REQUEST",
      "originalError": {
        "statusCode": 400,
        "message": "Invalid referral code.",
        "error": "Bad Request"
      }
    }

// Example 2
// it should not register a new customer with an invalid email
"extensions": {
        "code": "BAD_REQUEST",
        "originalError": {
          "statusCode": 400,
          "message": [
            "email must be an email"
          ],
          "error": "Bad Request"
        }
      }

// Example 3
// it should not register a new customer with missing required fields
"extensions": {
              "code": "BAD_USER_INPUT"
            }
```

### List of error messages

```tsx
// libs/common/src/lib/constants/error-messages.constant.ts
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
  START_LEVEL_MUST_BE_NON_NEGATIVE: 'Start level must be non-negative',
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
  WALLET_NOT_FOUND: 'Wallet not found',
  ETH_WALLET_REQUIRED: 'You must have at least one ETH wallet',
  INVALID_ETH_ADDRESS: 'Invalid ETH address',
  OPERATION_NOT_ALLOWED: 'Operation not allowed',
  TOKEN_IS_NOT_FRESH: 'Token is not fresh',
  INVALID_OLD_PASSWORD: 'Invalid old password',
  REFERRAL_CODE_REQUIRED: 'Referral code is required',
  COMMISSION_TIER_NOT_FOUND: 'Commission Tier not found',
  COMMISSION_TIER_ALREADY_EXISTS: 'Commission Tier already exists',
  VAL: {
    IS_STRING: '$property must be a string',
    IS_EMAIL: '$property must be an email',
    IS_URL: '$property must be a URL',
    IS_INT: '$property must be an integer',
    INVALID_IMAGE_TYPE: 'type must be a valid ImageType',
    INVALID_CRYPTO_TYPE: 'type must be a valid CryptoType',
    IS_NOT_EMPTY: '$property should not be empty',
    IS_VALID_CURRENCY_FORMAT: 'Invalid currency format',
    IS_SUPPORTED_CURRENCY: `currency must be one of the following: ${supportedCurrencyList}`,
    IS_CURRENCY_FORMAT: 'price must be a valid currency format',
    MIN_LENGTH: '$property must be longer than or equal to $constraint1 characters',
    MAX_LENGTH: '$property must be shorter than or equal to $constraint1 characters',
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
    FAILED_TO_SEND_ADMIN_REGISTRATION: 'Failed to send email admin registration',
    FAILED_TO_SEND_WELCOME: 'Failed to send email welcome',
    FAILED_TO_SEND_UNRESOLVED_UNDERPAID: 'Failed to send Unresolved (Underpaid) email',
    FAILED_TO_SEND_ADMIN_UNRESOLVED_UNDERPAID: 'Failed to send Unresolved (Underpaid) email to Admin',
    FAILED_TO_SEND_ADMIN_UNRESOLVED_OVERPAID: 'Failed to send Unresolved (Overpaid) email to Admin',
    FAILED_TO_SEND_ADMIN_UNRESOLVED_DELAYED: 'Failed to send Unresolved (Delayed) email to Admin',
    FAILED_TO_SEND_ADMIN_UNRESOLVED_MULTIPLE: 'Failed to send Unresolved (Multiple) email to Admin',
    FAILED_TO_SEND_ADMIN_UNRESOLVED_OTHER: 'Failed to send Unresolved (Other) email to Admin',
  },
};
```

```tsx
// libs/common/src/lib/constants/input.constant.ts
export const INPUT = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 100,
  MIN_CURRENCY_LENGTH: 3,
  MAX_CURRENCY_LENGTH: 5,
};
```

The `VAL` error message is a bit special. For example if we use `VAL.MAX_LENGTH` and apply on field `password` with constraint `MAX_PASSWORD_LENGTH = 100`, we will get the final string as `'password must be shorter than or equal to 100 characters'`. `$property` is replaced by `password`, and `$constraint1` is replaced by `100`

### List of success messages

```tsx
// libs/common/src/lib/constants/success-messages.constant.ts
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REFRESH_TOKEN_SUCCESS: 'Refresh token successful',
  SUSPEND_CUSTOMER_SUCCESS: 'Suspend customer successful',
  REINSTATE_CUSTOMER_SUCCESS: 'Reinstate customer successful',
  EMAIL_VERIFICATION_SENT: 'Email verification sent',
  EMAIL_PASSWORD_RESET_SENT: 'Email password reset sent',
  EMAIL_ADMIN_REGISTRATION_SENT: 'Email admin registration sent',
  CUSTOMER_IS_VERIFIED: 'Customer is successfully verified',
  EMAIL_WELCOME_SENT: 'Email welcome sent',
  EMAIL_UNRESOLVED_UNDERPAID_SENT: 'Email Unresolved (Underpaid) sent',
  EMAIL_ADMIN_UNRESOLVED_UNDERPAID_SENT: 'Email Unresolved (Underpaid) sent to Admin',
  EMAIL_ADMIN_UNRESOLVED_OVERPAID_SENT: 'Email Unresolved (Overpaid) sent to Admin',
  EMAIL_ADMIN_UNRESOLVED_DELAYED_SENT: 'Email Unresolved (Delayed) sent to Admin',
  EMAIL_ADMIN_UNRESOLVED_MULTIPLE_SENT: 'Email Unresolved (Multiple) sent to Admin',
  EMAIL_ADMIN_UNRESOLVED_OTHER_SEND: 'Email Unresolved (Other) sent to Admin',
};
```

<br />

## 1. Normal User Authentication

### Register

If the Admin sets the `isReferralCodeEnabled` flag in the `Config` table, the error message `"Referral code is required"` will appear if the Customer does not provide the `referralCode` during registration. `referralCode` is optional if Admin unsets the `isReferralCodeEnabled` flag.

```tsx
mutation Register($input: RegisterInput!) {
  register(input: $input){
    customerId
    customerStatus
    email
    emailStatus
    referralCustomerId
    createdAt
    updatedAt
  }
}

// example of RegisterInput
{
  "input": {
    "email": "johndoe@gmail.com",
    "name": "John Doe",
    "password": "secured-password",
    "referralCode" : "JKMUJZEU"
  }
}

// Response with Customer JSON
```

| Exception           | Code                  | Status Code | Message                                                                                                                                                           |
| ------------------- | --------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BadRequestException | BAD_REQUEST           | 400         | [ "name must be longer than or equal to 2 characters", "name must be shorter than or equal to 50 characters" "name should not be empty", "name must be a string"] |
| BadRequestException | BAD_REQUEST           | 400         | [ "email must be an email" ]                                                                                                                                      |
| BadRequestException | BAD_REQUEST           | 400         | [ "password must be longer than or equal to 8 characters", "password must be shorter than or equal to 100 characters" ]                                           |
|                     | BAD_USER_INPUT        |             |                                                                                                                                                                   |
| BadRequestException | BAD_REQUEST           | 400         | Referral code is required                                                                                                                                         |
| BadRequestException | BAD_REQUEST           | 400         | Invalid referral code                                                                                                                                             |
| ConflictException   | INTERNAL_SERVER_ERROR | 409         | Email already exists                                                                                                                                              |

<br />

### Verify Email

```tsx
mutation VerifyEmail($token: String!){
	verifyEmail(token: $token){
		success
		message
	}
}

// Example input
{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..." }
```

| Sucess | Message                           |
| ------ | --------------------------------- |
| true   | Customer is successfully verified |
| false  | Customer is suspended             |
| false  | Verification token is invalid     |

<br />

### Login

```tsx
mutation Login($input: LoginInput!) {
      login(input: $input)
    }

// Example input
{"input": {
      "email": "john.doer@gmail.com",
      "password": "password12345",
    }
}

// Response wtih String 'Login successful'
```

| Exception           | Code                  | Status Code | Message                                                                                                                 |
| ------------------- | --------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| NotFoundException   | INTERNAL_SERVER_ERROR | 404         | Customer associated with this email does not exist                                                                      |
| BadRequestException | BAD_REQUEST           | 400         | Incorrect password                                                                                                      |
| BadRequestException | BAD_REQUEST           | 400         | Customer not verified                                                                                                   |
| BadRequestException | BAD_REQUEST           | 400         | Customer is suspended                                                                                                   |
|                     | BAD_USER_INPUT        |             |                                                                                                                         |
| BadRequestException | BAD_REQUEST           | 400         | [ "email must be an email" ]                                                                                            |
| BadRequestException | BAD_REQUEST           | 400         | [ "password must be longer than or equal to 8 characters", "password must be shorter than or equal to 100 characters" ] |

<br />

## Me

`Restricted to User and Admin`

A user can query their own data

```tsx
query Me {
      me {
        customerId
        name
        email
        emailStatus
        customerStatus
        referralCode
        referralCustomerId
        referrer {
          customerId
          name
          email
          emailStatus
          customerStatus
          referralCode
          referralCustomerId
        }
        referees {
          customerId
          name
          email
          emailStatus
          customerStatus
          referralCode
          referralCustomerId
        }
        charges {
          chargeId
          code
          name
          description
          pricingType
          addresses
          pricing
          exchangeRates
          localExchangeRates
          hostedUrl
          cancelUrl
          redirectUrl
          feeRate
          expiresAt
          paymentThreshold
          createdAt
          updatedAt
        }
        commissions {
          commissionId
          customerId
          chargeId
          tier
          commissionRate
          amount
          currency
          isTransferred
          createdAt
          updatedAt
        }
        wallets {
          walletId
          customerId
          address
          cryptoType
          isDefault
        }
        purchaseActivities{
            purchaseActivityId
            purchaseCode
            customerId
            chargeId
            packageId
            tokenPriceId
            tokenAmount
            price
            amount
            currency
            purchaseConfirmed
            paymentStatus
            createdAt
            updatedAt
        }
        image {
          imageId
          path
          type
          customerId
          packageId
          createdAt
        }
        createdAt
        updatedAt
      }
    }

// response with Customer


```

| Exception             | Code                  | Status Code | Message            |
| --------------------- | --------------------- | ----------- | ------------------ |
| UnauthorizedException | UNAUTHENTICATED       | 401         | Unauthorized       |
| NotFoundException     | INTERNAL_SERVER_ERROR | 404         | Customer not found |

<br />

### Logout

`Restricted to User and Admin`

```tsx
mutation Logout {
      logout
    }

// Response with String 'Logout successful'
```

<br />

### Refresh Token

```tsx
mutation RefreshTokens {
      refreshTokens
    }

// Response with String 'Refresh token successful'
```

| Exception             | Code            | Status Code | Message               |
| --------------------- | --------------- | ----------- | --------------------- |
| UnauthorizedException | UNAUTHENTICATED | 401         | Invalid refresh token |
| UnauthorizedException | UNAUTHENTICATED | 401         | Customer not found    |
| UnauthorizedException | UNAUTHENTICATED | 401         | Customer is suspended |

<br />

### Forget Password

```tsx
mutation ForgetPassword($input: EmailInput!) {
      forgetPassword(input: $input)
    }

// Example input
{"input": {
      "email": "john.doer@gmail.com"
    }
}

// Response with Boolean true
```

| Exception           | Code                  | Status Code | Message                                            |
| ------------------- | --------------------- | ----------- | -------------------------------------------------- |
| NotFoundException   | INTERNAL_SERVER_ERROR | 404         | Customer associated with this email does not exist |
| BadRequestException | BAD_REQUEST           | 400         | [ "email must be an email" ]                       |
|                     | BAD_USER_INPUT        |             |                                                    |
| BadRequestException | BAD_REQUEST           | 400         | Too many attempts                                  |

<br />

### Reset Password

```tsx
mutation ResetPassword($input: ResetPasswordInput!) {
      resetPassword(input: $input)
    }

// Example input
{ "input": {
    "token" : "some-long-token-string",
    "newPassword" : "newpassword12345"
  }
}

// Response with Boolean true
```

| Exception           | Code                  | Status Code | Message                                                                                                                 |
| ------------------- | --------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| NotFoundException   | INTERNAL_SERVER_ERROR | 404         | Customer associated with this email does not exist                                                                      |
| BadRequestException | BAD_REQUEST           | 400         | [ "token must be a string", "token should not be empty" ]                                                               |
| BadRequestException | BAD_REQUEST           | 400         | [ "password must be longer than or equal to 8 characters", "password must be shorter than or equal to 100 characters" ] |
| BadRequestException | BAD_REQUEST           | 400         | Customer not found                                                                                                      |
|                     | BAD_USER_INPUT        |             |                                                                                                                         |

<br />

### Change Password

`Restricted to User and Admin. Fresh Access Token is required`

For enhanced security, certain actions require a fresh authentication token. If you've been logged in for more than 10 minutes, you'll need to re-login to proceed with these specific actions.

```tsx
mutation ChangePassword($input: ChangePasswordInput!) {
      changePassword(input: $input)
    }

// Example input
{ "input": {
      "oldPassword": "initialPassword123",
      "newPassword": "newPassword456",
    }
}

// Response with Boolean true if success
```

| Exception             | Code            | Status Code | Message                                                                                                                                                                                        |
| --------------------- | --------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized                                                                                                                                                                                   |
| BadRequestException   | BAD_REQUEST     | 400         | ["oldPassword must be a string", "oldPassword should not be empty", "oldPassword must be longer than or equal to 8 characters", "oldPassword must be shorter than or equal to 100 characters"] |
| BadRequestException   | BAD_REQUEST     | 400         | ["newPassword must be a string", "newPassword should not be empty", "newPassword must be longer than or equal to 8 characters", "newPassword must be shorter than or equal to 100 characters"] |
| BadRequestException   | BAD_REQUEST     | 400         | Customer not found                                                                                                                                                                             |
| BadRequestException   | BAD_REQUEST     | 400         | Invalid old password                                                                                                                                                                           |
|                       | BAD_USER_INPUT  |             |                                                                                                                                                                                                |

<br />

### Testing Protected Method

`Restricted to User and Admin`

You need to login to access this protected method

```tsx
query ProtectedMethod {
      protectedMethod {
        sub
        email
        role
      }
    }
// Response with JwtPayload {sub: 23, email: user@example.com, role: "USER" }
```

| Exception             | Code            | Status Code | Message      |
| --------------------- | --------------- | ----------- | ------------ |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized |

<br />

### Testing Fresh Token Protected Method

`Restricted to User and Admin. Fresh Access Token is required`

For enhanced security, certain actions require a fresh authentication token. If you've been logged in for more than 10 minutes, you'll need to re-login to proceed with these specific actions.

```tsx
query ProtectedFreshTokenMethod {
      protectedFreshTokenMethod {
        sub
        email
        role
      }
    }
// Response with JwtPayload {sub: 23, email: user@example.com, role: "USER" }
```

| Exception             | Code            | Status Code | Message      |
| --------------------- | --------------- | ----------- | ------------ |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized |

<br />

### Resend Email Verification

This method can be used with `mutation verifyEmail` if verification token is invalid (like link expired)

```tsx
mutation ResendEmailVerification($input: EmailInput!) {
      resendEmailVerification(input: $input)
    }

// Example input
{ "input": {
    "email" : "customer-email@example.com"
  }
}

// response with Boolean true if success
```

| Exception           | Code                  | Status Code | Message                                      |
| ------------------- | --------------------- | ----------- | -------------------------------------------- |
| NotFoundException   | INTERNAL_SERVER_ERROR | 404         | Customer associated with this email does not |
| BadRequestException | BAD_REQUEST           | 400         | Too many attempts                            |
|                     | BAD_USER_INPUT        |             |                                              |

<br />

## 2. Admin Authorization

### Register Admin

```tsx
mutation RegisterAdmin($input: RegisterAdminInput!) {
      registerAdmin(input: $input)
    }

// Example input
{
  "input" : {
      "token": "some-admin-registration-token",
      "newName": "Admin Styx",
      "newPassword": "admin_password12345",
    }
}

// response with Boolean true if success
```

| Exception           | Code                  | Status Code | Message                        |
| ------------------- | --------------------- | ----------- | ------------------------------ |
| BadRequestException | BAD_REQUEST           | 400         | Verification token has expired |
| BadRequestException | BAD_REQUEST           | 400         | Verification token is invalid  |
|                     | BAD_USER_INPUT        |             |                                |
| NotFoundException   | INTERNAL_SERVER_ERROR | 404         | Customer not found             |

<br />

### Resend Admin Registration Email

This method can be used together with `registerAdmin mutation` if token expired/invalid or admin forget password

```tsx
mutation ResendAdminRegistrationEmail {
      resendAdminRegistrationEmail
    }

// response with Boolean true if success
```

| Exception           | Code                  | Status Code | Message                                            |
| ------------------- | --------------------- | ----------- | -------------------------------------------------- |
| BadRequestException | BAD_REQUEST           | 400         | Too many attempts                                  |
| NotFoundException   | INTERNAL_SERVER_ERROR | 404         | Customer associated with this email does not exist |

<br />

### Testing Protected Admin method

`Restricted to Admin only`

```tsx
query ProtectedAdminMethod {
  protectedAdminMethod {
    sub
    email
    role
  }
}

//response with JwtPayload {sub: 1, email: admin@example.com, role: "ADMIN" }

```

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |

<br />

### Suspend User

`Restricted to Admin only`

```tsx
mutation SuspendCustomer($customerId: Int!) {
        suspendCustomer(customerId: $customerId) {
          customerId
          name
          email
          customerStatus
          referralCode
          referralCustomerId
        }
      }

// Example input
{
  "customerId": 123,
}

// response with Customer

```

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
| BadRequestException   | BAD_REQUEST     | 400         | Customer not found |
|                       | BAD_USER_INPUT  |             |                    |

<br />

### Reinstate User

`Restricted to Admin only`

```tsx
mutation ReinstateCustomer($customerId: Int!) {
        reinstateCustomer(customerId: $customerId) {
          customerId
          name
          email
          customerStatus
          referralCode
          referralCustomerId
        }
      }

// Example input
{
  "customerId": 123,
}

// response with Customer

```

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
| BadRequestException   | BAD_REQUEST     | 400         | Customer not found |
|                       | BAD_USER_INPUT  |             |                    |

<br />

### Set Referral Map View Level

`Restricted to Admin only`

```tsx
mutation SetReferralViewLevel($depth: Int!) {
      setReferralViewLevel(depth: $depth) {
        configId
        referralViewLevel
        isReferralCodeEnabled
        createdAt
        updatedAt
      }
    }

// Example input
{ "depth" : 3 }

// response with Config
```

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |

<br />

### Set isReferralCodeEnabled Status

`Restricted to Admin only`

```tsx
mutation SetReferralCodeEnabledStatus($status: Boolean!) {
      setReferralCodeEnabledStatus(status: $status) {
        configId
        referralViewLevel
        isReferralCodeEnabled
        createdAt
        updatedAt
      }
    }

// Example input
{ "status" : true }

// response with Config
```

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |

<br />

### Get Config

`Restricted to Admin only`

```tsx
query GetConfig{
	getConfig{
    configId
    referralViewLevel
    isReferralCodeEnabled
    createdAt
    updatedAt
  }
}

// response with Config
```

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |

<br />

### Get Customers

`Restricted to Admin only`

```tsx
query GetCustomers(
      $cursor: Int
      $limit: Int
      $customerStatus: CustomerStatus
      $emailStatus: EmailStatus
      $customerRole: CustomerRole
      $customerId: Int
    ) {
      getCustomers(
        cursor: $cursor
        limit: $limit
        customerStatus: $customerStatus
        emailStatus: $emailStatus
        customerRole: $customerRole
        customerId: $customerId
      ) {
        data {
          customerId
          name
          email
          emailStatus
          customerStatus
          referralCode
          referralCustomerId
          referrer {
            customerId
            name
            email
            emailStatus
            customerStatus
            referralCode
            referralCustomerId
          }
          referees {
            customerId
            name
            email
            emailStatus
            customerStatus
            referralCode
            referralCustomerId
          }
          charges {
            chargeId
            code
            name
            description
            pricingType
            addresses
            pricing
            exchangeRates
            localExchangeRates
            hostedUrl
            cancelUrl
            redirectUrl
            feeRate
            expiresAt
            paymentThreshold
            createdAt
            updatedAt
          }
          commissions {
            commissionId
            customerId
            chargeId
            tier
            commissionRate
            amount
            currency
            isTransferred
            createdAt
            updatedAt
          }
          wallets {
            walletId
            customerId
            address
            cryptoType
            isDefault
          }
          purchaseActivities{
            purchaseActivityId
            purchaseCode
            customerId
            chargeId
            packageId
            tokenPriceId
            tokenAmount
            price
            amount
            currency
            purchaseConfirmed
            paymentStatus
            createdAt
            updatedAt
          }
          image {
            imageId
            path
            type
            customerId
            packageId
            createdAt
          }
          createdAt
          updatedAt
        }
        nextPageCursor
      }
    }

// Example input
{
  "cursor": 18, // Optional, ID from Cursor, sent null for the first time
  "limit": 10, // Optional, how many data you want per fetch
  "customerStatus": "ACTIVE", // Optional, CustomerStatus
  "emailStatus": "VERIFIED", // Optional, EmailStatus
  "customerRole": "USER", //Optional, CustomerRole
  "customerId": 4 //Optional
}

// response with CustomerResult
{
  "data": {
    "getCustomers": {
      "data": [
        {
          "customerId": 4,
          "name": "Admin",
          "email": "admin@example.com",
          "emailStatus": "VERIFIED",
          "customerStatus": "ACTIVE",
          "referralCode": "57J0OTSR",
          "referralCustomerId": null,
          "referrer": null,
          "referees": [
            {
              "customerId": 5,
              "name": "Dan Stack",
              "email": "danstack@gmail.com",
              "emailStatus": "VERIFIED",
              "customerStatus": "ACTIVE",
              "referralCode": "JKMUJZEU",
              "referralCustomerId": 4
            }
          ],
          "charges": [],
          "commissions": [],
          "wallets": [],
          "image": null,
          "createdAt": "2023-07-26T10:51:45.465Z",
          "updatedAt": "2023-08-17T13:48:46.576Z"
        },
        {
          "customerId": 5,
          "name": "Dan Stack",
          "email": "danstack@gmail.com",
          "emailStatus": "VERIFIED",
          "customerStatus": "ACTIVE",
          "referralCode": "JKMUJZEU",
          "referralCustomerId": 4,
          "referrer": {
            "customerId": 4,
            "name": "Admin",
            "email": "admin@example.com",
            "emailStatus": "VERIFIED",
            "customerStatus": "ACTIVE",
            "referralCode": "57J0OTSR",
            "referralCustomerId": null
          },
          "referees": [],
          "charges": [],
          "commissions": [],
          "wallets": [
            {
              "walletId": 1,
              "customerId": 5,
              "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
              "cryptoType": "ETH",
              "isDefault": true
            }
          ],
          "image": null,
          "createdAt": "2023-07-26T11:19:01.234Z",
          "updatedAt": "2023-08-17T13:11:35.512Z"
        }
      ],
      "nextPageCursor": null
    }
  }
}
```

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |

<br />

## 3. Upload Image

### Generate Presigned URL

`Restricted to User and Admin`

```tsx
mutation GeneratePresignedUrl($uploadInput: UploadInput!) {
      generatePresignedUrl(uploadInput: $uploadInput) {
        presignedUrl
        key
      }
    }

// Example input
{
  "uploadInput" : {
    "type" : "PACKAGE", // This will be folder path in S3 bucket
    "fileExtension" : "jpg" // can be either 'jpg', 'jpeg', 'png', 'gif' or 'webp'
  }
}

// so far we define type as
export enum ImageType {
  CUSTOMER = "CUSTOMER",
  PACKAGE = "PACKAGE",
}


// response with PresignedUrl
{
  // temporary URL for frontend to use upload to S3 bucket
  "presignedUrl: "...",

  // basically a file path in S3 bucket
  "key": "..."
}

```

| Exception                    | Code                  | Status Code | Message                                                                 |
| ---------------------------- | --------------------- | ----------- | ----------------------------------------------------------------------- |
| ForbiddenException           | FORBIDDEN             | 403         | Forbidden Resource                                                      |
| UnauthorizedException        | UNAUTHENTICATED       | 401         | Unauthorized                                                            |
| BadRequestException          | BAD_REQUEST           | 400         | Invalid file extension                                                  |
| InternalServerErrorException | INTERNAL_SERVER_ERROR | 500         | Failed to generate pre-signed URL                                       |
| BadRequestException          | BAD_REQUEST           | 400         | ["type must be a valid ImageType"]                                      |
| BadRequestException          | BAD_REQUEST           | 400         | ["fileExtension must be a string", "fileExtension should not be empty"] |
|                              | BAD_USER_INPUT        |             |                                                                         |

### Save Uploaded Image

`Restricted to Admin only`

After Frontend uploading image to S3 bucket, save the path using the following format `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key-from-generatePresignedUrl-mutation}` . You can find an example in the `upload.spec.ts` file located in the end-to-end test folder.

```tsx
mutation SaveUploadedImage($saveImageInput: SaveImageInput!) {
      saveUploadedImage(saveImageInput: $saveImageInput) {
        imageId
        path
        customerId
        packageId
        createdAt
      }
    }

// Example input
{
  "saveImageInput" : {
    "path" : `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key-from-generatePresignedUrl}`,
    "type" : ImageType.PACKAGE, // or "PACKAGE". Look at the defintion of ImageType,
    "packageId" : 2 // It can be etiher packageId or customerId
  }
}

// response with Image type

```

| Exception             | Code            | Status Code | Message                                               |
| --------------------- | --------------- | ----------- | ----------------------------------------------------- |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource                                    |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized                                          |
| BadRequestException   | BAD_REQUEST     | 400         | ["path must be a string", "path should not be empty"] |
| BadRequestException   | BAD_REQUEST     | 400         | ["type must be a valid ImageType"]                    |
| BadRequestException   | BAD_REQUEST     | 400         | ["customerId must be an integer"]                     |
| BadRequestException   | BAD_REQUEST     | 400         | ["packageId must be an integer"]                      |
|                       | BAD_USER_INPUT  |             |                                                       |

<br />

## 4. Referrer and Referees

### Get Referral Map

`Restricted to User and Admin`

The depth of the referral map view is determined by the `referralViewLevel` setting configured by the admin

```tsx
query GetReferralMap($input: ReferralInput!) {
      getReferralMap(input: $input) {
        level
        referralEntries {
          referrer {
            customerId
            name
            email
            referralCode
            referralCustomerId
            customerStatus
            emailStatus
            createdAt
            updatedAt
          }
          referees {
            customerId
            name
            email
            referralCode
            referralCustomerId
            customerStatus
            emailStatus
            createdAt
            updatedAt
          }
        }
      }
    }

// Example input
{
  "input" : {
    "referrerId" : 12, // customerId, who is the referrer (top level)
    "startLevel" : 0 // the name scheming for level. Put 0 wil make the name "level0"
                    // You can start at any number. The number of level will increase
                    // as we go down the level ("level1", "level2" and so on)
  }
}


// response
[
  {
    "level": "level0",
    "referralEntries": [
      {
        "referrer": {
          "customerId": 3345,
          "name": "John Doe Staniay",
          "email": "john.doe.stania@gmail.com",
          "customerStatus": "ACTIVE",
          "emailStatus": "VERIFIED",
          "referralCode": "HGVRMXU0",
          "referralCustomerId": null
        },
        "referees": [
          {
            "customerId": 3346,
            "name": "Jane Smith Sythy",
            "email": "jane.smith.syth@gmail.com",
            "customerStatus": "ACTIVE",
            "emailStatus": "VERIFIED",
            "referralCode": "LXQXGZQQ",
            "referralCustomerId": 3345
          }
        ]
      }
    ]
  }
]

```

| Exception             | Code                  | Status Code | Message                                                           |
| --------------------- | --------------------- | ----------- | ----------------------------------------------------------------- |
| UnauthorizedException | UNAUTHENTICATED       | 401         | Unauthorized                                                      |
| BadRequestException   | BAD_REQUEST           | 400         | ["referrerId must be a number", "referrerId should not be empty"] |
| BadRequestException   | BAD_REQUEST           | 400         | ["startLevel must be a number"]                                   |
| NotFoundException     | INTERNAL_SERVER_ERROR | 404         | Customer not found                                                |
| BadRequestException   | BAD_REQUEST           | 400         | Start level must be non-negative                                  |
| BadRequestException   | BAD_REQUEST           | 400         | Raw query failed                                                  |
| BadRequestException   | BAD_REQUEST           | 400         | Client request error                                              |
| HttpException         | INTERNAL_SERVER_ERROR | 500         | An unexpected error occurred                                      |
|                       | BAD_USER_INPUT        |             |                                                                   |

<br />

## 5. Token Price and Package

### Set or Edit Token Price

`Restricted to Admin only`

```tsx
// Set or Edit Price per Token
mutation SetOrEditTokenPrice($input: TokenPriceCreateInput!) {
      setOrEditTokenPrice(input: $input) {
        tokenPriceId
        currency
        price
        createdAt
        updatedAt
      }
    }

// Example input
{
  "input" :
    {
      "currency": "EUR", // Only 'EUR', 'USD' and 'GBP' are supporting currencies
      "price": 2  // You can set price as 2 , 2.0 or 2.00 . Set 2.000 will be invalid
    }
}

// response with TokenPrice
{
  "data": {
    "setOrEditTokenPrice": {
      "tokenPriceId": 1,
      "currency": "EUR",
      "price": 2,
      "createdAt": "2023-08-18T05:47:11.524Z",
      "updatedAt": "2023-08-18T05:47:11.524Z"
    }
  }
}
```

| Exception             | Code            | Status Code | Message                                                                                                                 |
| --------------------- | --------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource                                                                                                      |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized                                                                                                            |
| BadRequestException   | BAD_REQUEST     | 400         | ["price must be a number", "price should not be empty", "price must be a valid currency format"]                        |
| BadRequestException   | BAD_REQUEST     | 400         | ["currency must be a string", "currency should not be empty", "currency must be one of the following: USD, GBP or EUR"] |
|                       | BAD_USER_INPUT  |             |                                                                                                                         |

<br />

### Get Token Price

```tsx
query GetTokenPrice {
      getTokenPrice {
        tokenPriceId
        currency
        price
        createdAt
        updatedAt
      }
    }

    // response with TokenPrice | null
```

<br />

### Create Token Package

`Restricted to Admin only`

```tsx
mutation CreateTokenPackage($input: TokenPackageCreateInput!) {
        createTokenPackage(input: $input) {
          packageId
          name
          price
          tokenAmount
          isActive
        }
      }

// Example input
  {
    "input" : {
        "name": "Basic Package",
        "price": 100, // You can set price as 100, 100.0 or 100.00 . Set 100.000 will be invalid
        "tokenAmount": 100,
        "currency": "USD", // Only 'EUR', 'USD' and 'GBP' are supporting currencies
        "isActive": true
      }
  }

  // response with TokenPackage
  {
    "data": {
      "createTokenPackage": {
        "packageId": 1,
        "name": "Basic Package",
        "price": 100,
        "tokenAmount": 100,
        "isActive": true
      }
    }
  }
```

| Exception             | Code            | Status Code | Message                                                                                                                 |
| --------------------- | --------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource                                                                                                      |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized                                                                                                            |
| BadRequestException   | BAD_REQUEST     | 400         | ["name must be a string", "name should not be empty"]                                                                   |
| BadRequestException   | BAD_REQUEST     | 400         | ["description must be a string"]                                                                                        |
| BadRequestException   | BAD_REQUEST     | 400         | ["tokenAmount must be a number", "tokenAmount should not be empty"]                                                     |
| BadRequestException   | BAD_REQUEST     | 400         | ["price must be a number", "price should not be empty", "price must be a valid currency format"]                        |
| BadRequestException   | BAD_REQUEST     | 400         | ["currency must be a string", "currency should not be empty", "currency must be one of the following: USD, GBP or EUR"] |
| BadRequestException   | BAD_REQUEST     | 400         | ["isActive must be a boolean", "isActive should not be empty"]                                                          |
|                       | BAD_USER_INPUT  |             |                                                                                                                         |

<br />

### Edit Token Package

`Restricted to Admin only`

```tsx
mutation EditTokenPackage(
        $packageId: Int!
        $input: TokenPackageUpdateInput!
      ) {
        editTokenPackage(packageId: $packageId, input: $input) {
          packageId
          name
          price
          tokenAmount
        }
      }

// Example input
{
  "packageId": 1,
  "input": {
      "price": 120,
      "tokenAmount": 150
    }
}

// response with TokenPackage
```

| Exception             | Code            | Status Code | Message                                                                                 |
| --------------------- | --------------- | ----------- | --------------------------------------------------------------------------------------- |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource                                                                      |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized                                                                            |
| BadRequestException   | BAD_REQUEST     | 400         | ["name must be a string"]                                                               |
| BadRequestException   | BAD_REQUEST     | 400         | ["description must be a string"]                                                        |
| BadRequestException   | BAD_REQUEST     | 400         | ["tokenAmount must be a number"]                                                        |
| BadRequestException   | BAD_REQUEST     | 400         | ["price must be a number", "price must be a valid currency format"]                     |
| BadRequestException   | BAD_REQUEST     | 400         | ["currency must be a string", "currency must be one of the following: USD, GBP or EUR"] |
| BadRequestException   | BAD_REQUEST     | 400         | ["isActive must be a boolean"]                                                          |
|                       | BAD_USER_INPUT  |             |                                                                                         |

<br />

### Toggle Token Package Status

`Restricted to Admin only`

```tsx
mutation ToggleTokenPackageStatus($packageId: Int!) {
        toggleTokenPackageStatus(packageId: $packageId) {
          packageId
          isActive
        }
      }

// Example input
{
  "packageId": 1
}

// response with TokenPackage
```

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
|                       | BAD_USER_INPUT  |             |                    |

<br />

### Delete Token Package

`Restricted to Admin only`

```tsx
mutation DeleteTokenPackage($packageId: Int!) {
        deleteTokenPackage(packageId: $packageId) {
          packageId
          name
          price
          tokenAmount
          isActive
        }
      }

// Example input
{
  "packageId": 1
}

// response with the deleted TokenPackage
```

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
|                       | BAD_USER_INPUT  |             |                    |

<br />

### Get Token Package

```tsx
query GetTokenPackage($packageId: Int!) {
        getTokenPackage(packageId: $packageId) {
          packageId
          name
          price
          tokenAmount
          isActive
        }
      }

// Example input
{
  "packageId": 1
}

// response with TokenPackage | null
```

| Exception | Code           | Status Code | Message |
| --------- | -------------- | ----------- | ------- |
|           | BAD_USER_INPUT |             |         |

<br />

### Get All Token Packages

```tsx
query GetAllTokenPackages{
        getAllTokenPackages{
          packageId
          name
          price
          tokenAmount
          isActive
        }
      }

// response with TokenPackage[]
```

| Exception | Code           | Status Code | Message |
| --------- | -------------- | ----------- | ------- |
|           | BAD_USER_INPUT |             |         |

<br />

### Get All Token Packages By Status

```tsx
query GetAllTokenPackagesByStatus($isActive: Boolean!){
        getAllTokenPackagesByStatus(isActive : $isActive){
          packageId
          name
          price
          tokenAmount
          isActive
        }
      }

// Example input
{
  "isActive": true
}

// response with TokenPackage[]
```

| Exception | Code           | Status Code | Message |
| --------- | -------------- | ----------- | ------- |
|           | BAD_USER_INPUT |             |         |

<br />

## 6. Token Purchase

### Purchase Tokens

`Restricted to User and Admin`

```tsx
mutation PurchaseTokens($input: PurchaseTokensInput!) {
      purchaseTokens(input: $input)
    }

// Example input
// <FRONTEND_URL> can't be localhost.
// Some alternatives:
// register `ngrok` and install `ngrok` package
// Try using `ngrok http <FRONTEND_PORT>` to get real URL
{
	"input" : {
      "redirect_url": "https://<FRONTEND_URL>/payment-success",
      "cancel_url": "https://<FRONTEND_URL>/payment-cancelled",
      "quantity": 20
    }
}

// response with string (Charge code from Coinbase)
// e.g:
// {
//  "data": {
//    "purchaseTokens": "VK4VB4WD"
//  }
//}
```

<br />

## 7. Purchase Activities

### Get Purchase Activities

`Restricted to Admin only`

```tsx
// inside data {...} fields,
// all fields are optional but you need to specify at least one!
// For example, you can specify data query as simple as this
// data {
//       purchaseActivityId
//       chargeId
//       packageId
//       tokenPriceId
//       tokenAmount
//       price
//       amount
//       currency
// }

query GetPurchaseActivities($cursor: Int, $limit: Int, $purchaseConfirmed: Boolean, $paymentStatus: PaymentStatus, $customerId: Int) {
  getPurchaseActivities(cursor: $cursor, limit: $limit, purchaseConfirmed: $purchaseConfirmed, paymentStatus: $paymentStatus, customerId: $customerId) {
    data {
      purchaseActivityId
      purchaseCode
      customerId
      chargeId
      packageId
      tokenPriceId
      tokenAmount
      price
      amount
      currency
      purchaseConfirmed
      paymentStatus
      createdAt
      updatedAt
      charge {
        chargeId
        customerId
        code
        name
        description
        pricingType
        pricing
        addresses
        exchangeRates
        localExchangeRates
        hostedUrl
        cancelUrl
        redirectUrl
        feeRate
        expiresAt
        paymentThreshold
        createdAt
        updatedAt
        payments {
          paymentId
          chargeId
          network
          transaction
          value
          type
          status
          paymentStatus
          unresolvedReason
          createdAt
          updatedAt
        }
        commissions {
          commissionId
          customerId
          chargeId
          tier
          commissionRate
          amount
          currency
          isTransferred
          createdAt
          updatedAt
        }
      }
      package {
        packageId
        name
        description
        tokenAmount
        price
        currency
        isActive
        createdAt
        updatedAt
        deletedAt
      }
      tokenPrice {
        tokenPriceId
        currency
        price
        createdAt
        updatedAt
      }
    }
    nextPageCursor
  }
}

// Example input
{
  "cursor": 18, // Optional, ID from Cursor, sent null for the first time
  "limit": 10, // Optional, how many data you want per fetch
  "purchaseConfirmed": true, // Optional
  "paymentStatus": "COMPLETED", //Optional,  PaymentStatus
  "customerId": 8 // Optional
}

// Response with PurchaseActivityResult
// example:
{
  "data": {
    "getPurchaseActivities": {
      "data": [],
      "nextPageCursor": null // if there is cursor ID, store it for the next fetch
    }
  }
}

// another example:
{
  "data": {
    "getPurchaseActivities": {
      "data": [
        {
          "purchaseActivityId": 3,
          "chargeId": 3,
          "packageId": null,
          "tokenPriceId": 1,
          "tokenAmount": 20,
          "price": 125,
          "amount": 2500,
          "currency": "EUR",
          "purchaseConfirmed": false,
          "paymentStatus": "NEW",
          "createdAt": "2023-08-23T13:17:43.169Z",
          "updatedAt": "2023-08-23T13:17:43.169Z",
          "charge": {
            "chargeId": 3,
            "customerId": 5,
            "code": "WH3WHAJQ",
            "name": "Sham Stack",
            "description": "Purchase of 20 tokens at 25.00 EUR",
            "pricingType": "fixed_price",
            "pricing": {
              "dai": {
                "amount": "27.047099993858618793",
                "currency": "DAI"
              },
              "usdc": {
                "amount": "27.043043",
                "currency": "USDC"
              },
              "local": {
                "amount": "25.00",
                "currency": "EUR"
              },
              "pusdc": {
                "amount": "27.043043",
                "currency": "PUSDC"
              },
              "pweth": {
                "amount": "0.016531644651728041",
                "currency": "PWETH"
              },
              "tether": {
                "amount": "27.059685",
                "currency": "USDT"
              },
              "apecoin": {
                "amount": "18.303243945082598985",
                "currency": "APE"
              },
              "bitcoin": {
                "amount": "0.00104774",
                "currency": "BTC"
              },
              "polygon": {
                "amount": "49.597511000",
                "currency": "PMATIC"
              },
              "dogecoin": {
                "amount": "430.24489585",
                "currency": "DOGE"
              },
              "ethereum": {
                "amount": "0.016533000",
                "currency": "ETH"
              },
              "litecoin": {
                "amount": "0.42202002",
                "currency": "LTC"
              },
              "shibainu": {
                "amount": "3324283.088980889981561156",
                "currency": "SHIB"
              },
              "bitcoincash": {
                "amount": "0.14459201",
                "currency": "BCH"
              }
            },
            "addresses": {
              "dai": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
              "usdc": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
              "pusdc": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
              "pweth": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
              "tether": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
              "apecoin": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
              "bitcoin": "34URso9pwmaWXXXsGjwiUdy3g9j23qg5TW",
              "polygon": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
              "dogecoin": "DB5kPE4VY6TFaopwphBaHpWkqDAxsbDhic",
              "ethereum": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
              "litecoin": "MUndhhRBZffhd7nXhnQ7mTMgKd2LBeyEHE",
              "shibainu": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
              "bitcoincash": "qzqyjeskkq2wxy3t8k0rctmgpsc59wdv4g6epkd8u5"
            },
            "exchangeRates": {
              "APE-USD": "1.4775",
              "BCH-USD": "187.03",
              "BTC-USD": "25810.785",
              "DAI-USD": "0.99985",
              "ETH-USD": "1635.665",
              "LTC-USD": "64.08",
              "DOGE-USD": "0.062855",
              "SHIB-USD": "0.000008135",
              "USDC-USD": "1.0",
              "USDT-USD": "0.999385",
              "PUSDC-USD": "1.0",
              "PWETH-USD": "1635.835",
              "PMATIC-USD": "0.54525"
            },
            "localExchangeRates": {
              "APE-EUR": "1.37",
              "BCH-EUR": "172.90",
              "BTC-EUR": "23860.84",
              "DAI-EUR": "0.92",
              "ETH-EUR": "1512.09",
              "LTC-EUR": "59.24",
              "DOGE-EUR": "0.06",
              "SHIB-EUR": "0.00",
              "USDC-EUR": "0.92",
              "USDT-EUR": "0.92",
              "PUSDC-EUR": "0.92",
              "PWETH-EUR": "1512.25",
              "PMATIC-EUR": "0.50"
            },
            "hostedUrl": "https://commerce.coinbase.com/charges/WH3WHAJQ",
            "cancelUrl": "https://3f13-2001-f40-943-178f-79f5-4b8b-b90d-827d.ngrok-free.app/payment-cancelled",
            "redirectUrl": "https://3f13-2001-f40-943-178f-79f5-4b8b-b90d-827d.ngrok-free.app/payment-success",
            "feeRate": 0.01,
            "expiresAt": "2023-08-23T14:17:42.000Z",
            "paymentThreshold": {
              "overpayment_absolute_threshold": {
                "amount": "5.00",
                "currency": "USD"
              },
              "overpayment_relative_threshold": "0.045",
              "underpayment_absolute_threshold": {
                "amount": "5.00",
                "currency": "USD"
              },
              "underpayment_relative_threshold": "0.005"
            },
            "createdAt": "2023-08-23T13:17:43.096Z",
            "updatedAt": "2023-08-23T13:17:43.096Z",
            "payments": [],
            "commissions": []
          },
          "package": null,
          "tokenPrice": {
            "tokenPriceId": 1,
            "currency": "EUR",
            "price": 1.25,
            "createdAt": "2023-08-18T05:47:11.524Z",
            "updatedAt": "2023-08-18T05:47:11.524Z"
          }
        }
      ],
      "nextPageCursor": null
    }
  }
}

// PaymentStatus is defined as
export enum PaymentStatus {
  NEW = 'NEW',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  UNRESOLVED = 'UNRESOLVED',
  RESOLVED = 'RESOLVED',
  EXPIRED = 'EXPIRED',
  CANCELED = 'CANCELED',
  MANUALLY_ACCEPTED = 'MANUALLY_ACCEPTED',
  MANUALLY_UNACCEPTED = 'MANUALLY_UNACCEPTED',
}

```

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
|                       | BAD_USER_INPUT  |             |                    |

<br />

### Get Purchase Activities for Customer

`Restricted to User and Admin`

```tsx
// customer's own purchase activities. (the login one)

query GetPurchaseActivitiesForCustomer($cursor: Int, $limit: Int, $purchaseConfirmed: Boolean, $paymentStatus: PaymentStatus) {
  getPurchaseActivitiesForCustomer(cursor: $cursor, limit: $limit, purchaseConfirmed: $purchaseConfirmed, paymentStatus: $paymentStatus) {
    data {
      ... // Same fields as getPurchaseActivities
    }
    nextPageCursor
  }
}

// Example input
{
  "cursor": 18, // Optional, ID from Cursor, sent null for the first time
  "limit": 10, // Optional, how many data you want per fetch
  "purchaseConfirmed": true, // Optional, wether full payment has been made or not
  "paymentStatus": "COMPLETED", //Optional,  PaymentStatus
}

// Response with PurchaseActivityResult
{
  "data": {
    "getPurchaseActivitiesForCustomer": {
      "data": [],
      "nextPageCursor": null // if there is cursor ID, store it for the next fetch
    }
  }
}

```

| Exception             | Code            | Status Code | Message      |
| --------------------- | --------------- | ----------- | ------------ |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized |
|                       | BAD_USER_INPUT  |             |              |

<br />

### Get Charges

`Restricted to Admin only`

```tsx
query GetCharges($cursor: Int, $limit: Int, $customerId: Int, $code: String) {
  getCharges(cursor: $cursor, limit: $limit, customerId: $customerId, code: $code) {
    data {
      chargeId
      code
      name
      description
      pricingType
      addresses
      pricing
      exchangeRates
      localExchangeRates
      hostedUrl
      cancelUrl
      redirectUrl
      feeRate
      expiresAt
      paymentThreshold
      createdAt
      updatedAt
      customer {
        customerId
        name
        email
        customerStatus
      }
      payments {
        paymentId
        chargeId
        network
        transaction
        value
        type
        status
        paymentStatus
        unresolvedReason
        createdAt
        updatedAt
      }
      commissions {
        commissionId
        customerId
        chargeId
        tier
        commissionRate
        amount
        currency
        isTransferred
        createdAt
        updatedAt
      }
      purchaseActivity {
        purchaseActivityId
      	chargeId
      	packageId
      	tokenPriceId
      	tokenAmount
      	price
      	amount
      	currency
      	purchaseConfirmed
      	paymentStatus
      	createdAt
      	updatedAt
      }
    }
    nextPageCursor
  }
}

// Example input
{
  "cursor": 18, // Optional, ID from Cursor, sent null for the first time
  "limit": 10, // Optional, how many data you want per fetch
  "customerId": 8, // Optional
  "code": "ABC123" // Optional, Charge code from Coinbase, specifying this will return only 1 result since the `code` is unique
}

// response with ChargeResult
// example:
{
  "data": {
    "getCharges": {
      "data": [
        {
          "chargeId": 3,
          "code": "WH3WHAJQ",
          "name": "Sham Stack",
          "description": "Purchase of 20 tokens at 25.00 EUR",
          "pricingType": "fixed_price",
          "addresses": {
            "dai": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
            "usdc": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
            "pusdc": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
            "pweth": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
            "tether": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
            "apecoin": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
            "bitcoin": "34URso9pwmaWXXXsGjwiUdy3g9j23qg5TW",
            "polygon": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
            "dogecoin": "DB5kPE4VY6TFaopwphBaHpWkqDAxsbDhic",
            "ethereum": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
            "litecoin": "MUndhhRBZffhd7nXhnQ7mTMgKd2LBeyEHE",
            "shibainu": "0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f",
            "bitcoincash": "qzqyjeskkq2wxy3t8k0rctmgpsc59wdv4g6epkd8u5"
          },
          "pricing": {
            "dai": {
              "amount": "27.047099993858618793",
              "currency": "DAI"
            },
            "usdc": {
              "amount": "27.043043",
              "currency": "USDC"
            },
            "local": {
              "amount": "25.00",
              "currency": "EUR"
            },
            "pusdc": {
              "amount": "27.043043",
              "currency": "PUSDC"
            },
            "pweth": {
              "amount": "0.016531644651728041",
              "currency": "PWETH"
            },
            "tether": {
              "amount": "27.059685",
              "currency": "USDT"
            },
            "apecoin": {
              "amount": "18.303243945082598985",
              "currency": "APE"
            },
            "bitcoin": {
              "amount": "0.00104774",
              "currency": "BTC"
            },
            "polygon": {
              "amount": "49.597511000",
              "currency": "PMATIC"
            },
            "dogecoin": {
              "amount": "430.24489585",
              "currency": "DOGE"
            },
            "ethereum": {
              "amount": "0.016533000",
              "currency": "ETH"
            },
            "litecoin": {
              "amount": "0.42202002",
              "currency": "LTC"
            },
            "shibainu": {
              "amount": "3324283.088980889981561156",
              "currency": "SHIB"
            },
            "bitcoincash": {
              "amount": "0.14459201",
              "currency": "BCH"
            }
          },
          "exchangeRates": {
            "APE-USD": "1.4775",
            "BCH-USD": "187.03",
            "BTC-USD": "25810.785",
            "DAI-USD": "0.99985",
            "ETH-USD": "1635.665",
            "LTC-USD": "64.08",
            "DOGE-USD": "0.062855",
            "SHIB-USD": "0.000008135",
            "USDC-USD": "1.0",
            "USDT-USD": "0.999385",
            "PUSDC-USD": "1.0",
            "PWETH-USD": "1635.835",
            "PMATIC-USD": "0.54525"
          },
          "localExchangeRates": {
            "APE-EUR": "1.37",
            "BCH-EUR": "172.90",
            "BTC-EUR": "23860.84",
            "DAI-EUR": "0.92",
            "ETH-EUR": "1512.09",
            "LTC-EUR": "59.24",
            "DOGE-EUR": "0.06",
            "SHIB-EUR": "0.00",
            "USDC-EUR": "0.92",
            "USDT-EUR": "0.92",
            "PUSDC-EUR": "0.92",
            "PWETH-EUR": "1512.25",
            "PMATIC-EUR": "0.50"
          },
          "hostedUrl": "https://commerce.coinbase.com/charges/WH3WHAJQ",
          "cancelUrl": "https://3f13-2001-f40-943-178f-79f5-4b8b-b90d-827d.ngrok-free.app/payment-cancelled",
          "redirectUrl": "https://3f13-2001-f40-943-178f-79f5-4b8b-b90d-827d.ngrok-free.app/payment-success",
          "feeRate": 0.01,
          "expiresAt": "2023-08-23T14:17:42.000Z",
          "paymentThreshold": {
            "overpayment_absolute_threshold": {
              "amount": "5.00",
              "currency": "USD"
            },
            "overpayment_relative_threshold": "0.045",
            "underpayment_absolute_threshold": {
              "amount": "5.00",
              "currency": "USD"
            },
            "underpayment_relative_threshold": "0.005"
          },
          "createdAt": "2023-08-23T13:17:43.096Z",
          "updatedAt": "2023-08-23T13:17:43.096Z",
          "customer": {
            "customerId": 5,
            "name": "Sham Stack",
            "email": "realtimestack@gmail.com",
            "customerStatus": "ACTIVE"
          },
          "payments": [],
          "commissions": [],
          "purchaseActivity": {
            "purchaseActivityId": 3,
            "chargeId": 3,
            "packageId": null,
            "tokenPriceId": 1,
            "tokenAmount": 20,
            "price": 125,
            "amount": 2500,
            "currency": "EUR",
            "purchaseConfirmed": false,
            "paymentStatus": "NEW",
            "createdAt": "2023-08-23T13:17:43.169Z",
            "updatedAt": "2023-08-23T13:17:43.169Z"
          }
        }
      ],
      "nextPageCursor": null
    }
  }
}
```

<br />

## 8. Commissions

### Create Commission Tier

`Restricted to Admin only`

```tsx
mutation CreateCommissionTier($input: CreateCommissionTierInput!) {
      createCommissionTier(input: $input) {
        commissionTierId
        tier
        commissionRate
        createdAt
        updatedAt
      }
    }

// Example input
{
	"input" : {
      "tier": 1,
      "commissionRate": 0.1 //the number should be within 0 to 0.9999, to 1 (0% to 99.99%, to 100%)
    }
}

// response with CommissionTier
```

| Exception             | Code                  | Status Code | Message                        |
| --------------------- | --------------------- | ----------- | ------------------------------ |
| UnauthorizedException | UNAUTHENTICATED       | 401         | Unauthorized                   |
| ForbiddenException    | FORBIDDEN             | 403         | Forbidden Resource             |
| ConflictException     | INTERNAL_SERVER_ERROR | 409         | Commission Tier already exists |
|                       | BAD_USER_INPUT        |             |                                |

<br />

### Update Commissions Tier

`Restricted to Admin only`

```tsx
mutation UpdateCommissionTier($input: UpdateCommissionTierInput!) {
      updateCommissionTier(input: $input) {
        commissionTierId
        tier
        commissionRate
        createdAt
        updatedAt
      }
    }

// Example input
{
	"input" : {
      "tier": 1,
      "commissionRate": 0.105
    }
}

// response with CommissionTier
```

| Exception             | Code                  | Status Code | Message                   |
| --------------------- | --------------------- | ----------- | ------------------------- |
| UnauthorizedException | UNAUTHENTICATED       | 401         | Unauthorized              |
| ForbiddenException    | FORBIDDEN             | 403         | Forbidden Resource        |
| NotFoundException     | INTERNAL_SERVER_ERROR | 404         | Commission Tier not found |
|                       | BAD_USER_INPUT        |             |                           |

<br />

### Delete Commissions Tier

`Restricted to Admin only`

```tsx
mutation DeleteCommissionTier($tier: Int!) {
      deleteCommissionTier(tier: $tier) {
        commissionTierId
        tier
        commissionRate
        createdAt
        updatedAt
      }
    }

// Example input
{
	"tier": 1
}

// response with CommissionTier
```

| Exception             | Code                  | Status Code | Message                   |
| --------------------- | --------------------- | ----------- | ------------------------- |
| UnauthorizedException | UNAUTHENTICATED       | 401         | Unauthorized              |
| ForbiddenException    | FORBIDDEN             | 403         | Forbidden Resource        |
| NotFoundException     | INTERNAL_SERVER_ERROR | 404         | Commission Tier not found |
|                       | BAD_USER_INPUT        |             |                           |

<br />

### Get All Commissions Rates

`Restricted to User and Admin`

```tsx
query GetAllCommissionRates {
      getAllCommissionRates {
        tier
        commissionRate
      }
    }

// response with  CommissionRate[]
```

| Exception             | Code            | Status Code | Message      |
| --------------------- | --------------- | ----------- | ------------ |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized |

<br />

### Get Commissions

`Restricted to Admin only`

```tsx
// inside data {...} fields,
// all fields are optional but you need to specify at least one!

query GetCommissions($cursor: Int, $limit: Int, $customerId: Int, $isTransferred: Boolean) {
  getCommissions(cursor: $cursor, limit: $limit, customerId: $customerId, isTransferred: $isTransferred) {
    data {
      commissionId
      customerId
      chargeId
      tier
      commissionRate
      amount
      currency
      isTransferred
      createdAt
      updatedAt
      customer {
        customerId
        name
        email
        customerStatus
        createdAt9
        updatedAt
      }
      charge {
        chargeId
        customerId
        code
        name
        description
        pricingType
        pricing
        addresses
        exchangeRates
        localExchangeRates
        hostedUrl
        cancelUrl
        redirectUrl
        feeRate
        expiresAt
        paymentThreshold
        createdAt
        updatedAt
      }
    }
    nextPageCursor
  }
}

// Example input
  {
    "cursor": 1, // Optional, ID from Cursor, sent null for the first time
    "limit": 10, // Optional, how many data you want per fetch
    "customerId": 12, // Optional
    "isTransferred": false // Optional, wether the commission has been transferred to user's wallet or not
  }

// response with CommissionResult
{
  "data": {
    "getCommissions": {
      "data": [],
      "nextPageCursor": null
    }
  }
}
```

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
|                       | BAD_USER_INPUT  |             |                    |

<br />

### Get Commissions for Customer

`Restricted to User and Admin`

```tsx
// customer's own commissions (the login one)

query GetCommissionsForCustomer($cursor: Int, $limit: Int, $isTransferred: Boolean) {
  getCommissionsForCustomer(cursor: $cursor, limit: $limit, isTransferred: $isTransferred) {
    data {
      ... // Same fields as getCommissionsWithDetails
    }
    nextPageCursor
  }
}

// Example input
  {
    "cursor": 1, // Optional, ID from Cursor, sent null for the first time
    "limit": 10, // Optional, how many data you want per fetch
    "isTransferred": false // Optional, wether the commission has been transferred to user's wallet or not
  }

  // Response with CommissionResult
  {
    "data": {
      "getCommissionsForCustomer": {
        "data": [],
        "nextPageCursor": null
      }
    }
  }
```

| Exception             | Code            | Status Code | Message      |
| --------------------- | --------------- | ----------- | ------------ |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized |
|                       | BAD_USER_INPUT  |             |              |

<br />

### Update Commissions Transfer Status

`Restricted to Admin only`

```tsx
mutation UpdateCommissionTransferStatus($commissionId: Int!) {
  updateCommissionTransferStatus(commissionId: $commissionId) {
    commissionId
    customerId
    chargeId
    tier
    commissionRate
    amount
    currency
    isTransferred
    createdAt
    updatedAt
  }
}

// Example input
{
  "commissionId": 6789
}

// Response with CommissionBase
{
  "data": {
    "updateCommissionTransferStatus": {
      "commissionId" : 2,
      "customerId": 3,
      "chargeId": 5,
      "tier" : 2,
      "commissionRate": 0.02,
      "amount": 18.35,
      "currency": "EUR",
      "isTransferred": true
    }
  }
}

```

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
|                       | BAD_USER_INPUT  |             |                    |

<br />

### Check is Commission Transferred

`Restricted to Admin only`

```tsx
query IsCommissionTransferred($commissionId: Int!) {
  isCommissionTransferred(commissionId: $commissionId)
}

// Example input
{
  "commissionId": 6789
}

// response with Boolean


```

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
|                       | BAD_USER_INPUT  |             |                    |

<br />

## 9. Wallet

### Create Wallet

`Restricted to User and Admin`

```tsx
mutation CreateWallet($input: CreateWalletInput!) {
      createWallet(input: $input) {
        walletId
        customerId
        address
        cryptoType
        isDefault
      }
    }

// Example input
{
  "input" : {
    "customerId": 123,
    "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "cryptoType": "ETH", // CryptoType
  },
}

// response with Wallet
```

| Exception             | Code            | Status Code | Message                                                       |
| --------------------- | --------------- | ----------- | ------------------------------------------------------------- |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized                                                  |
| BadRequestException   | BAD_REQUEST     | 400         | [ "customerId should not be empty" ]                          |
| BadRequestException   | BAD_REQUEST     | 400         | [ "address should not be empty", "address must be a string" ] |
| BadRequestException   | BAD_REQUEST     | 400         | [ "type must be a valid CryptoType" ]                         |
| BadRequestException   | BAD_REQUEST     | 400         | Operation not allowed                                         |
| BadRequestException   | BAD_REQUEST     | 400         | You must have at least one ETH wallet                         |
| BadRequestException   | BAD_REQUEST     | 400         | Invalid ETH address                                           |
|                       | BAD_USER_INPUT  |             |                                                               |

<br />

### Update Wallet

`Restricted to User and Admin`

```tsx
mutation UpdateWallet($input: UpdateWalletInput!) {
      updateWallet(input: $input) {
        walletId
        customerId
        address
        cryptoType
        isDefault
      }
    }

// Example input
{
  "input" : {
    "customerId": 123,
    "walletId" : 3,
    "address": "0x5aeda56215b167893e80b4fe645ba6d5bab767de",
    "cryptoType": "ETH", // CryptoType
  },
}

// response with Wallet

```

| Exception             | Code                  | Status Code | Message                               |
| --------------------- | --------------------- | ----------- | ------------------------------------- |
| UnauthorizedException | UNAUTHENTICATED       | 401         | Unauthorized                          |
| BadRequestException   | BAD_REQUEST           | 400         | [ "customerId should not be empty" ]  |
| BadRequestException   | BAD_REQUEST           | 400         | [ "walletId should not be empty" ]    |
| BadRequestException   | BAD_REQUEST           | 400         | [ "address must be a string" ]        |
| BadRequestException   | BAD_REQUEST           | 400         | [ "type must be a valid CryptoType" ] |
| BadRequestException   | BAD_REQUEST           | 400         | Operation not allowed                 |
| NotFoundException     | INTERNAL_SERVER_ERROR | 404         | Wallet not found                      |
| BadRequestException   | BAD_REQUEST           | 400         | You must have at least one ETH wallet |
| BadRequestException   | BAD_REQUEST           | 400         | Invalid ETH address                   |
|                       | BAD_USER_INPUT        |             |                                       |

<br />

### Set Default Wallet

`Restricted to User and Admin`

```tsx
mutation SetDefaultWallet($input: SetDefaultWalletInput!) {
      setDefaultWallet(input: $input) {
        walletId
        customerId
        address
        cryptoType
        isDefault
      }
    }

// Example input
{
  "input" : {
    "customerId": 123,
    "walletId" : 4
  },
}

// response with Wallet
```

| Exception             | Code                  | Status Code | Message                              |
| --------------------- | --------------------- | ----------- | ------------------------------------ |
| UnauthorizedException | UNAUTHENTICATED       | 401         | Unauthorized                         |
| BadRequestException   | BAD_REQUEST           | 400         | [ "customerId should not be empty" ] |
| BadRequestException   | BAD_REQUEST           | 400         | [ "walletId should not be empty" ]   |
| BadRequestException   | BAD_REQUEST           | 400         | Operation not allowed                |
| NotFoundException     | INTERNAL_SERVER_ERROR | 404         | Wallet not found                     |
|                       | BAD_USER_INPUT        |             |                                      |

<br />

### Delete Wallet

`Restricted to User and Admin`

```tsx
mutation DeleteWallet($input: UpdateWalletInput!) {
      deleteWallet(input: $input) {
        walletId
        customerId
        address
        cryptoType
        isDefault
      }
    }

// Example input
{
  "input" : {
    "customerId": 123,
    "walletId" : 3
  },
}

// response with Wallet

```

| Exception             | Code                  | Status Code | Message                               |
| --------------------- | --------------------- | ----------- | ------------------------------------- |
| UnauthorizedException | UNAUTHENTICATED       | 401         | Unauthorized                          |
| BadRequestException   | BAD_REQUEST           | 400         | [ "customerId should not be empty" ]  |
| BadRequestException   | BAD_REQUEST           | 400         | [ "walletId should not be empty" ]    |
| BadRequestException   | BAD_REQUEST           | 400         | Operation not allowed                 |
| NotFoundException     | INTERNAL_SERVER_ERROR | 404         | Wallet not found                      |
| BadRequestException   | BAD_REQUEST           | 400         | You must have at least one ETH wallet |
|                       | BAD_USER_INPUT        |             |                                       |
