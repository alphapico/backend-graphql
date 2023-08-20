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
import { PrismaModule, PrismaService } from '@charonium/prisma';
import { CONFIG, ERROR_MESSAGES } from '@charonium/common';
import { Test } from '@nestjs/testing';

describe('ConfigModule', () => {
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

  const getTokenPriceQuery = gql`
    query GetTokenPrice {
      getTokenPrice {
        tokenPriceId
        currency
        price
        createdAt
        updatedAt
      }
    }
  `;

  interface SetOrEditTokenPriceResponse {
    setOrEditTokenPrice: {
      tokenPriceId: number;
      currency: string;
      price: number;
      createdAt: Date;
      updatedAt: Date;
    };
  }

  interface GetTokenPriceResponse {
    getTokenPrice: {
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

  interface EditTokenPackageResponse {
    editTokenPackage: {
      packageId: number;
      name: string;
      price: number;
      tokenAmount: number;
    };
  }

  interface ToggleTokenPackageStatusResponse {
    toggleTokenPackageStatus: {
      packageId: number;
      isActive: boolean;
    };
  }

  interface GetTokenPackageResponse {
    getTokenPackage: {
      packageId: number;
      name: string;
      price: number;
      tokenAmount: number;
      isActive: boolean;
    };
  }

  interface DeleteTokenPackageResponse {
    deleteTokenPackage: {
      packageId: number;
      name: string;
      price: number;
      tokenAmount: number;
      isActive: boolean;
    };
  }

  it('admin should set or edit token price', async () => {
    // Admin login and get GraphQL client with admin access token
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    // Define the input for the setOrEditTokenPrice mutation
    const priceDetails = {
      currency: 'EUR',
      price: 2,
    };

    // Send the setOrEditTokenPrice mutation
    let response =
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
    expect(typeof response.setOrEditTokenPrice.tokenPriceId).toBe('number');
    expect(response.setOrEditTokenPrice.createdAt).toBeDefined();
    expect(response.setOrEditTokenPrice.updatedAt).toBeDefined();

    // Define new priceDetails for editing the token price
    const newPriceDetails = {
      currency: 'USD',
      price: 3.0,
    };

    // Send the setOrEditTokenPrice mutation again to edit the token price
    response =
      await graphQLClientWithAdminAccessToken.request<SetOrEditTokenPriceResponse>(
        setOrEditTokenPriceMutation,
        {
          input: newPriceDetails,
        }
      );

    // Check that the response includes the updated data
    expect(response).toHaveProperty('setOrEditTokenPrice');
    expect(response.setOrEditTokenPrice.currency).toBe(
      newPriceDetails.currency
    );
    expect(response.setOrEditTokenPrice.price).toBe(newPriceDetails.price);
    expect(typeof response.setOrEditTokenPrice.tokenPriceId).toBe('number');
    expect(response.setOrEditTokenPrice.createdAt).toBeDefined();
    expect(response.setOrEditTokenPrice.updatedAt).toBeDefined();

    // Define new priceDetails for editing the token price
    const latestPriceDetails = {
      currency: 'GBP',
      price: 2.25,
    };

    // Send the setOrEditTokenPrice mutation again to edit the token price
    response =
      await graphQLClientWithAdminAccessToken.request<SetOrEditTokenPriceResponse>(
        setOrEditTokenPriceMutation,
        {
          input: latestPriceDetails,
        }
      );

    // Check that the response includes the updated data
    expect(response).toHaveProperty('setOrEditTokenPrice');
    expect(response.setOrEditTokenPrice.currency).toBe(
      latestPriceDetails.currency
    );
    expect(response.setOrEditTokenPrice.price).toBe(latestPriceDetails.price);
    expect(typeof response.setOrEditTokenPrice.tokenPriceId).toBe('number');
    expect(response.setOrEditTokenPrice.createdAt).toBeDefined();
    expect(response.setOrEditTokenPrice.updatedAt).toBeDefined();

    // Send the getTokenPrice query
    const newResponse =
      await graphQLClientWithAdminAccessToken.request<GetTokenPriceResponse>(
        getTokenPriceQuery
      );

    // Check that the response includes the expected data
    expect(newResponse).toHaveProperty('getTokenPrice');

    expect(typeof newResponse.getTokenPrice.tokenPriceId).toBe('number');
    expect(newResponse.getTokenPrice.price).toBe(latestPriceDetails.price);
    expect(newResponse.getTokenPrice.currency).toBe(
      latestPriceDetails.currency
    );
    expect(newResponse.getTokenPrice.createdAt).toBeDefined();
    expect(newResponse.getTokenPrice.updatedAt).toBeDefined();
  });

  it('should throw an error for invalid currency input', async () => {
    // Admin login and get GraphQL client with admin access token
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    // Define the input for the setOrEditTokenPrice mutation with an invalid currency
    const invalidCurrencyDetails = {
      currency: 'INVALID_CURRENCY',
      price: 2,
    };

    // Try to send the setOrEditTokenPrice mutation with the invalid currency
    try {
      await graphQLClientWithAdminAccessToken.request<SetOrEditTokenPriceResponse>(
        setOrEditTokenPriceMutation,
        {
          input: invalidCurrencyDetails,
        }
      );
    } catch (error) {
      expect(
        error.response.errors[0].extensions.originalError.message[0]
      ).toContain(ERROR_MESSAGES.VAL.IS_SUPPORTED_CURRENCY);
    }
  });

  it('should throw an error for invalid price format', async () => {
    // Admin login and get GraphQL client with admin access token
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    // Define the input for the setOrEditTokenPrice mutation with an invalid price format
    const invalidPriceDetails = {
      currency: 'EUR',
      price: 2.123, // Invalid format with more than 2 decimal places
    };

    // Try to send the setOrEditTokenPrice mutation with the invalid price format
    try {
      await graphQLClientWithAdminAccessToken.request<SetOrEditTokenPriceResponse>(
        setOrEditTokenPriceMutation,
        {
          input: invalidPriceDetails,
        }
      );
    } catch (error) {
      expect(
        error.response.errors[0].extensions.originalError.message[0]
      ).toContain(ERROR_MESSAGES.VAL.IS_CURRENCY_FORMAT);
    }

    // Define another invalid price format (string instead of number)
    const invalidPriceStringDetails = {
      currency: 'EUR',
      price: 'weird', // Invalid format as it's a string
    };

    const fieldPath = 'input.price'; // This can be changed dynamically based on the field you're testing

    // Try to send the setOrEditTokenPrice mutation with the invalid price format
    try {
      await graphQLClientWithAdminAccessToken.request<SetOrEditTokenPriceResponse>(
        setOrEditTokenPriceMutation,
        {
          input: invalidPriceStringDetails,
        }
      );
    } catch (error) {
      const expectedErrorMessage = `Variable "$input" got invalid value "${invalidPriceStringDetails.price}" at "${fieldPath}"; Float cannot represent non numeric value: "${invalidPriceStringDetails.price}"`;
      expect(error.response.errors[0].message).toEqual(expectedErrorMessage);
    }
  });

  it('normal user should fetch token price', async () => {
    // Register and login a user
    const user = {
      name: 'Jane Doe',
      email: 'jane.doe@gmail.com',
      password: 'password67890',
    };
    const { graphQLClientWithAccessToken } = await registerAndLogin(
      graphQLClient,
      user
    );

    // Send the getTokenPrice query
    const response =
      await graphQLClientWithAccessToken.request<GetTokenPriceResponse>(
        getTokenPriceQuery
      );

    // Check that the response includes the expected data
    expect(response).toHaveProperty('getTokenPrice');

    // If getTokenPrice is not null, then check its properties
    if (response.getTokenPrice) {
      expect(typeof response.getTokenPrice.tokenPriceId).toBe('number');
      expect(response.getTokenPrice.createdAt).toBeDefined();
      expect(response.getTokenPrice.updatedAt).toBeDefined();
    }
  });

  it('admin should be able to perform CRUD operations on token packages', async () => {
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

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

    const tokenPackageDetails = {
      name: 'Basic Package',
      price: 10,
      tokenAmount: 100,
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

    // Edit Token Package
    const editTokenPackageMutation = gql`
      mutation EditTokenPackage(
        $packageId: Int!
        $input: TokenPackageUpdateInput!
      ) {
        editTokenPackage(packageId: $packageId, input: $input) {
          packageId
          name
          price
          tokenAmount
        }
      }
    `;

    const updatedTokenPackageDetails = {
      name: 'Updated Package',
      price: 15,
      tokenAmount: 150,
    };

    const responseEdit =
      await graphQLClientWithAdminAccessToken.request<EditTokenPackageResponse>(
        editTokenPackageMutation,
        {
          packageId: tokenPackageId,
          input: updatedTokenPackageDetails,
        }
      );

    expect(responseEdit).toHaveProperty('editTokenPackage');
    expect(responseEdit.editTokenPackage.name).toBe(
      updatedTokenPackageDetails.name
    );
    expect(responseEdit.editTokenPackage.price).toBe(
      updatedTokenPackageDetails.price
    );
    expect(responseEdit.editTokenPackage.tokenAmount).toBe(
      updatedTokenPackageDetails.tokenAmount
    );

    // Toggle Token Package Status
    const toggleTokenPackageStatusMutation = gql`
      mutation ToggleTokenPackageStatus($packageId: Int!) {
        toggleTokenPackageStatus(packageId: $packageId) {
          packageId
          isActive
        }
      }
    `;

    const responseToggle =
      await graphQLClientWithAdminAccessToken.request<ToggleTokenPackageStatusResponse>(
        toggleTokenPackageStatusMutation,
        {
          packageId: tokenPackageId,
        }
      );

    expect(responseToggle).toHaveProperty('toggleTokenPackageStatus');
    expect(responseToggle.toggleTokenPackageStatus.isActive).toBe(false);

    // Get Token Package
    const getTokenPackageQuery = gql`
      query GetTokenPackage($packageId: Int!) {
        getTokenPackage(packageId: $packageId) {
          packageId
          name
          price
          tokenAmount
          isActive
        }
      }
    `;

    const responseGet =
      await graphQLClientWithAdminAccessToken.request<GetTokenPackageResponse>(
        getTokenPackageQuery,
        {
          packageId: tokenPackageId,
        }
      );

    expect(responseGet).toHaveProperty('getTokenPackage');
    expect(responseGet.getTokenPackage.name).toBe(
      updatedTokenPackageDetails.name
    );
    expect(responseGet.getTokenPackage.price).toBe(
      updatedTokenPackageDetails.price
    );
    expect(responseGet.getTokenPackage.tokenAmount).toBe(
      updatedTokenPackageDetails.tokenAmount
    );
    expect(responseGet.getTokenPackage.isActive).toBe(false);

    // Delete Token Package
    const deleteTokenPackageMutation = gql`
      mutation DeleteTokenPackage($packageId: Int!) {
        deleteTokenPackage(packageId: $packageId) {
          packageId
          name
          price
          tokenAmount
          isActive
        }
      }
    `;

    const responseDelete =
      await graphQLClientWithAdminAccessToken.request<DeleteTokenPackageResponse>(
        deleteTokenPackageMutation,
        {
          packageId: tokenPackageId,
        }
      );

    expect(responseDelete).toHaveProperty('deleteTokenPackage');
    expect(responseDelete.deleteTokenPackage.packageId).toBe(tokenPackageId);
  });
});
