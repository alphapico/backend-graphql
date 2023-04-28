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
} from '@charonium/common';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { Customer } from '@prisma/client';

describe('Auth', () => {
  console.log('Running Auth tests');

  let jwtService: JwtService;

  beforeAll(async () => {
    await connectToDatabase();

    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '15m' },
        }),
      ],
    }).compile();

    jwtService = moduleRef.get<JwtService>(JwtService);
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
      protectedMethod
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

  it('should login successfully', async () => {
    // First, register a user for testing
    const registerInput = {
      name: 'John Doer',
      email: 'john.doer@gmail.com',
      password: 'password12345',
    };

    await graphQLClient.request(registerMutation, {
      input: registerInput,
    });

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

    await graphQLClient.request(registerMutation, {
      input: registerInput,
    });

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

    await graphQLClient.request(registerMutation, {
      input: registerInput,
    });

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

    await graphQLClient.request(registerMutation, {
      input: registerInput,
    });

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

    await graphQLClient.request(registerMutation, {
      input: registerInput,
    });

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
    const protectedMethodResponse: { protectedMethod: boolean } =
      await graphQLClientWithNewAccessToken.request(protectedMethodQuery);
    expect(protectedMethodResponse.protectedMethod).toBe(true);
  });

  it('should not refresh tokens with an expired refresh token', async () => {
    const registerInput = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };

    await graphQLClient.request(registerMutation, {
      input: registerInput,
    });

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
      { sub: registeredCustomer.customerId, email: registeredCustomer.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
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
});
