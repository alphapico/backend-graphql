import { clearCookies, graphQLClient, httpUrl } from '../support/test-setup';
import { gql, GraphQLClient } from 'graphql-request';
import {
  clearDatabase,
  connectToDatabase,
  disconnectFromDatabase,
} from '../support/test-utils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@charonium/common';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

describe('Email Verification', () => {
  console.log('Running Email Verification tests');

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
    clearCookies();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
  });

  interface IRegisterResponse {
    register: {
      customerId: string;
      email: string;
      name: string;
      referralCode: string;
    };
  }

  interface IVerifyEmailResponse {
    verifyEmail: {
      success: boolean;
      message: string;
    };
  }

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

    const newUser: IRegisterResponse = await graphQLClient.request(
      registerMutation,
      {
        input: registerInput,
      }
    );

    // Generate a valid token using JwtService
    const token = jwtService.sign({
      sub: newUser.register.customerId,
      email: newUser.register.email,
    });

    const response: IVerifyEmailResponse = await graphQLClient.request(
      verifyEmailMutation,
      {
        token,
      }
    );

    expect(response.verifyEmail.success).toBe(true);
    expect(response.verifyEmail.message).toBe(
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
