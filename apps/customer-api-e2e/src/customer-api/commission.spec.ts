import { clearCookies, graphQLClient } from '../support/test-setup';
import { gql } from 'graphql-request';
import {
  clearDatabase,
  connectToDatabase,
  disconnectFromDatabase,
} from '../support/test-utils';
import {
  createAndVerifyAdmin,
  createAndVerifyCustomer,
  registerAndLogin,
} from './utils/auth-test.utils';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaModule, PrismaService } from '@charonium/prisma';
import { Test } from '@nestjs/testing';
import { CONFIG, ERROR_MESSAGES } from '@charonium/common';
import { Commission } from './utils/interface.utils';

describe('CommissionTierModule', () => {
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
    clearCookies();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
  });

  const createCommissionTierMutation = gql`
    mutation CreateCommissionTier($input: CreateCommissionTierInput!) {
      createCommissionTier(input: $input) {
        commissionTierId
        tier
        commissionRate
        createdAt
        updatedAt
      }
    }
  `;

  const updateCommissionTierMutation = gql`
    mutation UpdateCommissionTier($input: UpdateCommissionTierInput!) {
      updateCommissionTier(input: $input) {
        commissionTierId
        tier
        commissionRate
        createdAt
        updatedAt
      }
    }
  `;

  const getAllCommissionRatesQuery = gql`
    query GetAllCommissionRates {
      getAllCommissionRates {
        tier
        commissionRate
      }
    }
  `;

  const deleteCommissionTierMutation = gql`
    mutation DeleteCommissionTier($tier: Int!) {
      deleteCommissionTier(tier: $tier) {
        commissionTierId
        tier
        commissionRate
        createdAt
        updatedAt
      }
    }
  `;

  const GET_ALL_REFERRERS_QUERY = gql`
    query GetAllReferrers($referralCustomerId: Int, $tier: Int!) {
      getAllReferrers(referralCustomerId: $referralCustomerId, tier: $tier) {
        customerId
        name
        customerStatus
        referralCustomerId
        tier
      }
    }
  `;

  interface CreateCommissionTierResponse {
    createCommissionTier: {
      commissionTierId: number;
      tier: number;
      commissionRate: number;
      createdAt: Date;
      updatedAt: Date | null;
    };
  }

  interface UpdateCommissionTierResponse {
    updateCommissionTier: {
      commissionTierId: number;
      tier: number;
      commissionRate: number;
      createdAt: Date;
      updatedAt: Date | null;
    };
  }

  interface GetAllCommissionRatesResponse {
    getAllCommissionRates: {
      tier: number;
      commissionRate: number;
    }[];
  }

  interface DeleteCommissionTierResponse {
    deleteCommissionTier: {
      commissionTierId: number;
      tier: number;
      commissionRate: number;
      createdAt: Date;
      updatedAt: Date | null;
    };
  }

  interface ReferrerResponse {
    customerId: number;
    customerStatus: string; // Adjust the type if necessary
    referralCustomerId: number;
    tier: number;
  }

  interface GetAllReferrersResponse {
    getAllReferrers: ReferrerResponse[];
  }

  interface CalculateCommissionResponse {
    calculateCommission: number;
  }

  interface CommissionResult {
    data: Commission[];
    nextPageCursor?: number;
  }

  interface CommissionResultResponse {
    getCommissions: CommissionResult;
  }

  it('admin should be able to perform CRUD operations on commission tiers', async () => {
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    const tiersToCreate = [
      { tier: 1, commissionRate: 0.1 },
      { tier: 2, commissionRate: 0.15 },
      { tier: 3, commissionRate: 0.2 },
    ];

    for (const commissionTierDetails of tiersToCreate) {
      // Create Commission Tier
      const responseCreate =
        await graphQLClientWithAdminAccessToken.request<CreateCommissionTierResponse>(
          createCommissionTierMutation,
          {
            input: commissionTierDetails,
          }
        );

      expect(responseCreate).toHaveProperty('createCommissionTier');
      expect(responseCreate.createCommissionTier.tier).toBe(
        commissionTierDetails.tier
      );
      expect(responseCreate.createCommissionTier.commissionRate).toBeCloseTo(
        commissionTierDetails.commissionRate
      );

      // Update Commission Tier (for demonstration purposes, let's just increase the commissionRate by 0.05)
      const updatedCommissionRate = commissionTierDetails.commissionRate + 0.05;
      const updatedCommissionTierDetails = {
        tier: commissionTierDetails.tier,
        commissionRate: updatedCommissionRate,
      };

      const responseUpdate =
        await graphQLClientWithAdminAccessToken.request<UpdateCommissionTierResponse>(
          updateCommissionTierMutation,
          {
            input: updatedCommissionTierDetails,
          }
        );

      expect(responseUpdate).toHaveProperty('updateCommissionTier');
      expect(responseUpdate.updateCommissionTier.commissionRate).toBeCloseTo(
        updatedCommissionRate
      );
    }

    // Get All Commission Rates
    const responseGetAll =
      await graphQLClientWithAdminAccessToken.request<GetAllCommissionRatesResponse>(
        getAllCommissionRatesQuery
      );

    expect(responseGetAll).toHaveProperty('getAllCommissionRates');
    for (const commissionTierDetails of tiersToCreate) {
      const updatedRate = commissionTierDetails.commissionRate + 0.05;
      const matchingRate = responseGetAll.getAllCommissionRates.find(
        (rate) => rate.tier === commissionTierDetails.tier
      );
      expect(matchingRate).toBeDefined();
      expect(matchingRate.commissionRate).toBeCloseTo(updatedRate, 2); // 2 decimal places
    }

    // Delete Commission Tiers
    for (const commissionTierDetails of tiersToCreate) {
      const responseDelete =
        await graphQLClientWithAdminAccessToken.request<DeleteCommissionTierResponse>(
          deleteCommissionTierMutation,
          {
            tier: commissionTierDetails.tier,
          }
        );

      expect(responseDelete).toHaveProperty('deleteCommissionTier');
      expect(responseDelete.deleteCommissionTier.tier).toBe(
        commissionTierDetails.tier
      );
    }
  });

  it('should throw an error if commission tier already exists', async () => {
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    // Create Commission Tier
    const commissionTierDetails = {
      tier: 1,
      commissionRate: 0.1,
    };

    // First creation should be successful
    const responseCreate =
      await graphQLClientWithAdminAccessToken.request<CreateCommissionTierResponse>(
        createCommissionTierMutation,
        {
          input: commissionTierDetails,
        }
      );

    expect(responseCreate).toHaveProperty('createCommissionTier');
    expect(responseCreate.createCommissionTier.tier).toBe(
      commissionTierDetails.tier
    );
    expect(responseCreate.createCommissionTier.commissionRate).toBeCloseTo(
      commissionTierDetails.commissionRate
    );

    // Try to create the same commission tier again
    let error;
    try {
      await graphQLClientWithAdminAccessToken.request<CreateCommissionTierResponse>(
        createCommissionTierMutation,
        {
          input: commissionTierDetails,
        }
      );
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.response.errors[0].message).toBe(
      ERROR_MESSAGES.COMMISSION_TIER_ALREADY_EXISTS
    );
  });

  it('should throw an error if trying to delete a non-existent commission tier', async () => {
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    // Try to delete a commission tier that doesn't exist
    const nonExistentTier = 999; // Assuming this tier doesn't exist in the database

    let error;
    try {
      await graphQLClientWithAdminAccessToken.request<DeleteCommissionTierResponse>(
        deleteCommissionTierMutation,
        {
          tier: nonExistentTier,
        }
      );
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.response.errors[0].message).toBe(
      ERROR_MESSAGES.COMMISSION_TIER_NOT_FOUND
    );
  });

  it('should retrieve all referrers for a given customer', async () => {
    // Register and login as an admin
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    // Create User A
    const userAInput = {
      name: 'User A',
      email: 'userA@gmail.com',
      password: 'password12345',
    };
    const { customer: userA } = await createAndVerifyCustomer(
      graphQLClient,
      userAInput
    );

    // Create User B using User A's referral code
    const userBInput = {
      name: 'User B',
      email: 'userB@gmail.com',
      password: 'password12345',
      referralCode: userA.register.referralCode,
    };
    const { customer: userB } = await createAndVerifyCustomer(
      graphQLClient,
      userBInput
    );

    console.log({ userB });

    // Create User C using User B's referral code
    const userCInput = {
      name: 'User C',
      email: 'userC@gmail.com',
      password: 'password12345',
      referralCode: userB.register.referralCode,
    };
    const { customer: userC } = await createAndVerifyCustomer(
      graphQLClient,
      userCInput
    );

    console.log({ userC });

    // Query for all referrers of User C
    const responseForUserC: GetAllReferrersResponse =
      await graphQLClientWithAdminAccessToken.request(GET_ALL_REFERRERS_QUERY, {
        referralCustomerId: userC.register.referralCustomerId,
        tier: 2,
      });

    console.table(responseForUserC.getAllReferrers);

    // Verify the response for User C
    // Verify the response for User C
    expect(responseForUserC.getAllReferrers).toHaveLength(2);
    expect(responseForUserC.getAllReferrers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          customerId: userB.register.customerId,
          customerStatus: expect.any(String),
          referralCustomerId: userA.register.customerId, // User B was referred by User A
          tier: 1,
        }),
        expect.objectContaining({
          customerId: userA.register.customerId,
          customerStatus: expect.any(String),
          referralCustomerId: null, // User A was not referred by anyone
          tier: 2,
        }),
      ])
    );
  });

  it('should return an empty list for a user with no referrers', async () => {
    // Register and login as an admin
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    // Create User D without any referral code
    const userDInput = {
      name: 'User D',
      email: 'userD@gmail.com',
      password: 'password12345',
    };
    const { customer: userD } = await createAndVerifyCustomer(
      graphQLClient,
      userDInput
    );

    // Query for all referrers of User D
    const responseForUserD: GetAllReferrersResponse =
      await graphQLClientWithAdminAccessToken.request(GET_ALL_REFERRERS_QUERY, {
        referralCustomerId: userD.register.referralCustomerId,
        tier: 1,
      });

    // console.log(responseForUserD.getAllReferrers);

    // Verify the response for User D
    expect(responseForUserD.getAllReferrers).toHaveLength(0);
  });

  it('should return User A as the referrer for both User B and User C', async () => {
    // Register and login as an admin
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    // Create User A
    const userAInput = {
      name: 'User A',
      email: 'userA@gmail.com',
      password: 'password12345',
    };
    const { customer: userA } = await createAndVerifyCustomer(
      graphQLClient,
      userAInput
    );

    // Create User B using User A's referral code
    const userBInput = {
      name: 'User B',
      email: 'userB@gmail.com',
      password: 'password12345',
      referralCode: userA.register.referralCode,
    };
    const { customer: userB } = await createAndVerifyCustomer(
      graphQLClient,
      userBInput
    );

    // Create User C also using User A's referral code
    const userCInput = {
      name: 'User C',
      email: 'userC@gmail.com',
      password: 'password12345',
      referralCode: userA.register.referralCode,
    };
    const { customer: userC } = await createAndVerifyCustomer(
      graphQLClient,
      userCInput
    );

    // Query for all referrers of User B
    const responseForUserB: GetAllReferrersResponse =
      await graphQLClientWithAdminAccessToken.request(GET_ALL_REFERRERS_QUERY, {
        referralCustomerId: userB.register.referralCustomerId,
        tier: 1,
      });

    // Verify the response for User B
    expect(responseForUserB.getAllReferrers).toHaveLength(1);
    expect(responseForUserB.getAllReferrers[0].customerId).toEqual(
      userA.register.customerId
    );
    expect(responseForUserB.getAllReferrers[0].referralCustomerId).toBeNull();

    // Query for all referrers of User C
    const responseForUserC: GetAllReferrersResponse =
      await graphQLClientWithAdminAccessToken.request(GET_ALL_REFERRERS_QUERY, {
        referralCustomerId: userC.register.referralCustomerId,
        tier: 1,
      });

    // Verify the response for User C
    expect(responseForUserC.getAllReferrers).toHaveLength(1);
    expect(responseForUserC.getAllReferrers[0].customerId).toEqual(
      userA.register.customerId
    );
    expect(responseForUserC.getAllReferrers[0].referralCustomerId).toBeNull();
  });

  it('should calculate commission for referrers', async () => {
    const tokenAmount = 20;
    const pricePerUnit = 1.25;
    const totalAmount = tokenAmount * pricePerUnit;
    const tiersToCreate = [
      { tier: 3, commissionRate: 0.2 },
      { tier: 2, commissionRate: 0.15 },
      { tier: 1, commissionRate: 0.1 },
    ];
    const usersData = [
      { name: 'User A', email: 'userA@gmail.com' },
      { name: 'User B', email: 'userB@gmail.com' },
      { name: 'User C', email: 'userC@gmail.com' },
      { name: 'User D', email: 'userD@gmail.com' },
    ];
    const users = [];
    let referralCode = null;

    // Step 1: Admin login
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    // Step 2: Admin create TokenPrice (price per unit)
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

    interface SetOrEditTokenPriceResponse {
      setOrEditTokenPrice: {
        tokenPriceId: number;
        currency: string;
        price: number;
        createdAt: Date;
        updatedAt: Date;
      };
    }

    const priceDetails = {
      currency: 'EUR',
      price: 1.25,
    };

    const responseTokenPrice =
      await graphQLClientWithAdminAccessToken.request<SetOrEditTokenPriceResponse>(
        setOrEditTokenPriceMutation,
        {
          input: priceDetails,
        }
      );
    const tokenPriceId = responseTokenPrice.setOrEditTokenPrice.tokenPriceId;

    // Step 3: Admin create CommissionTier
    const createCommissionTierMutation = gql`
      mutation CreateCommissionTier($input: CreateCommissionTierInput!) {
        createCommissionTier(input: $input) {
          commissionTierId
          tier
          commissionRate
          createdAt
          updatedAt
        }
      }
    `;

    for (const commissionTierDetails of tiersToCreate) {
      await graphQLClientWithAdminAccessToken.request(
        createCommissionTierMutation,
        {
          input: commissionTierDetails,
        }
      );
    }

    // Step 4: User Creation
    for (const userData of usersData) {
      const input = {
        name: userData.name,
        email: userData.email,
        password: 'password12345',
        ...(referralCode && { referralCode }),
      };

      const { customer } = await createAndVerifyCustomer(graphQLClient, input);
      users.push(customer);
      referralCode = customer.register.referralCode;
    }

    // Step 8: User D make a dummy purchase of the token
    const chargeTemplate = {
      code: 'VK4VB4WD',
      name: users[3].register.name,
      description: 'Purchase of 20 tokens at 25.00 EUR',
      pricing_type: 'fixed_price',
      addresses: {
        ethereum: '0xba0c67ae313637f2c8401605d20066db8f0d7736',
        bitcoin: '3Gcj45tsCV6a2jZ8zZ5Mz4zVhQj1zUw8R4',
      },
      pricing: {
        local: {
          amount: totalAmount.toFixed(2).toString(),
          currency: 'EUR',
        },
      },
      fee_rate: 0.01,
      pricing_model: 'fixed_price',
      hosted_url: 'https://commerce.coinbase.com/charges/VK4VB4WD',
      redirect_url: 'https://example.com/redirect',
      cancel_url: 'https://example.com/cancel',
      expires_at: new Date(Date.now() + 60 * 60 * 1000), // Charge expires in 1 hour
    };

    const newCharge = await prismaService.charge.create({
      data: {
        code: chargeTemplate.code,
        name: chargeTemplate.name,
        description: chargeTemplate.description,
        pricingType: chargeTemplate.pricing_type,
        addresses: JSON.parse(JSON.stringify(chargeTemplate.addresses)),
        pricing: JSON.parse(JSON.stringify(chargeTemplate.pricing)),
        hostedUrl: chargeTemplate.hosted_url,
        cancelUrl: chargeTemplate.cancel_url,
        redirectUrl: chargeTemplate.redirect_url,
        feeRate: chargeTemplate.fee_rate,
        expiresAt: chargeTemplate.expires_at,
        customerId: users[3].register.customerId,
      },
    });

    await prismaService.purchaseActivity.create({
      data: {
        purchaseCode: '23SEP24-ABC123', // Replace with an appropriate purchase code
        chargeId: newCharge.chargeId,
        customerId: users[3].register.customerId,
        tokenPriceId: tokenPriceId,
        price: pricePerUnit * 100,
        tokenAmount: tokenAmount,
        amount: totalAmount * 100,
        currency: chargeTemplate.pricing.local.currency,
        purchaseConfirmed: true, // Assuming the purchase is confirmed
        paymentStatus: 'COMPLETED', // payment status COMPLETED
      },
    });

    // Step 9: Admin Calculate commission of the referrers
    const calculateCommissionMutation = gql`
      mutation CalculateCommission($chargeCode: String!) {
        calculateCommission(chargeCode: $chargeCode)
      }
    `;

    const responseCalculateCommission: CalculateCommissionResponse =
      await graphQLClientWithAdminAccessToken.request(
        calculateCommissionMutation,
        {
          chargeCode: chargeTemplate.code,
        }
      );

    expect(responseCalculateCommission.calculateCommission).toBeGreaterThan(0);

    // Step 10: Validate commission calculation
    const expectedCommissions = tiersToCreate.map((tier) => ({
      tier: tier.tier,
      commission: totalAmount * tier.commissionRate,
    }));

    const getCommissionsQuery = gql`
      query GetCommissions($customerId: Int!) {
        getCommissions(customerId: $customerId) {
          data {
            commissionId
            customerId
            tier
            commissionRate
            amount
            currency
            isTransferred
            createdAt
            updatedAt
          }
        }
      }
    `;

    // Exclude User D
    for (let i = 0; i < users.length - 1; i++) {
      const responseCommission: CommissionResultResponse =
        await graphQLClientWithAdminAccessToken.request(getCommissionsQuery, {
          customerId: users[i].register.customerId,
        });
      const userCommission = responseCommission.getCommissions.data[0].amount;
      expect(userCommission).toBe(expectedCommissions[i].commission);
    }
  });

  // it('should retrieve the deep referral chain for the last user', async () => {
  //   // Register and login as an admin
  //   const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
  //     graphQLClient,
  //     jwtService,
  //     prismaService
  //   );

  //   const userChars = 'ABCDEFGHIJK';
  //   const tierMaxValue = userChars.length - 1;

  //   // Create a list of user inputs for the deep referral chain
  //   const users = userChars.split('').map((letter, index) => ({
  //     name: `User ${letter}`,
  //     email: `user${letter}@gmail.com`,
  //     password: 'password12345',
  //     referralCode:
  //       index === 0
  //         ? null
  //         : `user${String.fromCharCode(65 + index - 1)}_referralCode`, // Use the previous user's referral code
  //   }));

  //   // Register each user and store their details
  //   const registeredUsers = [];
  //   for (let i = 0; i < users.length; i++) {
  //     const userInput = users[i];
  //     const { customer } = await createAndVerifyCustomer(
  //       graphQLClient,
  //       userInput
  //     );
  //     registeredUsers.push(customer);

  //     // Update the next user's referralCode with the current user's referralCode
  //     if (i + 1 < users.length) {
  //       users[i + 1].referralCode = customer.register.referralCode;
  //     }
  //   }

  //   // If you want to get until certain tier only, you can use this tierShift
  //   // Or else just set tierShift = 0
  //   const tierShift = 2;

  //   // Query for all referrers of the last user (User K)
  //   const responseForLastUser: GetAllReferrersResponse =
  //     await graphQLClientWithAdminAccessToken.request(GET_ALL_REFERRERS_QUERY, {
  //       referralCustomerId:
  //         registeredUsers[registeredUsers.length - 1].register
  //           .referralCustomerId,
  //       tier: tierMaxValue - tierShift,
  //     });

  //   console.table(responseForLastUser.getAllReferrers);

  //   // Verify the response for the last user
  //   expect(responseForLastUser.getAllReferrers).toHaveLength(
  //     registeredUsers.length - 1 - tierShift
  //   ); // Excluding the last user
  //   for (let i = 0; i < registeredUsers.length - 1 - tierShift; i++) {
  //     expect(responseForLastUser.getAllReferrers[i]).toEqual(
  //       expect.objectContaining({
  //         customerId:
  //           registeredUsers[registeredUsers.length - 2 - i].register.customerId, // Start from the second last user
  //         customerStatus: expect.any(String),
  //         referralCustomerId:
  //           i === registeredUsers.length - 2
  //             ? null
  //             : registeredUsers[registeredUsers.length - 3 - i].register
  //                 .customerId, // The user who referred the current user
  //         tier: i + 1, // Expecting the tier to increment with each iteration
  //       })
  //     );
  //   }
  // });
});
