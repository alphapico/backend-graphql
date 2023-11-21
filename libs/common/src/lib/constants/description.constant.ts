export const DESCRIPTION = {
  REGISTER: `
If the Admin sets the \`isReferralCodeEnabled\` flag in the \`Config\` table, the error message "Referral code is required" will appear if the Customer does not provide the \`referralCode\` during registration. \`referralCode\` is optional if Admin unsets the \`isReferralCodeEnabled\` flag.

| Exception           | Code                  | Status Code | Message                                                                                                   |
| ------------------- | --------------------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| BadRequestException | BAD_REQUEST           | 400         | ["name must be longer than or equal to 2 characters", "name must be a string"]                             |
| BadRequestException | BAD_REQUEST           | 400         | ["email must be an email"]                                                                                |
| BadRequestException | BAD_REQUEST           | 400         | ["password must be longer than or equal to 8 characters", "password must be shorter than or equal to 100 characters"] |
|                     | BAD_USER_INPUT        |             |                                                                                                           |
| BadRequestException | BAD_REQUEST           | 400         | Referral code is required                                                                                 |
| BadRequestException | BAD_REQUEST           | 400         | Invalid referral code                                                                                     |
| ConflictException   | INTERNAL_SERVER_ERROR | 409         | Email already exists                                                                                      |
`,
  VERIFY_EMAIL: `
\`All response messages\`

| Success | Message                           |
| ------- | --------------------------------- |
| true    | Customer is successfully verified |
| false   | Customer is suspended             |
| false   | Verification token is invalid     |
`,
  LOGIN: `
| Exception           | Code                  | Status Code | Message                                                                                                                 |
| ------------------- | --------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| NotFoundException   | INTERNAL_SERVER_ERROR | 404         | Customer associated with this email does not exist                                                                      |
| BadRequestException | BAD_REQUEST           | 400         | Incorrect password                                                                                                      |
| BadRequestException | BAD_REQUEST           | 400         | Customer not verified                                                                                                   |
| BadRequestException | BAD_REQUEST           | 400         | Customer is suspended                                                                                                   |
|                     | BAD_USER_INPUT        |             |                                                                                                                         |
| BadRequestException | BAD_REQUEST           | 400         | [ "email must be an email" ]                                                                                            |
| BadRequestException | BAD_REQUEST           | 400         | [ "password must be longer than or equal to 8 characters", "password must be shorter than or equal to 100 characters" ] |

---

 \`\`\`json
 // Response with String!
 {"data": {"login": "Login successful"}}
 \`\`\`
`,
  LOGOUT: `
#### \`Restricted to User and Admin\`

---

 \`\`\`json
 // Response with String!
 {"data": {"logout": "Logout successful"}}
 \`\`\`
`,
  ME: `
#### \`Restricted to User and Admin\`

A user can query their own data
| Exception             | Code                  | Status Code | Message            |
| --------------------- | --------------------- | ----------- | ------------------ |
| UnauthorizedException | UNAUTHENTICATED       | 401         | Unauthorized       |
| NotFoundException     | INTERNAL_SERVER_ERROR | 404         | Customer not found |
`,
  REFERSH_TOKEN: `
| Exception             | Code            | Status Code | Message               |
| --------------------- | --------------- | ----------- | --------------------- |
| UnauthorizedException | UNAUTHENTICATED | 401         | Invalid refresh token |
| UnauthorizedException | UNAUTHENTICATED | 401         | Customer not found    |
| UnauthorizedException | UNAUTHENTICATED | 401         | Customer is suspended |

---

 \`\`\`json
 // Response with String!
 {"data": {"refreshTokens": "Refresh token successful"}}
 \`\`\`
  `,
  FORGET_PASSWORD: `
| Exception           | Code                  | Status Code | Message                                            |
| ------------------- | --------------------- | ----------- | -------------------------------------------------- |
| NotFoundException   | INTERNAL_SERVER_ERROR | 404         | Customer associated with this email does not exist |
| BadRequestException | BAD_REQUEST           | 400         | [ "email must be an email" ]                       |
|                     | BAD_USER_INPUT        |             |                                                    |
| BadRequestException | BAD_REQUEST           | 400         | Too many attempts                                  |
`,
  RESET_PASSWORD: `
| Exception           | Code                  | Status Code | Message                                                                                                                 |
| ------------------- | --------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| NotFoundException   | INTERNAL_SERVER_ERROR | 404         | Customer associated with this email does not exist                                                                      |
| BadRequestException | BAD_REQUEST           | 400         | [ "token must be a string", "token should not be empty" ]                                                               |
| BadRequestException | BAD_REQUEST           | 400         | [ "password must be longer than or equal to 8 characters", "password must be shorter than or equal to 100 characters" ] |
| BadRequestException | BAD_REQUEST           | 400         | Customer not found                                                                                                      |
|                     | BAD_USER_INPUT        |             |                                                                                                                         |
`,
  CHANGE_PASSWORD: `
#### \`Restricted to User and Admin. Fresh Access Token is required\`

For enhanced security, certain actions require a fresh authentication token. If you've been logged in for more than 10 minutes, you'll need to re-login to proceed with these specific actions.

| Exception             | Code            | Status Code | Message                                                                                                                                                                                        |
| --------------------- | --------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized                                                                                                                                                                                   |
| BadRequestException   | BAD_REQUEST     | 400         | ["oldPassword must be a string", "oldPassword should not be empty", "oldPassword must be longer than or equal to 8 characters", "oldPassword must be shorter than or equal to 100 characters"] |
| BadRequestException   | BAD_REQUEST     | 400         | ["newPassword must be a string", "newPassword should not be empty", "newPassword must be longer than or equal to 8 characters", "newPassword must be shorter than or equal to 100 characters"] |
| BadRequestException   | BAD_REQUEST     | 400         | Customer not found                                                                                                                                                                             |
| BadRequestException   | BAD_REQUEST     | 400         | Invalid old password                                                                                                                                                                           |
|                       | BAD_USER_INPUT  |             |                                                                                                                                                                                                |
`,
  TESTING_PROTECTED_METHOD: `
#### \`Restricted to User and Admin\`

Just for testing. You need to login to access this protected method.

| Exception             | Code            | Status Code | Message      |
| --------------------- | --------------- | ----------- | ------------ |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized |
`,
  TESTING_ADMIN_PROTECTED_METHOD: `
#### \`Restricted to Admin only\`

Just for testing.

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
`,
  TESTING_FRESH_TOKEN_PROTECTED_METHOD: `
#### \`Restricted to User and Admin. Fresh Access Token is required\`

For enhanced security, certain actions require a fresh authentication token. If you've been logged in for more than 10 minutes, you'll need to re-login to proceed with these specific actions.

| Exception             | Code            | Status Code | Message      |
| --------------------- | --------------- | ----------- | ------------ |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized |
`,
  RESEND_EMAIL_VERIFICATION: `
This method can be used with \`mutation verifyEmail\` if verification token is invalid (like link expired).

| Exception           | Code                  | Status Code | Message                                            |
| ------------------- | --------------------- | ----------- | -------------------------------------------------- |
| NotFoundException   | INTERNAL_SERVER_ERROR | 404         | Customer associated with this email does not exist |
| BadRequestException | BAD_REQUEST           | 400         | Too many attempts                                  |
|                     | BAD_USER_INPUT        |             |                                                    |
`,
  REGISTER_ADMIN: `
| Exception           | Code                  | Status Code | Message                        |
| ------------------- | --------------------- | ----------- | ------------------------------ |
| BadRequestException | BAD_REQUEST           | 400         | Verification token has expired |
| BadRequestException | BAD_REQUEST           | 400         | Verification token is invalid  |
|                     | BAD_USER_INPUT        |             |                                |
| NotFoundException   | INTERNAL_SERVER_ERROR | 404         | Customer not found             |
`,
  REGISTER_ADMIN_REGISTRATION_EMAIL: `
This method can be used together with \`registerAdmin mutation\` if token expired/invalid or admin forget password.

| Exception           | Code                  | Status Code | Message                                            |
| ------------------- | --------------------- | ----------- | -------------------------------------------------- |
| BadRequestException | BAD_REQUEST           | 400         | Too many attempts                                  |
| NotFoundException   | INTERNAL_SERVER_ERROR | 404         | Customer associated with this email does not exist |
`,
  SUSPEND_CUSTOMER: `
#### \`Restricted to Admin only\`

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
| BadRequestException   | BAD_REQUEST     | 400         | Customer not found |
|                       | BAD_USER_INPUT  |             |                    |
`,
  REINSTATE_CUSTOMER: `
#### \`Restricted to Admin only\`

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
| BadRequestException   | BAD_REQUEST     | 400         | Customer not found |
|                       | BAD_USER_INPUT  |             |                    |
`,
  SET_REFERRAL_VIEW_LEVEL: `
#### \`Restricted to Admin only\`

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
`,
  SET_REFERRAL_CODE_ENABLED_STATUS: `
#### \`Restricted to Admin only\`

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
`,
  GET_CONFIG: `
#### \`Restricted to Admin only\`

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
  `,
  GET_CUSTOMERS: `
#### \`Restricted to Admin only\`

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
  `,
  GENERATE_PRESIGNED_URL: `
#### \`Restricted to User and Admin\`

| Exception                    | Code                  | Status Code | Message                                                                 |
| ---------------------------- | --------------------- | ----------- | ----------------------------------------------------------------------- |
| UnauthorizedException        | UNAUTHENTICATED       | 401         | Unauthorized                                                            |
| BadRequestException          | BAD_REQUEST           | 400         | Invalid file extension                                                  |
| InternalServerErrorException | INTERNAL_SERVER_ERROR | 500         | Failed to generate pre-signed URL                                       |
| BadRequestException          | BAD_REQUEST           | 400         | ["type must be a valid ImageType"]                                      |
| BadRequestException          | BAD_REQUEST           | 400         | ["fileExtension must be a string", "fileExtension should not be empty"] |
|                              | BAD_USER_INPUT        |             |                                                                         |
  `,
  SAVE_UPLOADED_IMAGE: `
#### \`Restricted to Admin only\`

After Frontend uploading image to S3 bucket, save the path using the following format \`https://\${BUCKET_NAME}.s3.\${AWS_REGION}.amazonaws.com/\${key-from-generatePresignedUrl-mutation}\` . You can find an example in the \`upload.spec.ts\` file located in the end-to-end test folder.
  
| Exception             | Code            | Status Code | Message                                               |
| --------------------- | --------------- | ----------- | ----------------------------------------------------- |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource                                    |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized                                          |
| BadRequestException   | BAD_REQUEST     | 400         | ["path must be a string", "path should not be empty"] |
| BadRequestException   | BAD_REQUEST     | 400         | ["type must be a valid ImageType"]                    |
| BadRequestException   | BAD_REQUEST     | 400         | ["customerId must be an integer"]                     |
| BadRequestException   | BAD_REQUEST     | 400         | ["packageId must be an integer"]                      |
|                       | BAD_USER_INPUT  |             |                                                       |

`,
  GET_REFERRAL_MAP: `
#### \`Restricted to User and Admin\`

The depth of the referral map view is determined by the \`referralViewLevel\` setting configured by the admin

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
`,
  SET_OR_EDIT_TOKEN_PRICE: `
#### \`Restricted to Admin only\`

| Exception             | Code            | Status Code | Message                                                                                                                 |
| --------------------- | --------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource                                                                                                      |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized                                                                                                            |
| BadRequestException   | BAD_REQUEST     | 400         | ["price must be a number", "price should not be empty", "price must be a valid currency format"]                        |
| BadRequestException   | BAD_REQUEST     | 400         | ["currency must be a string", "currency should not be empty", "currency must be one of the following: USD, GBP or EUR"] |
|                       | BAD_USER_INPUT  |             |                                                                                                                         |
`,
  CREATE_TOKEN_PACKAGE: `
#### \`Restricted to Admin only\`

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
`,
  EDIT_TOKEN_PACKAGE: `
#### \`Restricted to Admin only\`

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
`,
  TOGGLE_TOKEN_PACKAGE_STATUS: `
#### \`Restricted to Admin only\`

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
|                       | BAD_USER_INPUT  |             |                    |
`,
  DELETE_TOKEN_PACKAGE: `
#### \`Restricted to Admin only\`

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
|                       | BAD_USER_INPUT  |             |                    |
`,
  GET_TOKEN_PACKAGE: `

| Exception | Code           | Status Code | Message |
| --------- | -------------- | ----------- | ------- |
|           | BAD_USER_INPUT |             |         |
`,
  GET_ALL_TOKEN_PACKAGES_BY_STATUS: `

| Exception | Code           | Status Code | Message |
| --------- | -------------- | ----------- | ------- |
|           | BAD_USER_INPUT |             |         |
`,
  PURCHASE_TOKENS: `
#### \`Restricted to User and Admin\`

| Exception                    | Code                  | Status Code | Message                            |
|------------------------------|-----------------------|-------------|------------------------------------|
| UnauthorizedException        | UNAUTHENTICATED       | 401         | Unauthorized                       |
| InternalServerErrorException | INTERNAL_SERVER_ERROR | 500         | Unexpected charge object structure |
| InternalServerErrorException | INTERNAL_SERVER_ERROR | 500         | Failed to create charge            |
| InternalServerErrorException | INTERNAL_SERVER_ERROR | 500         | Failed recording new charge        |
| NotFoundException            | INTERNAL_SERVER_ERROR | 404         | Token Package not found            |
| NotFoundException            | INTERNAL_SERVER_ERROR | 404         | Token Price not found              |
| NotFoundException            | INTERNAL_SERVER_ERROR | 404         | Quantity token not provided        |
|                              | BAD_USER_INPUT        |             |                                    |
`,
  GET_PURCHASE_ACTIVITIES: `
#### \`Restricted to Admin only\`

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
|                       | BAD_USER_INPUT  |             |                    |
`,
  GET_PURCHASE_ACTIVITIES_FOR_CUSTOMER: `
#### \`Restricted to User and Admin\`

| Exception             | Code            | Status Code | Message      |
| --------------------- | --------------- | ----------- | ------------ |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized |
|                       | BAD_USER_INPUT  |             |              |
`,
  GET_CHARGES: `
#### \`Restricted to Admin only\`

 Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
|                       | BAD_USER_INPUT  |             |                    |
`,
  CREATE_COMMISSION_TIER: `
#### \`Restricted to Admin only\`

| Exception             | Code                  | Status Code | Message                        |
| --------------------- | --------------------- | ----------- | ------------------------------ |
| UnauthorizedException | UNAUTHENTICATED       | 401         | Unauthorized                   |
| ForbiddenException    | FORBIDDEN             | 403         | Forbidden Resource             |
| ConflictException     | INTERNAL_SERVER_ERROR | 409         | Commission Tier already exists |
|                       | BAD_USER_INPUT        |             |                                |
`,
  UPDATE_COMMISSION_TIER: `
#### \`Restricted to Admin only\`

| Exception             | Code                  | Status Code | Message                   |
| --------------------- | --------------------- | ----------- | ------------------------- |
| UnauthorizedException | UNAUTHENTICATED       | 401         | Unauthorized              |
| ForbiddenException    | FORBIDDEN             | 403         | Forbidden Resource        |
| NotFoundException     | INTERNAL_SERVER_ERROR | 404         | Commission Tier not found |
|                       | BAD_USER_INPUT        |             |                           |
`,
  DELETE_COMMISSION_TIER: `
#### \`Restricted to Admin only\`

| Exception             | Code                  | Status Code | Message                   |
| --------------------- | --------------------- | ----------- | ------------------------- |
| UnauthorizedException | UNAUTHENTICATED       | 401         | Unauthorized              |
| ForbiddenException    | FORBIDDEN             | 403         | Forbidden Resource        |
| NotFoundException     | INTERNAL_SERVER_ERROR | 404         | Commission Tier not found |
|                       | BAD_USER_INPUT        |             |                           |
`,
  GET_ALL_COMMISSION_RATES: `
#### \`Restricted to User and Admin\`

| Exception             | Code            | Status Code | Message      |
| --------------------- | --------------- | ----------- | ------------ |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized |
`,
  GET_COMMISSIONS: `
#### \`Restricted to Admin only\`

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
|                       | BAD_USER_INPUT  |             |                    |
`,
  GET_COMMISSIONS_FOR_CUSTOMER: `
#### \`Restricted to User and Admin\`

| Exception             | Code            | Status Code | Message      |
| --------------------- | --------------- | ----------- | ------------ |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized |
|                       | BAD_USER_INPUT  |             |              |
`,
  UPDATE_COMMISSION_TRANSFER_STATUS: `
#### \`Restricted to Admin only\`

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
|                       | BAD_USER_INPUT  |             |                    |
`,
  IS_COMMISSION_TRANSFERRED: `
#### \`Restricted to Admin only\`

| Exception             | Code            | Status Code | Message            |
| --------------------- | --------------- | ----------- | ------------------ |
| ForbiddenException    | FORBIDDEN       | 403         | Forbidden Resource |
| UnauthorizedException | UNAUTHENTICATED | 401         | Unauthorized       |
|                       | BAD_USER_INPUT  |             |                    |
`,
  CREATE_WALLET: `
#### \`Restricted to User and Admin\`

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
`,
  UPDATE_WALLET: `
#### \`Restricted to User and Admin\`

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
|                       | BAD_USER_INPUT        |             | 
`,
  SET_DEFAULT_WALLET: `
#### \`Restricted to User and Admin\`

| Exception             | Code                  | Status Code | Message                              |
| --------------------- | --------------------- | ----------- | ------------------------------------ |
| UnauthorizedException | UNAUTHENTICATED       | 401         | Unauthorized                         |
| BadRequestException   | BAD_REQUEST           | 400         | [ "customerId should not be empty" ] |
| BadRequestException   | BAD_REQUEST           | 400         | [ "walletId should not be empty" ]   |
| BadRequestException   | BAD_REQUEST           | 400         | Operation not allowed                |
| NotFoundException     | INTERNAL_SERVER_ERROR | 404         | Wallet not found                     |
|                       | BAD_USER_INPUT        |             |     
`,
  DELETE_WALLET: `
#### \`Restricted to User and Admin\`

| Exception             | Code                  | Status Code | Message                               |
| --------------------- | --------------------- | ----------- | ------------------------------------- |
| UnauthorizedException | UNAUTHENTICATED       | 401         | Unauthorized                          |
| BadRequestException   | BAD_REQUEST           | 400         | [ "customerId should not be empty" ]  |
| BadRequestException   | BAD_REQUEST           | 400         | [ "walletId should not be empty" ]    |
| BadRequestException   | BAD_REQUEST           | 400         | Operation not allowed                 |
| NotFoundException     | INTERNAL_SERVER_ERROR | 404         | Wallet not found                      |
| BadRequestException   | BAD_REQUEST           | 400         | You must have at least one ETH wallet |
|                       | BAD_USER_INPUT        |             |
`,
};
