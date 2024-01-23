import { clearCookies, graphQLClient } from '../support/test-setup';
import { gql } from 'graphql-request';
import {
  clearDatabase,
  connectToDatabase,
  disconnectFromDatabase,
} from '../support/test-utils';
import { CONFIG, ERROR_MESSAGES } from '@charonium/common';

describe('Spamming Prevention Tests', () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    // Clear cookies before running the test
    clearCookies();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
  });

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

  const resendEmailVerificationMutation = gql`
    mutation ResendEmailVerification($input: EmailInput!) {
      resendEmailVerification(input: $input)
    }
  `;

  //   const resendAdminRegistrationEmailMutation = gql`
  //     mutation ResendAdminRegistrationEmail {
  //       resendAdminRegistrationEmail
  //     }
  //   `;
  it('should prevent spamming on resendEmailVerification', async () => {
    // Register a new user
    const input = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };

    await graphQLClient.request(registerMutation, { input });

    // Call resendEmailVerification multiple times to simulate spamming
    const emailInput = { email: input.email };

    const maxAllowedAttempts = CONFIG.EMAIL_RESEND_MAX_ATTEMPTS || 3;
    let attempts = 0;
    let errorThrown = false;

    while (attempts < maxAllowedAttempts + 1) {
      try {
        await graphQLClient.request(resendEmailVerificationMutation, {
          input: emailInput,
        });
        attempts += 1;
      } catch (error) {
        errorThrown = true;
        expect(error.response.errors[0].message).toBe(
          ERROR_MESSAGES.TOO_MANY_ATTEMPTS
        );
        break;
      }
    }

    expect(errorThrown).toBe(true);
  });

  //   it('should prevent spamming on resendAdminRegistrationEmail', async () => {
  //     // assume admin user exists, since we use process.env.ADMIN_EMAIL
  //     // Call resendAdminRegistrationEmail multiple times to simulate spamming
  //     const maxAllowedAttempts = CONFIG.EMAIL_RESEND_MAX_ATTEMPTS || 3;
  //     let attempts = 0;
  //     let errorThrown = false;

  //     while (attempts < maxAllowedAttempts + 1) {
  //       try {
  //         await graphQLClient.request(resendAdminRegistrationEmailMutation);
  //         attempts += 1;
  //       } catch (error) {
  //         errorThrown = true;
  //         expect(error.response.errors[0].message).toBe(
  //           ERROR_MESSAGES.TOO_MANY_ATTEMPTS
  //         );
  //         break;
  //       }
  //     }

  //     expect(errorThrown).toBe(true);
  //   });
});
