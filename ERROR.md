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
  VAL: {
    IS_STRING: '$property must be a string',
    IS_EMAIL: '$property must be an email',
    IS_NOT_EMPTY: '$property should not be empty',
    MIN_LENGTH: '$property must be longer than or equal to $constraint1 characters',
    MAX_LENGTH: '$property must be shorter than or equal to $constraint1 characters',
  },

  EMAIL_ERROR: {
    TOKEN_EXPIRED: 'Verification token has expired',
    TOKEN_INVALID: 'Verification token is invalid',
    CUSTOMER_NOT_FOUND: 'Customer associated with the token was not found',
    FAILED_TO_SEND_VERIFICATION: 'Failed to send email verification',
    FAILED_TO_SEND_PASSWORD_RESET: 'Failed to send email password reset',
    FAILED_TO_SEND_ADMIN_REGISTRATION: 'Failed to send email admin registration',
  },
};
```

```tsx
export const INPUT = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 100,
};
```

The `VAL` error message is a bit special. For example if we use `VAL.MAX_LENGTH` and apply on field `password` with constraint `MAX_PASSWORD_LENGTH = 100`, we will get the final string as `'password must be shorter than or equal to 100 characters'`. `$property` is replaced by `password`, and `$constraint1` is replaced by `100`

### List of success messages

```tsx
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REFRESH_TOKEN_SUCCESS: 'Refresh token successful',
  EMAIL_VERIFICATION_SENT: 'Email verification sent',
  EMAIL_PASSWORD_RESET_SENT: 'Email password reset sent',
  EMAIL_ADMIN_REGISTRATION_SENT: 'Email admin registration sent',
  CUSTOMER_IS_VERIFIED: 'Customer is successfully verified',
};
```

<br />

## 1. Normal User Authentication

### Register

```tsx
mutation Register($input: RegisterInput!) {
  register(input: $input){
    customerId
    customerStatus
    email
    emailStatus
    referralCustomerId
  }
}

// example of RegisterInput
{
  "input": {
    "email": "johndoe@gmail.com",
    "name": "John Doe",
    "password": "secured-password"
  }
}

// Response with Customer JSON
```

| Exception           | Code                  | Status Code | Message                                                                                                                                                                                                                                                                                                           |
| ------------------- | --------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BadRequestException | BAD_REQUEST           | 400         | [ "name must be longer than or equal to 2 characters", "name must be shorter than or equal to 50 characters" "name should not be empty", "name must be a string", "email must be an email", "password must be longer than or equal to 8 characters", "password must be shorter than or equal to 100 characters" ] |
|                     | BAD_USER_INPUT        |             |                                                                                                                                                                                                                                                                                                                   |
| BadRequestException | BAD_REQUEST           | 400         | Invalid referral code                                                                                                                                                                                                                                                                                             |
| ConflictException   | INTERNAL_SERVER_ERROR | 409         | Email already exists                                                                                                                                                                                                                                                                                              |

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

// example input
{"input": {
      "email": "john.doer@gmail.com",
      "password": "password12345",
    }
}

// Response wtih String 'Login successful'
```

| Exception           | Code                  | Status Code | Message                                                                                                                                           |
| ------------------- | --------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| NotFoundException   | INTERNAL_SERVER_ERROR | 404         | Customer associated with this email does not exist                                                                                                |
| BadRequestException | BAD_REQUEST           | 400         | Incorrect password                                                                                                                                |
| BadRequestException | BAD_REQUEST           | 400         | Customer not verified                                                                                                                             |
| BadRequestException | BAD_REQUEST           | 400         | Customer is suspended                                                                                                                             |
|                     | BAD_USER_INPUT        |             |                                                                                                                                                   |
| BadRequestException | BAD_REQUEST           | 400         | [ "email must be an email", "password must be longer than or equal to 8 characters", "password must be shorter than or equal to 100 characters" ] |

<br />

### Logout

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
| UnauthorizedException | UNAUTHENTICATED | 401         | Invalid refresh token |

<br />

### Forget Password

```tsx
mutation ForgetPassword($input: EmailInput!) {
      forgetPassword(input: $input)
    }

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

{ "input": {
    "token" : "some-long-token-string",
    "newPassword" : "newpassword12345"
  }
}

// Response with Boolean true
```

| Exception           | Code                  | Status Code | Message                                                                                                                                                                        |
| ------------------- | --------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NotFoundException   | INTERNAL_SERVER_ERROR | 404         | Customer associated with this email does not exist                                                                                                                             |
| BadRequestException | BAD_REQUEST           | 400         | [ "token must be a string", "token should not be empty", "password must be longer than or equal to 8 characters", "password must be shorter than or equal to 100 characters" ] |
| BadRequestException | BAD_REQUEST           | 400         | Customer not found                                                                                                                                                             |
|                     | BAD_USER_INPUT        |             |                                                                                                                                                                                |

### Testing Protected Method

You need to login to access this protected method

```tsx
query ProtectedMethod {
      protectedMethod
    }
// Response with Boolean true
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

```tsx
query ProtectedAdminMethod {
  protectedAdminMethod
}

//response with Boolean true if success

```

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
