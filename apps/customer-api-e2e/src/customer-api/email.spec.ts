import { clearCookies, graphQLClient } from '../support/test-setup';
import { gql } from 'graphql-request';
import {
  clearDatabase,
  connectToDatabase,
  disconnectFromDatabase,
} from '../support/test-utils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@styx/common';
import { createAndVerifyCustomer } from './utils/auth-test.utils';

describe('Email Verification', () => {
  // console.log('Running Email Verification tests');

  beforeAll(async () => {
    await connectToDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    clearCookies();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
  });

  interface IVerifyEmailResponse {
    verifyEmail: {
      success: boolean;
      message: string;
    };
  }

  const verifyEmailMutation = gql`
    mutation VerifyEmail($token: String!) {
      verifyEmail(token: $token) {
        success
        message
      }
    }
  `;

  it('should verify an email with a valid token', async () => {
    // Register and obtain a valid token
    const registerInput = {
      name: 'John Doe',
      email: 'johndoe@example.com',
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
  });

  it('should not verify an email with an invalid token', async () => {
    const invalidToken = 'invalid.token';

    const response: IVerifyEmailResponse = await graphQLClient.request(
      verifyEmailMutation,
      {
        token: invalidToken,
      }
    );
    expect(response.verifyEmail.success).toBe(false);
    expect(response.verifyEmail.message).toBe(
      ERROR_MESSAGES.EMAIL_ERROR.TOKEN_INVALID
    );
  });
});
