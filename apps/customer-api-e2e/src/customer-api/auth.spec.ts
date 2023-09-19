import { clearCookies, graphQLClient, httpUrl } from '../support/test-setup';
import { gql, GraphQLClient } from 'graphql-request';
import {
  clearDatabase,
  connectToDatabase,
  disconnectFromDatabase,
} from '../support/test-utils';
import {
  IJwtPayload,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CONFIG,
  CustomerStatus,
} from '@charonium/common';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { Customer, CustomerRole } from '@prisma/client';
import { PrismaModule, PrismaService } from '@charonium/prisma';
import {
  createAndVerifyAdmin,
  createAndVerifyCustomer,
  fetchAdminReferralCode,
  waitForCondition,
} from './utils/auth-test.utils';

describe('Auth', () => {
  // console.log('Running Auth tests');

  let jwtService: JwtService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    await connectToDatabase();

    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: CONFIG.ACCESS_TOKEN_EXPIRATION },
        }),
        PrismaModule,
      ],
    }).compile();

    jwtService = moduleRef.get<JwtService>(JwtService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await clearDatabase();
    // Clear cookies before running the test
    clearCookies();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
  });

  const loginMutation = gql`
    mutation Login($input: LoginInput!) {
      login(input: $input)
    }
  `;

  const registerMutation = gql`
    mutation Register($input: RegisterInput!) {
      register(input: $input) {
        customerId
        email
        name
        referralCode
      }
    }
  `;

  const logoutMutation = gql`
    mutation Logout {
      logout
    }
  `;

  const refreshTokenMutation = gql`
    mutation RefreshTokens {
      refreshTokens
    }
  `;

  const protectedMethodQuery = gql`
    query ProtectedMethod {
      protectedMethod {
        sub
        name
        email
        role
      }
    }
  `;

  const forgetPasswordMutation = gql`
    mutation ForgetPassword($input: EmailInput!) {
      forgetPassword(input: $input)
    }
  `;

  const resetPasswordMutation = gql`
    mutation ResetPassword($input: ResetPasswordInput!) {
      resetPassword(input: $input)
    }
  `;

  const registerAdminMutation = gql`
    mutation RegisterAdmin($input: RegisterAdminInput!) {
      registerAdmin(input: $input)
    }
  `;

  const resendAdminRegistrationEmailMutation = gql`
    mutation {
      resendAdminRegistrationEmail
    }
  `;

  const protectedAdminMethodQuery = gql`
    query ProtectedAdminMethod {
      protectedAdminMethod {
        sub
        name
        email
        role
      }
    }
  `;

  const protectedFreshTokenMethodQuery = gql`
    query ProtectedFreshTokenMethod {
      protectedFreshTokenMethod {
        sub
        name
        email
        role
      }
    }
  `;

  const setReferralCodeEnabledStatusMutation = gql`
    mutation SetReferralCodeEnabledStatus($status: Boolean!) {
      setReferralCodeEnabledStatus(status: $status) {
        configId
        referralViewLevel
        isReferralCodeEnabled
        createdAt
        updatedAt
      }
    }
  `;

  interface SuspendedResponse {
    suspendCustomer: Customer;
  }

  interface ReinstateResponse {
    reinstateCustomer: Customer;
  }

  interface RefreshTokensResponse {
    refreshTokens: string;
  }

  interface SetReferralCodeEnabledStatusResponse {
    setReferralCodeEnabledStatus: {
      configId: number;
      referralViewLevel: number;
      isReferralCodeEnabled: boolean;
      createdAt: Date;
      updatedAt?: Date;
    };
  }

  interface RegisterResponse {
    register: {
      customerId: number;
      email: string;
      name: string;
      referralCode: string;
    };
  }

  it('should login successfully', async () => {
    // First, register a user for testing
    const registerInput = {
      name: 'John Doer',
      email: 'john.doer@gmail.com',
      password: 'password12345',
    };

    const { verifiedEmailResponse } = await createAndVerifyCustomer(
      graphQLClient,
      registerInput
    );

    expect(verifiedEmailResponse.verifyEmail.success).toBe(true);
    expect(verifiedEmailResponse.verifyEmail.message).toBe(
      SUCCESS_MESSAGES.CUSTOMER_IS_VERIFIED
    );

    // Now, attempt to log in with the registered user's credentials
    const loginInput = {
      email: 'john.doer@gmail.com',
      password: 'password12345',
    };

    const loginResponse: { login: string } = await graphQLClient.request(
      loginMutation,
      {
        input: loginInput,
      }
    );

    expect(loginResponse.login).toEqual(SUCCESS_MESSAGES.LOGIN_SUCCESS);
  });

  it('should logout successfully', async () => {
    // First, register and login a user for testing
    const registerInput = {
      name: 'John Doey',
      email: 'john.doey@gmail.com',
      password: 'password12345',
    };

    const { verifiedEmailResponse } = await createAndVerifyCustomer(
      graphQLClient,
      registerInput
    );

    expect(verifiedEmailResponse.verifyEmail.success).toBe(true);
    expect(verifiedEmailResponse.verifyEmail.message).toBe(
      SUCCESS_MESSAGES.CUSTOMER_IS_VERIFIED
    );

    const loginInput = {
      email: 'john.doey@gmail.com',
      password: 'password12345',
    };

    await graphQLClient.request(loginMutation, {
      input: loginInput,
    });

    // Now, attempt to log out
    const logoutResponse: { logout: string } = await graphQLClient.request(
      logoutMutation
    );

    expect(logoutResponse.logout).toEqual(SUCCESS_MESSAGES.LOGOUT_SUCCESS);

    // try to attempt to access protected method, and expect e
    let error;
    try {
      await graphQLClient.request(protectedMethodQuery);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.response.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
    expect(error.response.errors[0].message).toEqual('Unauthorized');
  });

  it('should not login with an incorrect email', async () => {
    const registerInput = {
      name: 'John Doet',
      email: 'john.doet@gmail.com',
      password: 'password12345',
    };

    const { verifiedEmailResponse } = await createAndVerifyCustomer(
      graphQLClient,
      registerInput
    );

    expect(verifiedEmailResponse.verifyEmail.success).toBe(true);
    expect(verifiedEmailResponse.verifyEmail.message).toBe(
      SUCCESS_MESSAGES.CUSTOMER_IS_VERIFIED
    );

    const loginInput = {
      email: 'incorrect.email@gmail.com',
      password: 'password12345',
    };

    try {
      await graphQLClient.request(loginMutation, {
        input: loginInput,
      });
    } catch (error) {
      expect(error.response.errors[0].message).toEqual(
        ERROR_MESSAGES.INVALID_INPUT_EMAIL
      );
    }
  });

  it('should not login with an incorrect password', async () => {
    const registerInput = {
      name: 'John Doet',
      email: 'john.doet@gmail.com',
      password: 'password12345',
    };

    const { verifiedEmailResponse } = await createAndVerifyCustomer(
      graphQLClient,
      registerInput
    );

    expect(verifiedEmailResponse.verifyEmail.success).toBe(true);
    expect(verifiedEmailResponse.verifyEmail.message).toBe(
      SUCCESS_MESSAGES.CUSTOMER_IS_VERIFIED
    );

    const loginInput = {
      email: 'john.doet@gmail.com',
      password: 'incorrectPassword',
    };

    try {
      await graphQLClient.request(loginMutation, {
        input: loginInput,
      });
    } catch (error) {
      expect(error.response.errors[0].message).toEqual(
        ERROR_MESSAGES.INVALID_INPUT_PASSWORD
      );
    }
  });

  it('should refresh tokens successfully', async () => {
    const registerInput = {
      name: 'John Doek',
      email: 'john.doek@gmail.com',
      password: 'password12345',
    };

    const { verifiedEmailResponse } = await createAndVerifyCustomer(
      graphQLClient,
      registerInput
    );

    expect(verifiedEmailResponse.verifyEmail.success).toBe(true);
    expect(verifiedEmailResponse.verifyEmail.message).toBe(
      SUCCESS_MESSAGES.CUSTOMER_IS_VERIFIED
    );

    const loginInput = {
      email: 'john.doek@gmail.com',
      password: 'password12345',
    };

    const loginResponse = await graphQLClient.rawRequest(loginMutation, {
      input: loginInput,
    });

    // Check if 'set-cookie' header exists
    if (!loginResponse.headers.get('set-cookie')) {
      throw new Error('set-cookie header not found in the response headers');
    }

    const cookiesString = loginResponse.headers.get('set-cookie');
    const cookies = cookiesString.split(', ');

    const accessTokenHeader = cookies.find((cookie: string) =>
      cookie.startsWith('access_token=')
    );

    if (!accessTokenHeader) {
      throw new Error('Access token not found in the response headers');
    }

    // const accessToken = accessTokenHeader
    //   .replace('access_token=', '')
    //   .split(';')[0];

    const refreshTokenHeader = cookies.find((cookie: string) =>
      cookie.startsWith('refresh_token=')
    );

    if (!refreshTokenHeader) {
      throw new Error('Refresh token not found in the response headers');
    }

    const refreshToken = refreshTokenHeader
      .replace('refresh_token=', '')
      .split(';')[0];

    const graphQLClientWithRefreshToken = new GraphQLClient(httpUrl, {
      credentials: 'include',
      headers: {
        cookie: `refresh_token=${refreshToken}`,
      },
    });

    const refreshTokensResponse: { refreshTokens: string } =
      await graphQLClientWithRefreshToken.request(refreshTokenMutation);

    // const refreshTokensResponse: { refreshTokens: string } =
    //   await graphQLClient.request(refreshTokenMutation);

    expect(refreshTokensResponse.refreshTokens).toEqual(
      SUCCESS_MESSAGES.REFRESH_TOKEN_SUCCESS
    );
  });

  it('should refresh tokens with expired access token', async () => {
    const registerInput = {
      name: 'John Does',
      email: 'john.does@gmail.com',
      password: 'password12345',
    };

    const { verifiedEmailResponse } = await createAndVerifyCustomer(
      graphQLClient,
      registerInput
    );

    expect(verifiedEmailResponse.verifyEmail.success).toBe(true);
    expect(verifiedEmailResponse.verifyEmail.message).toBe(
      SUCCESS_MESSAGES.CUSTOMER_IS_VERIFIED
    );

    const loginInput = {
      email: 'john.does@gmail.com',
      password: 'password12345',
    };

    const loginResponse = await graphQLClient.rawRequest(loginMutation, {
      input: loginInput,
    });

    // Check if 'set-cookie' header exists
    if (!loginResponse.headers.get('set-cookie')) {
      throw new Error('set-cookie header not found in the response headers');
    }

    const cookiesString = loginResponse.headers.get('set-cookie');
    const cookies = cookiesString.split(', ');

    const refreshTokenHeader = cookies.find((cookie: string) =>
      cookie.startsWith('refresh_token=')
    );

    if (!refreshTokenHeader) {
      throw new Error('Refresh token not found in the response headers');
    }

    const refreshToken = refreshTokenHeader
      .replace('refresh_token=', '')
      .split(';')[0];

    // Decode access token
    const accessTokenHeader = cookies.find((cookie: string) =>
      cookie.startsWith('access_token=')
    );

    if (!accessTokenHeader) {
      throw new Error('Access token not found in the response headers');
    }

    const accessToken = accessTokenHeader
      .replace('access_token=', '')
      .split(';')[0];

    const decodedAccessToken: IJwtPayload = jwtService.decode(
      accessToken
    ) as IJwtPayload;

    // Create a new access token with a short expiration time (e.g., 2 seconds)
    const newAccessToken = jwtService.sign(
      { sub: decodedAccessToken.sub, email: decodedAccessToken.email },
      { expiresIn: '1s' }
    );

    // Wait for 3 seconds to let the new access token expire
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create a new GraphQL client with the expired access token and the refresh token
    const graphQLClientWithExpiredAccessToken = new GraphQLClient(httpUrl, {
      credentials: 'include',
      headers: {
        cookie: `access_token=${newAccessToken}; refresh_token=${refreshToken}`,
      },
    });

    // Try to access the protected method with an expired access token (should fail)
    try {
      await graphQLClientWithExpiredAccessToken.request(protectedMethodQuery);
    } catch (error) {
      expect(error.response.errors[0].extensions.code).toBe('UNAUTHENTICATED');
    }

    // Try to refresh the tokens
    const refreshTokensResponse =
      await graphQLClientWithExpiredAccessToken.rawRequest(
        refreshTokenMutation
      );

    expect(refreshTokensResponse.data).toEqual({
      refreshTokens: SUCCESS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    });

    // Get the new access token from the response headers
    const newCookiesString = refreshTokensResponse.headers.get('set-cookie');
    const newCookies = newCookiesString.split(', ');

    const newAccessTokenHeader = newCookies.find((cookie: string) =>
      cookie.startsWith('access_token=')
    );

    if (!newAccessTokenHeader) {
      throw new Error('New access token not found in the response headers');
    }

    const newAccessToken2 = newAccessTokenHeader
      .replace('access_token=', '')
      .split(';')[0];

    // Create a new GraphQL client with the new access token
    const graphQLClientWithNewAccessToken = new GraphQLClient(httpUrl, {
      credentials: 'include',
      headers: {
        cookie: `access_token=${newAccessToken2}; refresh_token=${refreshToken}`,
      },
    });

    // Try to access the protected method with the new access token
    const protectedMethodResponse: { protectedMethod: IJwtPayload } =
      await graphQLClientWithNewAccessToken.request(protectedMethodQuery);
    expect(protectedMethodResponse.protectedMethod).toEqual({
      sub: decodedAccessToken.sub,
      name: decodedAccessToken.name,
      email: decodedAccessToken.email,
      role: decodedAccessToken.role,
    });
  });

  it('should not refresh tokens with an expired refresh token', async () => {
    const registerInput = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };

    const { verifiedEmailResponse } = await createAndVerifyCustomer(
      graphQLClient,
      registerInput
    );

    expect(verifiedEmailResponse.verifyEmail.success).toBe(true);
    expect(verifiedEmailResponse.verifyEmail.message).toBe(
      SUCCESS_MESSAGES.CUSTOMER_IS_VERIFIED
    );

    const loginInput = {
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };

    const loginResponse = await graphQLClient.rawRequest(loginMutation, {
      input: loginInput,
    });

    const cookiesString = loginResponse.headers.get('set-cookie');
    const cookies = cookiesString.split(', ');

    const refreshTokenHeader = cookies.find((cookie: string) =>
      cookie.startsWith('refresh_token=')
    );

    if (!refreshTokenHeader) {
      throw new Error('Refresh token not found in the response headers');
    }

    const refreshToken = refreshTokenHeader
      .replace('refresh_token=', '')
      .split(';')[0];

    const decodedRefreshToken: IJwtPayload = jwtService.decode(
      refreshToken
    ) as IJwtPayload;

    // Create a new refresh token with a short expiration time (e.g., 2 seconds)
    const newRefreshToken = jwtService.sign(
      { sub: decodedRefreshToken.sub, email: decodedRefreshToken.email },
      { expiresIn: '1s' }
    );

    // Wait for 3 seconds to let the new refresh token expire
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create a new GraphQL client with the expired refresh token
    const graphQLClientWithExpiredRefreshToken = new GraphQLClient(httpUrl, {
      credentials: 'include',
      headers: {
        cookie: `refresh_token=${newRefreshToken}`,
      },
    });

    // Try to refresh the tokens using the expired refresh token
    try {
      await graphQLClientWithExpiredRefreshToken.request(refreshTokenMutation);
    } catch (error) {
      expect(error.response.errors[0].message).toEqual(
        ERROR_MESSAGES.INVALID_REFRESH_TOKEN
      );
    }
  });

  it('should throw UnauthorizedException for protected method', async () => {
    let error;
    try {
      await graphQLClient.request(protectedMethodQuery);
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.response.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
    expect(error.response.errors[0].message).toEqual('Unauthorized');
  });

  // ... other imports and test cases

  it('should reset password successfully', async () => {
    // Register a new user
    const registerInput = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };

    const registerResponse: { register: Customer } =
      await graphQLClient.request(registerMutation, {
        input: registerInput,
      });

    const registeredCustomer = registerResponse.register;

    // Call the forgetPassword mutation
    const forgetPasswordResponse: { forgetPassword: boolean } =
      await graphQLClient.request(forgetPasswordMutation, {
        input: { email: registerInput.email },
      });

    expect(forgetPasswordResponse.forgetPassword).toBe(true);

    // Mock the email sending process and obtain the reset token
    const resetToken = jwt.sign(
      {
        sub: registeredCustomer.customerId,
        email: registeredCustomer.email,
        role: CustomerRole.USER,
      },
      process.env.JWT_SECRET,
      { expiresIn: CONFIG.EMAIL_TOKEN_EXPIRATION }
    );

    // Call the resetPassword mutation
    const newPassword = 'newpassword12345';
    const resetPasswordInput = {
      token: resetToken,
      newPassword: newPassword,
    };

    const resetPasswordResponse: { resetPassword: boolean } =
      await graphQLClient.request(resetPasswordMutation, {
        input: resetPasswordInput,
      });

    expect(resetPasswordResponse.resetPassword).toBe(true);

    // Verify that the user can log in with the new password
    const loginInput = {
      email: registerInput.email,
      password: newPassword,
    };

    const loginResponse: { login: string } = await graphQLClient.request(
      loginMutation,
      {
        input: loginInput,
      }
    );

    expect(loginResponse.login).toBeTruthy();
  });

  it('should access protected-admin method as an admin', async () => {
    const admin: Customer = await prismaService.customer.findUnique({
      where: { email: process.env.ADMIN_EMAIL },
    });

    const adminPayload: IJwtPayload = {
      sub: admin.customerId,
      name: admin.name,
      email: admin.email,
      role: admin.customerRole,
    };

    const adminRegistrationToken = jwtService.sign(adminPayload);

    const registerAdminInput = {
      token: adminRegistrationToken,
      newName: 'Admin User',
      newPassword: 'admin_password12345',
    };

    await graphQLClient.request(registerAdminMutation, {
      input: registerAdminInput,
    });

    const adminLoginInput = {
      email: process.env.ADMIN_EMAIL,
      password: 'admin_password12345',
    };

    const loginResponse = await graphQLClient.rawRequest(loginMutation, {
      input: adminLoginInput,
    });

    // Get the 'set-cookie' response header containing the access token
    const cookiesString = loginResponse.headers.get('set-cookie');
    const cookies = cookiesString.split(', ');
    const accessTokenHeader = cookies.find((cookie: string) =>
      cookie.startsWith('access_token=')
    );

    if (!accessTokenHeader) {
      throw new Error('Access token not found in the response headers');
    }

    const accessToken = accessTokenHeader
      .replace('access_token=', '')
      .split(';')[0];

    const graphQLClientWithAdminAccessToken = new GraphQLClient(httpUrl, {
      credentials: 'include',
      headers: {
        cookie: `access_token=${accessToken}`,
      },
    });

    const protectedAdminMethodResponse: { protectedAdminMethod: boolean } =
      await graphQLClientWithAdminAccessToken.request(
        protectedAdminMethodQuery
      );

    expect(protectedAdminMethodResponse.protectedAdminMethod).toEqual(
      adminPayload
    );
  });

  it('should not allow non-admin user to access protected-admin method', async () => {
    // Register a new non-admin user
    const registerInput = {
      name: 'Non-admin User',
      email: 'nonadmin@example.com',
      password: 'nonadmin_password12345',
    };

    const { verifiedEmailResponse } = await createAndVerifyCustomer(
      graphQLClient,
      registerInput
    );

    expect(verifiedEmailResponse.verifyEmail.success).toBe(true);
    expect(verifiedEmailResponse.verifyEmail.message).toBe(
      SUCCESS_MESSAGES.CUSTOMER_IS_VERIFIED
    );

    // Log in with the non-admin user
    const loginInput = {
      email: 'nonadmin@example.com',
      password: 'nonadmin_password12345',
    };

    const loginResponse = await graphQLClient.rawRequest(loginMutation, {
      input: loginInput,
    });

    // Get the 'set-cookie' response header containing the access token
    const cookiesString = loginResponse.headers.get('set-cookie');
    const cookies = cookiesString.split(', ');
    const accessTokenHeader = cookies.find((cookie: string) =>
      cookie.startsWith('access_token=')
    );

    if (!accessTokenHeader) {
      throw new Error('Access token not found in the response headers');
    }

    const accessToken = accessTokenHeader
      .replace('access_token=', '')
      .split(';')[0];

    // Attempt to access the protectedAdminMethod with the non-admin user's access token
    const graphQLClientWithNonAdminAccessToken = new GraphQLClient(httpUrl, {
      credentials: 'include',
      headers: {
        cookie: `access_token=${accessToken}`,
      },
    });

    try {
      await graphQLClientWithNonAdminAccessToken.request(
        protectedAdminMethodQuery
      );
    } catch (error) {
      // Check if the response returns an error or an expected message that indicates access is denied
      expect(error.response.errors[0].message).toBe('Forbidden resource');
    }
  });

  it('should allow admin user to reset their password and still able to access protected-admin method', async () => {
    // Retrieve the existing admin user from the database
    const admin: Customer = await prismaService.customer.findUnique({
      where: { email: process.env.ADMIN_EMAIL },
    });

    // Call the resendAdminRegistrationEmail mutation
    const resendAdminRegistrationEmailResponse: {
      resendAdminRegistrationEmail: boolean;
    } = await graphQLClient.request(resendAdminRegistrationEmailMutation);

    expect(
      resendAdminRegistrationEmailResponse.resendAdminRegistrationEmail
    ).toBe(true);

    // Mock the email sending process and obtain the registration token
    const adminPayload: IJwtPayload = {
      sub: admin.customerId,
      name: admin.name,
      email: admin.email,
      role: admin.customerRole,
    };
    const registrationToken = jwt.sign(adminPayload, process.env.JWT_SECRET, {
      expiresIn: CONFIG.EMAIL_TOKEN_EXPIRATION,
    });

    // Call the registerAdmin mutation with the registration token and the new password
    const newName = 'New Admin Name';
    const newPassword = 'newadminpassword12345';
    const registerAdminInput = {
      token: registrationToken,
      newName: newName,
      newPassword: newPassword,
    };

    // since we change admin name to new name
    adminPayload.name = newName;

    const registerAdminResponse: { registerAdmin: boolean } =
      await graphQLClient.request(registerAdminMutation, {
        input: registerAdminInput,
      });

    expect(registerAdminResponse.registerAdmin).toBe(true);

    // Verify that the admin user can log in with the new password
    const loginInput = {
      email: admin.email,
      password: newPassword,
    };

    const loginResponse = await graphQLClient.rawRequest(loginMutation, {
      input: loginInput,
    });

    // Get the 'set-cookie' response header containing the access token
    const cookiesString = loginResponse.headers.get('set-cookie');
    const cookies = cookiesString.split(', ');
    const accessTokenHeader = cookies.find((cookie: string) =>
      cookie.startsWith('access_token=')
    );

    if (!accessTokenHeader) {
      throw new Error('Access token not found in the response headers');
    }

    const accessToken = accessTokenHeader
      .replace('access_token=', '')
      .split(';')[0];

    const graphQLClientWithAdminAccessToken = new GraphQLClient(httpUrl, {
      credentials: 'include',
      headers: {
        cookie: `access_token=${accessToken}`,
      },
    });

    const protectedAdminMethodResponse: { protectedAdminMethod: boolean } =
      await graphQLClientWithAdminAccessToken.request(
        protectedAdminMethodQuery
      );

    expect(protectedAdminMethodResponse.protectedAdminMethod).toEqual(
      adminPayload
    );
  });

  it('should not allow suspended customer to refresh tokens', async () => {
    // 1. Register a customer
    const registerInput = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };

    const { verifiedEmailResponse } = await createAndVerifyCustomer(
      graphQLClient,
      registerInput
    );

    expect(verifiedEmailResponse.verifyEmail.success).toBe(true);
    expect(verifiedEmailResponse.verifyEmail.message).toBe(
      SUCCESS_MESSAGES.CUSTOMER_IS_VERIFIED
    );

    // 2. Login as the customer
    const loginInput = {
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };

    const loginResponse = await graphQLClient.rawRequest(loginMutation, {
      input: loginInput,
    });

    const cookiesString = loginResponse.headers.get('set-cookie');
    const cookies = cookiesString.split(', ');
    const refreshTokenHeader = cookies.find((cookie: string) =>
      cookie.startsWith('refresh_token=')
    );

    if (!refreshTokenHeader) {
      throw new Error('Refresh token not found in the response headers');
    }

    const refreshToken = refreshTokenHeader
      .replace('refresh_token=', '')
      .split(';')[0];

    const graphQLClientWithCustomerTokens = new GraphQLClient(httpUrl, {
      credentials: 'include',
      headers: {
        cookie: `refresh_token=${refreshToken}`,
      },
    });

    // 3. Login as an admin
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    // 4. Suspend the customer using the admin's access token
    const suspendCustomerMutation = gql`
      mutation SuspendCustomer($customerId: Int!) {
        suspendCustomer(customerId: $customerId) {
          customerId
          name
          email
          customerStatus
        }
      }
    `;

    const customer: Customer = await prismaService.customer.findUnique({
      where: { email: 'john.doe@gmail.com' },
    });

    const suspendedCustomerResponse: SuspendedResponse =
      await graphQLClientWithAdminAccessToken.request(suspendCustomerMutation, {
        customerId: customer.customerId,
      });
    expect(suspendedCustomerResponse.suspendCustomer.customerStatus).toBe(
      CustomerStatus.SUSPENDED
    );

    // 5. Try to refresh the customer's tokens and expect an error
    try {
      await graphQLClientWithCustomerTokens.request(refreshTokenMutation);
    } catch (error) {
      expect(error.response.errors[0].message).toBe(
        ERROR_MESSAGES.CUSTOMER_SUSPENDED
      );
    }
  });

  it('should allow admin to reinstate a suspended customer', async () => {
    // 1. Register a customer
    const registerInput = {
      name: 'John Reinstate',
      email: 'john.reinstate@gmail.com',
      password: 'password12345',
    };

    const { verifiedEmailResponse } = await createAndVerifyCustomer(
      graphQLClient,
      registerInput
    );

    expect(verifiedEmailResponse.verifyEmail.success).toBe(true);
    expect(verifiedEmailResponse.verifyEmail.message).toBe(
      SUCCESS_MESSAGES.CUSTOMER_IS_VERIFIED
    );

    // 2. Login as the customer
    const loginInput = {
      email: 'john.reinstate@gmail.com',
      password: 'password12345',
    };

    const loginResponse = await graphQLClient.rawRequest(loginMutation, {
      input: loginInput,
    });

    const cookiesString = loginResponse.headers.get('set-cookie');
    const cookies = cookiesString.split(', ');
    const refreshTokenHeader = cookies.find((cookie: string) =>
      cookie.startsWith('refresh_token=')
    );

    if (!refreshTokenHeader) {
      throw new Error('Refresh token not found in the response headers');
    }

    const refreshToken = refreshTokenHeader
      .replace('refresh_token=', '')
      .split(';')[0];

    const graphQLClientWithCustomerTokens = new GraphQLClient(httpUrl, {
      credentials: 'include',
      headers: {
        cookie: `refresh_token=${refreshToken}`,
      },
    });

    // 3. Login as an admin
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    // 4. Suspend the customer using the admin's access token
    const suspendCustomerMutation = gql`
      mutation SuspendCustomer($customerId: Int!) {
        suspendCustomer(customerId: $customerId) {
          customerId
          name
          email
          customerStatus
        }
      }
    `;

    const customer: Customer = await prismaService.customer.findUnique({
      where: { email: 'john.reinstate@gmail.com' },
    });

    const suspendedCustomerResponse: SuspendedResponse =
      await graphQLClientWithAdminAccessToken.request(suspendCustomerMutation, {
        customerId: customer.customerId,
      });
    expect(suspendedCustomerResponse.suspendCustomer.customerStatus).toBe(
      CustomerStatus.SUSPENDED
    );

    // wait for condition
    // await waitForCondition(async () => {
    //   const customer = await prismaService.customer.findUnique({
    //     where: { email: 'john.reinstate@gmail.com' },
    //   });
    //   return customer.customerStatus === CustomerStatus.SUSPENDED;
    // });

    // 5. Try to refresh the customer's tokens and expect an error
    try {
      await graphQLClientWithCustomerTokens.request(refreshTokenMutation);
    } catch (error) {
      expect(error.response.errors[0].message).toBe(
        ERROR_MESSAGES.CUSTOMER_SUSPENDED
      );
    }

    const reinstateCustomerMutation = gql`
      mutation ReinstateCustomer($customerId: Int!) {
        reinstateCustomer(customerId: $customerId) {
          customerId
          name
          email
          customerStatus
        }
      }
    `;

    // 6. Reinstate the customer using the admin's access token
    const reinstatedCustomerResponse: ReinstateResponse =
      await graphQLClientWithAdminAccessToken.request(
        reinstateCustomerMutation,
        {
          customerId: customer.customerId,
        }
      );

    expect(reinstatedCustomerResponse.reinstateCustomer.customerStatus).toBe(
      CustomerStatus.ACTIVE
    );

    // Wait for 1 seconds to let the database update the customer status
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // wait for condition
    // await waitForCondition(async () => {
    //   const customer = await prismaService.customer.findUnique({
    //     where: { email: 'john.reinstate@gmail.com' },
    //   });
    //   return customer.customerStatus === CustomerStatus.ACTIVE;
    // });

    // 7. Try to refresh the customer's tokens again (should succeed this time)
    const refreshTokensResponse: RefreshTokensResponse =
      await graphQLClientWithCustomerTokens.request(refreshTokenMutation);

    expect(refreshTokensResponse.refreshTokens).toBe(
      SUCCESS_MESSAGES.REFRESH_TOKEN_SUCCESS
    );
  });

  it('should allow access with a fresh token', async () => {
    // Use the same logic to get a valid access token as in your previous tests
    const registerInput = {
      name: 'John Fresh',
      email: 'john.fresh@gmail.com',
      password: 'password12345',
    };

    await createAndVerifyCustomer(graphQLClient, registerInput);

    const loginInput = {
      email: 'john.fresh@gmail.com',
      password: 'password12345',
    };

    const loginResponse = await graphQLClient.rawRequest(loginMutation, {
      input: loginInput,
    });

    const cookiesString = loginResponse.headers.get('set-cookie');
    const accessTokenHeader = cookiesString
      .split(', ')
      .find((cookie: string) => cookie.startsWith('access_token='));

    const accessToken = accessTokenHeader
      .replace('access_token=', '')
      .split(';')[0];

    const graphQLClientWithFreshToken = new GraphQLClient(httpUrl, {
      credentials: 'include',
      headers: {
        cookie: `access_token=${accessToken}`,
      },
    });

    const response: { protectedFreshTokenMethod: IJwtPayload } =
      await graphQLClientWithFreshToken.request(protectedFreshTokenMethodQuery);

    expect(response.protectedFreshTokenMethod.email).toEqual(
      'john.fresh@gmail.com'
    );
  });

  it('should deny access with a non-fresh token', async () => {
    // Use the same logic to get a valid access token as in your previous tests
    const registerInput = {
      name: 'John NotSoFresh',
      email: 'john.notsofresh@gmail.com',
      password: 'password12345',
    };

    await createAndVerifyCustomer(graphQLClient, registerInput);

    const loginInput = {
      email: 'john.notsofresh@gmail.com',
      password: 'password12345',
    };

    const loginResponse = await graphQLClient.rawRequest(loginMutation, {
      input: loginInput,
    });

    const cookiesString = loginResponse.headers.get('set-cookie');
    const accessTokenHeader = cookiesString
      .split(', ')
      .find((cookie: string) => cookie.startsWith('access_token='));

    const accessToken = accessTokenHeader
      .replace('access_token=', '')
      .split(';')[0];

    // Wait for 3 seconds to make the token non-fresh
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const graphQLClientWithNonFreshToken = new GraphQLClient(httpUrl, {
      credentials: 'include',
      headers: {
        cookie: `access_token=${accessToken}`,
      },
    });

    try {
      await graphQLClientWithNonFreshToken.request(
        protectedFreshTokenMethodQuery
      );
    } catch (error) {
      expect(error.response.errors[0].message).toEqual(
        ERROR_MESSAGES.TOKEN_IS_NOT_FRESH
      );
    }
  });

  it('should register a customer with referral code when isReferralCodeEnabled is true', async () => {
    // Get admin access token and referral code
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );
    const referralCodeDetails = await fetchAdminReferralCode(prismaService);
    const adminReferralCode = referralCodeDetails.referralCode;

    const response: SetReferralCodeEnabledStatusResponse =
      await graphQLClientWithAdminAccessToken.request(
        setReferralCodeEnabledStatusMutation,
        {
          status: true,
        }
      );

    expect(response.setReferralCodeEnabledStatus.isReferralCodeEnabled).toBe(
      true
    );

    // Now, attempt to register a new customer with a referral code
    const registerInputWithReferralCode = {
      name: 'Jane Doe',
      email: 'jane.doe@gmail.com',
      password: 'password12345',
      referralCode: adminReferralCode,
    };

    const registerResponse: RegisterResponse = await graphQLClient.request(
      registerMutation,
      {
        input: registerInputWithReferralCode,
      }
    );

    expect(registerResponse.register.email).toEqual(
      registerInputWithReferralCode.email
    );
    expect(registerResponse.register.name).toEqual(
      registerInputWithReferralCode.name
    );
    expect(registerResponse.register.referralCode).toBeDefined();

    // Attempt to register a new customer without a referral code (should fail)
    const registerInputWithoutReferralCode = {
      name: 'John Smith',
      email: 'john.smith@gmail.com',
      password: 'password67890',
    };

    try {
      await graphQLClient.request(registerMutation, {
        input: registerInputWithoutReferralCode,
      });
    } catch (error) {
      expect(error.response.errors[0].message).toBe(
        ERROR_MESSAGES.REFERRAL_CODE_REQUIRED
      );
    }
  });

  // it('should allow admin user to reset their password and still able to access protected-admin method', async () => {
  //   // Need to REDO the test with resendAdminRegistrationEmail and registerAdmin

  //   // Retrieve the existing admin user from the database
  //   const admin: Customer = await prismaService.customer.findUnique({
  //     where: { email: process.env.ADMIN_EMAIL },
  //   });

  //   // Call the forgetPassword mutation with the admin user's email
  //   const forgetPasswordResponse: { forgetPassword: boolean } =
  //     await graphQLClient.request(forgetPasswordMutation, {
  //       input: { email: admin.email },
  //     });

  //   expect(forgetPasswordResponse.forgetPassword).toBe(true);

  //   // Mock the email sending process and obtain the reset token
  //   const adminPayload: IJwtPayload = {
  //     sub: admin.customerId,
  //     email: admin.email,
  //     role: admin.customerRole,
  //   };
  //   const resetToken = jwt.sign(adminPayload, process.env.JWT_SECRET, {
  //     expiresIn: CONFIG.EMAIL_TOKEN_EXPIRATION,
  //   });

  //   // Call the resetPassword mutation with the reset token and the new password
  //   const newPassword = 'newadminpassword12345';
  //   const resetPasswordInput = {
  //     token: resetToken,
  //     newPassword: newPassword,
  //   };

  //   const resetPasswordResponse: { resetPassword: boolean } =
  //     await graphQLClient.request(resetPasswordMutation, {
  //       input: resetPasswordInput,
  //     });

  //   expect(resetPasswordResponse.resetPassword).toBe(true);

  //   // Verify that the admin user can log in with the new password
  //   const loginInput = {
  //     email: admin.email,
  //     password: newPassword,
  //   };

  //   const loginResponse = await graphQLClient.rawRequest(loginMutation, {
  //     input: loginInput,
  //   });

  //   // Get the 'set-cookie' response header containing the access token
  //   const cookiesString = loginResponse.headers.get('set-cookie');
  //   const cookies = cookiesString.split(', ');
  //   const accessTokenHeader = cookies.find((cookie: string) =>
  //     cookie.startsWith('access_token=')
  //   );

  //   if (!accessTokenHeader) {
  //     throw new Error('Access token not found in the response headers');
  //   }

  //   const accessToken = accessTokenHeader
  //     .replace('access_token=', '')
  //     .split(';')[0];

  //   const graphQLClientWithAdminAccessToken = new GraphQLClient(httpUrl, {
  //     credentials: 'include',
  //     headers: {
  //       cookie: `access_token=${accessToken}`,
  //     },
  //   });

  //   const protectedAdminMethodResponse: { protectedAdminMethod: boolean } =
  //     await graphQLClientWithAdminAccessToken.request(
  //       protectedAdminMethodQuery
  //     );

  //   expect(protectedAdminMethodResponse.protectedAdminMethod).toEqual(
  //     adminPayload
  //   );
  // });
});
