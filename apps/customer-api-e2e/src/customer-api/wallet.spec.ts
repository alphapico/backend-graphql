import { clearCookies, graphQLClient } from '../support/test-setup';
import { gql } from 'graphql-request';
import {
  clearDatabase,
  connectToDatabase,
  disconnectFromDatabase,
} from '../support/test-utils';
import {
  createAndVerifyAdmin,
  registerAndLogin,
} from './utils/auth-test.utils';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaModule, PrismaService } from '@styx/prisma';
import { CONFIG, CryptoType, ERROR_MESSAGES } from '@styx/common';
import { Test } from '@nestjs/testing';

describe('WalletModule', () => {
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

  const createWalletMutation = gql`
    mutation CreateWallet($input: CreateWalletInput!) {
      createWallet(input: $input) {
        walletId
        customerId
        address
        cryptoType
        isDefault
      }
    }
  `;

  const updateWalletMutation = gql`
    mutation UpdateWallet($input: UpdateWalletInput!) {
      updateWallet(input: $input) {
        walletId
        customerId
        address
        cryptoType
        isDefault
      }
    }
  `;

  const setDefaultWalletMutation = gql`
    mutation SetDefaultWallet($input: SetDefaultWalletInput!) {
      setDefaultWallet(input: $input) {
        walletId
        customerId
        isDefault
      }
    }
  `;

  const deleteWalletMutation = gql`
    mutation DeleteWallet($input: DeleteWalletInput!) {
      deleteWallet(input: $input) {
        walletId
        address
      }
    }
  `;

  const getWalletsByCustomerIdQuery = gql`
    query GetWalletsByCustomerId($customerId: Int!) {
      getWalletsByCustomerId(customerId: $customerId) {
        walletId
        customerId
        address
        cryptoType
        isDefault
      }
    }
  `;

  const getWalletByCustomerIdAndDefaultQuery = gql`
    query GetWalletByCustomerIdAndDefault($customerId: Int!) {
      getWalletByCustomerIdAndDefault(customerId: $customerId) {
        walletId
        customerId
        address
        cryptoType
        isDefault
      }
    }
  `;

  interface WalletResponse {
    walletId: number;
    customerId: number;
    address: string;
    cryptoType: CryptoType;
    isDefault: boolean;
  }

  interface CreateWalletResponse {
    createWallet: WalletResponse;
  }

  interface UpdateWalletResponse {
    updateWallet: WalletResponse;
  }

  interface SetDefaultWalletResponse {
    setDefaultWallet: {
      walletId: number;
      customerId: number;
      isDefault: boolean;
    };
  }

  interface DeleteWalletResponse {
    deleteWallet: WalletResponse;
  }

  interface GetWalletByCustomerIdResponse {
    getWalletsByCustomerId: WalletResponse[];
  }

  interface GetWalletByCustomerIdAndDefaultResponse {
    getWalletByCustomerIdAndDefault: WalletResponse;
  }

  it('user should be able to create, update, and set default wallet', async () => {
    const user = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };
    const { graphQLClientWithAccessToken, customerId } = await registerAndLogin(
      graphQLClient,
      user
    );

    // Test createWallet
    const createWalletResponse: CreateWalletResponse =
      await graphQLClientWithAccessToken.request(createWalletMutation, {
        input: {
          customerId: customerId,
          address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          cryptoType: CryptoType.ETH,
        },
      });
    expect(createWalletResponse).toHaveProperty('createWallet');

    // Test updateWallet
    const updateWalletResponse: UpdateWalletResponse =
      await graphQLClientWithAccessToken.request(updateWalletMutation, {
        input: {
          customerId: customerId,
          walletId: createWalletResponse.createWallet.walletId,
          address: '0x5aeda56215b167893e80b4fe645ba6d5bab767de',
          cryptoType: CryptoType.ETH,
        },
      });
    expect(updateWalletResponse).toHaveProperty('updateWallet');

    // Test setDefaultWallet
    const setDefaultWalletResponse: SetDefaultWalletResponse =
      await graphQLClientWithAccessToken.request(setDefaultWalletMutation, {
        input: {
          customerId: customerId,
          walletId: createWalletResponse.createWallet.walletId,
        },
      });
    expect(setDefaultWalletResponse).toHaveProperty('setDefaultWallet');
    expect(setDefaultWalletResponse.setDefaultWallet.isDefault).toBe(true);
  });

  it('should throw an error when trying to create a wallet with an invalid ETH address', async () => {
    const user = {
      name: 'Jane Doe',
      email: 'jane.doe@gmail.com',
      password: 'password67890',
    };
    const { graphQLClientWithAccessToken, customerId } = await registerAndLogin(
      graphQLClient,
      user
    );

    // Test createWallet with invalid ETH address
    try {
      await graphQLClientWithAccessToken.request(createWalletMutation, {
        input: {
          customerId: customerId,
          address: '0x1234567890abcdef', // This is the invalid ETH address
          cryptoType: CryptoType.ETH,
        },
      });
    } catch (error) {
      expect(error.response.errors[0].message).toBe('Invalid ETH address');
      expect(error.response.errors[0].extensions.code).toBe('BAD_REQUEST');
      expect(error.response.errors[0].extensions.originalError.statusCode).toBe(
        400
      );
      expect(error.response.errors[0].extensions.originalError.message).toBe(
        'Invalid ETH address'
      );
    }
  });

  it('should throw an error when a logged-in customer tries to create a wallet using a different customerId', async () => {
    const user1 = {
      name: 'Alice Smith',
      email: 'alice.smith@gmail.com',
      password: 'alicepassword',
    };
    const user2 = {
      name: 'Bob Johnson',
      email: 'bob.johnson@gmail.com',
      password: 'bobpassword',
    };

    // Register and login as user1
    const { graphQLClientWithAccessToken: graphQLClientWithAccessToken1 } =
      await registerAndLogin(graphQLClient, user1);

    // Register and login as user2
    const { customerId: customerId2 } = await registerAndLogin(
      graphQLClient,
      user2
    );

    // User1 tries to create a wallet using user2's customerId
    try {
      await graphQLClientWithAccessToken1.request(createWalletMutation, {
        input: {
          customerId: customerId2, // Using a different customerId
          address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Valid ETH address
          cryptoType: CryptoType.ETH,
        },
      });
    } catch (error) {
      expect(error.response.errors[0].message).toBe(
        ERROR_MESSAGES.OPERATION_NOT_ALLOWED
      );
      // You can add more assertions based on the expected error details
    }
  });

  it('should allow admin to create a wallet using a different existing customerId', async () => {
    const user = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };

    // Register and login as a regular user
    const { customerId } = await registerAndLogin(graphQLClient, user);

    // Admin login and get GraphQL client with admin access token
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    // Admin tries to create a wallet using the regular user's customerId
    const createWalletResponse: CreateWalletResponse =
      await graphQLClientWithAdminAccessToken.request(createWalletMutation, {
        input: {
          customerId: customerId, // Using the regular user's customerId
          address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Valid ETH address
          cryptoType: CryptoType.ETH,
        },
      });

    expect(createWalletResponse).toHaveProperty('createWallet');
    expect(createWalletResponse.createWallet.customerId).toBe(customerId);
  });

  it('admin should be able to fetch wallets by customerId and default wallet', async () => {
    const user = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };

    // Register and login as a regular user
    const { customerId, graphQLClientWithAccessToken } = await registerAndLogin(
      graphQLClient,
      user
    );

    // Create two wallets for the user
    const wallet1 = {
      customerId: customerId,
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      cryptoType: 'ETH',
      isDefault: true,
    };

    const wallet2 = {
      customerId: customerId,
      address: '0x5aeda56215b167893e80b4fe645ba6d5bab767de',
      cryptoType: 'ETH',
      isDefault: false,
    };

    await graphQLClientWithAccessToken.request(createWalletMutation, {
      input: wallet1,
    });
    await graphQLClientWithAccessToken.request(createWalletMutation, {
      input: wallet2,
    });

    // Admin login and get GraphQL client with admin access token
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    // Admin fetches wallets by customerId
    const walletsResponse: GetWalletByCustomerIdResponse =
      await graphQLClientWithAdminAccessToken.request(
        getWalletsByCustomerIdQuery,
        {
          customerId: customerId,
        }
      );

    expect(walletsResponse).toHaveProperty('getWalletsByCustomerId');
    expect(walletsResponse.getWalletsByCustomerId.length).toBe(2);
    expect(walletsResponse.getWalletsByCustomerId[0].customerId).toBe(
      customerId
    );

    // Admin fetches default wallet by customerId
    const defaultWalletResponse: GetWalletByCustomerIdAndDefaultResponse =
      await graphQLClientWithAdminAccessToken.request(
        getWalletByCustomerIdAndDefaultQuery,
        {
          customerId: customerId,
        }
      );

    expect(defaultWalletResponse).toHaveProperty(
      'getWalletByCustomerIdAndDefault'
    );
    expect(
      defaultWalletResponse.getWalletByCustomerIdAndDefault.customerId
    ).toBe(customerId);
    expect(
      defaultWalletResponse.getWalletByCustomerIdAndDefault.isDefault
    ).toBe(true);
  });

  it('user should be able to delete a wallet', async () => {
    const user = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };
    const { graphQLClientWithAccessToken, customerId } = await registerAndLogin(
      graphQLClient,
      user
    );

    // Create two wallets for the user
    const createFirstWalletResponse: CreateWalletResponse =
      await graphQLClientWithAccessToken.request(createWalletMutation, {
        input: {
          customerId: customerId,
          address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          cryptoType: CryptoType.ETH,
        },
      });

    const createSecondWalletResponse: CreateWalletResponse =
      await graphQLClientWithAccessToken.request(createWalletMutation, {
        input: {
          customerId: customerId,
          address: '0x5aeda56215b167893e80b4fe645ba6d5bab767de',
          cryptoType: CryptoType.ETH,
        },
      });

    const firstWalletId = createFirstWalletResponse.createWallet.walletId;
    const secondWalletId = createSecondWalletResponse.createWallet.walletId;

    // Delete the first wallet using the user account
    const deleteWalletResponse: DeleteWalletResponse =
      await graphQLClientWithAccessToken.request(deleteWalletMutation, {
        input: {
          customerId: customerId,
          walletId: firstWalletId,
        },
      });

    expect(deleteWalletResponse).toHaveProperty('deleteWallet');
    expect(deleteWalletResponse.deleteWallet.walletId).toBe(firstWalletId);

    // Verify that the first wallet has been deleted but the second wallet still exists
    const getWalletsResponse: GetWalletByCustomerIdResponse =
      await graphQLClientWithAccessToken.request(getWalletsByCustomerIdQuery, {
        customerId: customerId,
      });

    expect(getWalletsResponse.getWalletsByCustomerId).not.toContainEqual(
      expect.objectContaining({ walletId: firstWalletId })
    );

    expect(getWalletsResponse.getWalletsByCustomerId).toContainEqual(
      expect.objectContaining({ walletId: secondWalletId })
    );
  });
});
