import { clearCookies, graphQLClient } from '../support/test-setup';
import { gql } from 'graphql-request';
import {
  clearDatabase,
  connectToDatabase,
  disconnectFromDatabase,
} from '../support/test-utils';
import { createAndVerifyAdmin } from './utils/auth-test.utils';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaModule, PrismaService } from '@charonium/prisma';
import { Test } from '@nestjs/testing';
import { CONFIG, ERROR_MESSAGES } from '@charonium/common';

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
});
