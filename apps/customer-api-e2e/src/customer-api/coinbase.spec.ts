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
import { Test } from '@nestjs/testing';
import { CONFIG } from '@styx/common';

describe('Coinbase', () => {
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

  const createChargeMutation = gql`
    mutation CreateCharge($input: CreateChargeInput!) {
      createCharge(createChargeInput: $input)
    }
  `;

  const setOrEditTokenPriceMutation = gql`
    mutation SetOrEditTokenPrice($input: TokenPriceCreateInput!) {
      setOrEditTokenPrice(input: $input) {
        tokenPriceId
        currency
        price
        createdAt
        updatedAt
      }
    }
  `;

  // Create Token Package
  const createTokenPackageMutation = gql`
    mutation CreateTokenPackage($input: TokenPackageCreateInput!) {
      createTokenPackage(input: $input) {
        packageId
        name
        price
        tokenAmount
        isActive
      }
    }
  `;

  const purchaseTokensMutation = gql`
    mutation PurchaseTokens($input: PurchaseTokensInput!) {
      purchaseTokens(input: $input)
    }
  `;

  interface CreateChargeResponse {
    createCharge: string;
  }

  interface SetOrEditTokenPriceResponse {
    setOrEditTokenPrice: {
      tokenPriceId: number;
      currency: string;
      price: number;
      createdAt: Date;
      updatedAt: Date;
    };
  }

  interface CreateTokenPackageResponse {
    createTokenPackage: {
      packageId: number;
      name: string;
      price: number;
      tokenAmount: number;
      isActive: boolean;
    };
  }

  interface PurchaseTokensResponse {
    purchaseTokens: string;
  }

  it('should purchase tokens with TokenPrice set', async () => {
    // Admin login and get GraphQL client with admin access token
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    // Define the input for the setOrEditTokenPrice mutation
    const priceDetails = {
      currency: 'GBP',
      price: 2,
    };

    // Send the setOrEditTokenPrice mutation
    const response =
      await graphQLClientWithAdminAccessToken.request<SetOrEditTokenPriceResponse>(
        setOrEditTokenPriceMutation,
        {
          input: priceDetails,
        }
      );

    // Check that the response includes the expected data
    expect(response).toHaveProperty('setOrEditTokenPrice');
    expect(response.setOrEditTokenPrice.currency).toBe(priceDetails.currency);
    expect(response.setOrEditTokenPrice.price).toBe(priceDetails.price);

    // Register and login a user
    const user = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };
    const { graphQLClientWithAccessToken } = await registerAndLogin(
      graphQLClient,
      user
    );

    // Define the input for the purchaseTokens mutation
    const purchaseDetails = {
      redirect_url: `${global.localhostToPublicURL}/payment-success`,
      cancel_url: `${global.localhostToPublicURL}/payment-cancelled`,
      quantity: 20,
    };

    // Send the purchaseTokens mutation
    const responsePurchase =
      await graphQLClientWithAccessToken.request<PurchaseTokensResponse>(
        purchaseTokensMutation,
        {
          input: purchaseDetails,
        }
      );

    console.log({ responsePurchase });

    // Check that the response includes the expected data
    expect(responsePurchase).toHaveProperty('purchaseTokens');
    expect(typeof responsePurchase.purchaseTokens).toBe('string');
  });

  it('should purchase tokens with TokenPackage set', async () => {
    // Admin login and get GraphQL client with admin access token
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    const tokenPackageDetails = {
      name: 'Basic Package',
      price: 40,
      tokenAmount: 20,
      currency: 'USD',
      isActive: true,
    };

    const responseCreate =
      await graphQLClientWithAdminAccessToken.request<CreateTokenPackageResponse>(
        createTokenPackageMutation,
        {
          input: tokenPackageDetails,
        }
      );

    expect(responseCreate).toHaveProperty('createTokenPackage');
    expect(responseCreate.createTokenPackage.name).toBe(
      tokenPackageDetails.name
    );
    expect(responseCreate.createTokenPackage.price).toBe(
      tokenPackageDetails.price
    );
    expect(responseCreate.createTokenPackage.tokenAmount).toBe(
      tokenPackageDetails.tokenAmount
    );

    const tokenPackageId = responseCreate.createTokenPackage.packageId | 0;

    // Register and login a user
    const user = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };
    const { graphQLClientWithAccessToken } = await registerAndLogin(
      graphQLClient,
      user
    );

    // Define the input for the purchaseTokens mutation
    const purchaseDetails = {
      redirect_url: `${global.localhostToPublicURL}/payment-success`,
      cancel_url: `${global.localhostToPublicURL}/payment-cancelled`,
      packageId: tokenPackageId,
    };

    // Send the purchaseTokens mutation
    const responsePurchase =
      await graphQLClientWithAccessToken.request<PurchaseTokensResponse>(
        purchaseTokensMutation,
        {
          input: purchaseDetails,
        }
      );

    console.log({ responsePurchase });

    // Check that the response includes the expected data
    expect(responsePurchase).toHaveProperty('purchaseTokens');
    expect(typeof responsePurchase.purchaseTokens).toBe('string');
  });

  // it('should create a charge', async () => {
  //   // console.log(`publcURL: ${global.localhostToPublicURL}`);
  //   // Register and login a user
  //   const user = {
  //     name: 'John Doe',
  //     email: 'john.doe@gmail.com',
  //     password: 'password12345',
  //   };
  //   const { graphQLClientWithAccessToken } = await registerAndLogin(
  //     graphQLClient,
  //     user
  //   );

  //   // Define the input for the createCharge mutation
  //   const createChargeInput = {
  //     amount: 1,
  //     currency: 'MATIC',
  //     description: 'Test charge',
  //     redirect_url: `${global.localhostToPublicURL}/payment-success`,
  //     cancel_url: `${global.localhostToPublicURL}/payment-cancelled`,
  //   };

  //   // Send the createCharge mutation
  //   const response =
  //     await graphQLClientWithAccessToken.request<CreateChargeResponse>(
  //       createChargeMutation,
  //       {
  //         input: createChargeInput,
  //       }
  //     );

  //   // Check that the response includes the charge code
  //   expect(response).toHaveProperty('createCharge');
  //   expect(typeof response.createCharge).toBe('string');
  // });
});
