import { clearCookies, graphQLClient } from '../support/test-setup';
import { gql } from 'graphql-request';
import {
  clearDatabase,
  connectToDatabase,
  disconnectFromDatabase,
} from '../support/test-utils';
import {
  CONFIG,
  CustomerRole,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '@styx/common';
import { INPUT } from '@styx/common';
import {
  createAndVerifyAdmin,
  registerAndLogin,
} from './utils/auth-test.utils';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaModule, PrismaService } from '@styx/prisma';
import { Test } from '@nestjs/testing';
import { Customer } from './utils/interface.utils';

describe('Customer', () => {
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

  // Define the expected response interface
  interface IRegisterResponse {
    register: {
      customerId: string;
      email: string;
      name: string;
      referralCode: string;
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

  const loginMutation = gql`
    mutation Login($input: LoginInput!) {
      login(input: $input)
    }
  `;

  const changePasswordMutation = gql`
    mutation ChangePassword($input: ChangePasswordInput!) {
      changePassword(input: $input)
    }
  `;

  const getCustomersQuery = gql`
    query GetCustomers(
      $cursor: Int
      $limit: Int
      $customerStatus: CustomerStatus
      $emailStatus: EmailStatus
      $customerRole: CustomerRole
    ) {
      getCustomers(
        cursor: $cursor
        limit: $limit
        customerStatus: $customerStatus
        emailStatus: $emailStatus
        customerRole: $customerRole
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
  `;

  const meQuery = gql`
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
  `;

  interface GetCustomersResponse {
    getCustomers: {
      data: Customer[];
      nextPageCursor: string;
    };
  }

  interface MeResponse {
    me: Customer;
  }

  interface ChangePasswordResponse {
    changePassword: boolean;
  }

  interface LoginResponse {
    login: boolean;
  }

  it('should register a new customer without referral code', async () => {
    const input = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };

    const response: IRegisterResponse = await graphQLClient.request(
      registerMutation,
      {
        input,
      }
    );

    expect(response).toHaveProperty('register');
    expect(response.register).toHaveProperty('customerId');
    expect(response.register.name).toEqual(input.name);
    expect(response.register.email).toEqual(input.email);
    expect(response.register.referralCode).toBeDefined();
  });

  it('should register a new customer with a valid referral code', async () => {
    const referrerInput = {
      name: 'Jane Smith',
      email: 'jane.smith@gmail.com',
      password: 'password12345',
    };

    const referrerResponse: IRegisterResponse = await graphQLClient.request(
      registerMutation,
      {
        input: referrerInput,
      }
    );

    const referralCode = referrerResponse.register.referralCode;

    const newUserInput = {
      name: 'Alice Brown',
      email: 'alice.brown@gmail.com',
      password: 'password12345',
      referralCode,
    };

    const newUserResponse: IRegisterResponse = await graphQLClient.request(
      registerMutation,
      {
        input: newUserInput,
      }
    );

    expect(newUserResponse).toHaveProperty('register');
    expect(newUserResponse.register).toHaveProperty('customerId');
    expect(newUserResponse.register.name).toEqual(newUserInput.name);
    expect(newUserResponse.register.email).toEqual(newUserInput.email);
    expect(newUserResponse.register.referralCode).toBeDefined();
  });

  it('should not register a new customer with an invalid referral code', async () => {
    const newUserInput = {
      name: 'Alice Brown',
      email: 'alice.brown@gmail.com',
      password: 'password12345',
      referralCode: 'INVALIDCODE',
    };

    try {
      await graphQLClient.request(registerMutation, {
        input: newUserInput,
      });
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.response.errors[0].extensions.originalError.message).toEqual(
        ERROR_MESSAGES.INVALID_REFERRAL_CODE
      );
    }
  });

  it('should not register a new customer with an email that is already in use', async () => {
    const existingCustomer = {
      name: 'Alice Brown',
      email: 'alice.brown@gmail.com',
      password: 'password12345',
    };

    // Create the existing customer
    await graphQLClient.request(registerMutation, {
      input: existingCustomer,
    });

    const newUserInput = {
      name: 'Bob Smith',
      email: 'alice.brown@gmail.com', // Same email as the existing customer
      password: 'password12345',
    };

    try {
      await graphQLClient.request(registerMutation, {
        input: newUserInput,
      });
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.response.errors[0].extensions.originalError.message).toEqual(
        ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
      );
    }
  });

  it('should not register a new customer with an invalid email', async () => {
    const input = {
      name: 'John Doe',
      email: 'john.doe&max.com',
      password: 'password12345',
    };

    try {
      await graphQLClient.request(registerMutation, {
        input,
      });
    } catch (error) {
      expect(error).toBeDefined();
      expect(
        error.response.errors[0].extensions.originalError.message[0]
      ).toEqual('email must be an email');
    }
  });

  it('should not register a new customer with a weak password', async () => {
    const input = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: '123',
    };

    try {
      await graphQLClient.request(registerMutation, {
        input,
      });
    } catch (error) {
      expect(error).toBeDefined();
      expect(
        error.response.errors[0].extensions.originalError.message[0]
      ).toEqual(
        `password must be longer than or equal to ${INPUT.MIN_PASSWORD_LENGTH} characters`
      );
    }
  });

  it('should not register a new customer with missing required fields', async () => {
    const input = {
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };

    try {
      await graphQLClient.request(registerMutation, {
        input,
      });
    } catch (error) {
      //console.log(JSON.stringify(error, null, 2));
      expect(error).toBeDefined();
      expect(error.response.errors[0].extensions.code).toEqual(
        'BAD_USER_INPUT'
      );
    }
  });

  it('should register a new customer and trim input values', async () => {
    const input = {
      name: ' John Doe ',
      email: ' john.doe@gmail.com ',
      password: 'password12345',
    };

    const response: IRegisterResponse = await graphQLClient.request(
      registerMutation,
      {
        input,
      }
    );

    expect(response).toHaveProperty('register');
    expect(response.register).toHaveProperty('customerId');
    expect(response.register.name).toEqual(input.name.trim());
    expect(response.register.email).toEqual(input.email.trim());
    expect(response.register.referralCode).toBeDefined();
  });

  it('should not register a new customer with an empty name', async () => {
    const input = {
      name: ' ',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };

    try {
      await graphQLClient.request(registerMutation, {
        input,
      });
    } catch (error) {
      expect(error).toBeDefined();
      expect(
        error.response.errors[0].extensions.originalError.message[0]
      ).toEqual(
        `name must be longer than or equal to ${INPUT.MIN_NAME_LENGTH} characters`
      );
    }
  });

  it('should not register a new customer with a whitespace-only referral code', async () => {
    const newUserInput = {
      name: 'Alice Brown',
      email: 'alice.brown@gmail.com',
      password: 'password12345',
      referralCode: '    ',
    };

    try {
      await graphQLClient.request(registerMutation, {
        input: newUserInput,
      });
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.response.errors[0].extensions.originalError.message).toEqual(
        ERROR_MESSAGES.INVALID_REFERRAL_CODE
      );
    }
  });

  it('should not register a new customer with all empty input fields', async () => {
    const input = {
      name: ' ',
      email: ' ',
      password: ' ',
    };

    try {
      await graphQLClient.request(registerMutation, {
        input,
      });
    } catch (error) {
      expect(error).toBeDefined();

      expect(error.response.errors[0].extensions.originalError.message).toEqual(
        expect.arrayContaining([
          `name must be longer than or equal to ${INPUT.MIN_NAME_LENGTH} characters`,
          'name should not be empty',
          'email must be an email',
          `password must be longer than or equal to ${INPUT.MIN_PASSWORD_LENGTH} characters`,
        ])
      );
    }
  });

  it('user should be able to fetch their own data', async () => {
    const user = {
      name: 'Jane Smith Suise',
      email: 'jane.smith.suise@gmail.com',
      password: 'password67890',
    };

    // User login and get GraphQL client with user access token
    const { graphQLClientWithAccessToken } = await registerAndLogin(
      graphQLClient,
      user
    );

    const meResponse = await graphQLClientWithAccessToken.request<MeResponse>(
      meQuery
    );

    // Assertions based on the expected response
    expect(meResponse).toHaveProperty('me');
    expect(meResponse.me.name).toBe(user.name);
    expect(meResponse.me.email).toBe(user.email);
  });

  it('admin should be able to fetch customers', async () => {
    const user = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };

    await registerAndLogin(graphQLClient, user);

    // Admin login and get GraphQL client with admin access token
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    const getCustomersResponse =
      await graphQLClientWithAdminAccessToken.request<GetCustomersResponse>(
        getCustomersQuery,
        {
          customerRole: CustomerRole.USER,
        }
      );

    // Assertions based on the expected response
    expect(getCustomersResponse).toHaveProperty('getCustomers');
    expect(getCustomersResponse.getCustomers.data).toBeInstanceOf(Array);
    // Length only 1 since we filter by customerRole
    expect(getCustomersResponse.getCustomers.data.length).toBe(1);
  });

  it('should allow a customer to change their password', async () => {
    // 1. Register a new customer
    const registerInput = {
      name: 'Jane ChangePass',
      email: 'jane.changepass@gmail.com',
      password: 'initialPassword123',
    };

    const { graphQLClientWithAccessToken } = await registerAndLogin(
      graphQLClient,
      registerInput
    );

    // 3. Use the access token to change the password
    const changePasswordInput = {
      oldPassword: 'initialPassword123',
      newPassword: 'newPassword456',
    };

    const changePasswordResponse: ChangePasswordResponse =
      await graphQLClientWithAccessToken.request(changePasswordMutation, {
        input: changePasswordInput,
      });

    expect(changePasswordResponse.changePassword).toBe(true);

    // 4. Attempt to login with the old password (this should fail)
    try {
      await graphQLClient.request(loginMutation, {
        input: {
          email: 'jane.changepass@gmail.com',
          password: 'initialPassword123',
        },
      });
    } catch (error) {
      expect(error.response.errors[0].message).toBe(
        ERROR_MESSAGES.INVALID_INPUT_PASSWORD
      );
    }

    // 5. Login with the new password (this should succeed)
    const newLoginResponse: LoginResponse = await graphQLClient.request(
      loginMutation,
      {
        input: {
          email: 'jane.changepass@gmail.com',
          password: 'newPassword456',
        },
      }
    );

    expect(newLoginResponse.login).toEqual(SUCCESS_MESSAGES.LOGIN_SUCCESS);
  });

  // it('should allow an admin to change their password', async () => {
  //   // 1. Create and verify an admin
  //   const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
  //     graphQLClient,
  //     jwtService,
  //     prismaService
  //   );

  //   // 2. Use the access token to change the password
  //   const changePasswordInput = {
  //     oldPassword: 'admin_password12345', // Assuming this is the initial password set during admin creation
  //     newPassword: 'newAdminPassword456',
  //   };

  //   const changePasswordResponse: ChangePasswordResponse =
  //     await graphQLClientWithAdminAccessToken.request(changePasswordMutation, {
  //       input: changePasswordInput,
  //     });

  //   expect(changePasswordResponse.changePassword).toBe(true);

  //   // 3. Attempt to login with the old password (this should fail)
  //   try {
  //     await graphQLClient.request(loginMutation, {
  //       input: {
  //         email: process.env.ADMIN_EMAIL, // Assuming this is the email set during admin creation
  //         password: 'admin_password12345',
  //       },
  //     });
  //   } catch (error) {
  //     expect(error.response.errors[0].message).toBe(
  //       ERROR_MESSAGES.INVALID_INPUT_PASSWORD
  //     );
  //   }

  //   // 4. Login with the new password (this should succeed)
  //   const newLoginResponse: LoginResponse = await graphQLClient.request(
  //     loginMutation,
  //     {
  //       input: {
  //         email: process.env.ADMIN_EMAIL,
  //         password: 'newAdminPassword456',
  //       },
  //     }
  //   );

  //   expect(newLoginResponse.login).toEqual(SUCCESS_MESSAGES.LOGIN_SUCCESS);
  // });
});
