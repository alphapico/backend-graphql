import { Test, TestingModule } from '@nestjs/testing';
import { CommissionService } from './commission.service';
import { PrismaService } from '@charonium/prisma';
import {
  Charge,
  Customer,
  CustomerRole,
  CustomerStatus,
  EmailStatus,
  PaymentStatus,
  PurchaseActivity,
} from '@prisma/client';

jest.mock('graphql-fields');
import graphqlFields from 'graphql-fields';

describe('CommissionService', () => {
  let service: CommissionService;
  let mockPrismaService: MockPrismaService;

  class MockPrismaService {
    customer = {
      findUnique: jest.fn(),
    };
    commissionTier = {
      findMany: jest.fn(),
    };
    commission = {
      findMany: jest.fn(),
    };
  }

  beforeEach(async () => {
    mockPrismaService = new MockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CommissionService>(CommissionService);

    // Mock the implementation of graphqlFields for this test
    (graphqlFields as jest.Mock).mockImplementation(() => ({
      data: {
        customer: true,
        charge: true,
      },
    }));
  });

  afterEach(() => {
    // Restore the original implementation
    (graphqlFields as jest.Mock).mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateCommission', () => {
    it('should calculate the commission correctly', async () => {
      const createdAt = new Date();
      const expiresAt = new Date(createdAt);
      expiresAt.setHours(createdAt.getHours() + 1);

      const mockCharge: Charge = {
        chargeId: 1,
        customerId: 1,
        code: 'CHARGE123',
        name: 'Sample Charge',
        description: 'Sample Description',
        pricingType: 'fixed_price',
        pricing: {
          local: {
            amount: '40.00',
            currency: 'EUR',
          },
        },
        addresses: null,
        exchangeRates: null,
        localExchangeRates: null,
        hostedUrl: 'https://commerce.coinbase.com/charges/CHARGE123',
        cancelUrl: 'https://example.com/cancel',
        redirectUrl: 'https://example.com/redirect',
        feeRate: 0.01,
        expiresAt: expiresAt,
        paymentThreshold: null,
        createdAt: createdAt,
        updatedAt: new Date(),
      };

      const mockReferrerReferrerCustomer: Customer = {
        customerId: 3,
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'hashedpassword',
        emailStatus: EmailStatus.VERIFIED,
        customerStatus: CustomerStatus.ACTIVE,
        customerRole: CustomerRole.USER,
        referralCode: 'REF789',
        referralCustomerId: null, // Assuming Alice doesn't have a referrer
        tokenVersion: 1,
        createdAt: new Date(),
        updatedAt: null,
      };

      const mockReferrerCustomer: Customer & { referrer: Customer } = {
        customerId: 2,
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'hashedpassword',
        emailStatus: EmailStatus.VERIFIED,
        customerStatus: CustomerStatus.ACTIVE,
        customerRole: CustomerRole.USER,
        referralCode: 'REF456',
        referralCustomerId: 3,
        tokenVersion: 1,
        createdAt: new Date(),
        updatedAt: null,
        referrer: mockReferrerReferrerCustomer,
      };

      const mockCustomer: Customer & { referrer: Customer } = {
        customerId: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
        emailStatus: EmailStatus.VERIFIED,
        customerStatus: CustomerStatus.ACTIVE,
        customerRole: CustomerRole.USER,
        referralCode: 'REF123',
        referralCustomerId: 2,
        tokenVersion: 1,
        createdAt: createdAt,
        updatedAt: null,
        referrer: mockReferrerCustomer,
      };

      const mockPurchaseActivity: PurchaseActivity = {
        purchaseActivityId: 1,
        chargeId: 1,
        packageId: 1,
        tokenPriceId: 1,
        price: 40, // EUR 0.40
        amount: 4000, // EUR 40.00
        currency: 'EUR',
        tokenAmount: 100,
        purchaseConfirmed: true,
        paymentStatus: PaymentStatus.COMPLETED,
        createdAt: createdAt,
        updatedAt: null,
      };

      // mockPrismaService.customer.findUnique.mockResolvedValueOnce(
      //   mockReferrerCustomer
      // );
      mockPrismaService.customer.findUnique
        .mockResolvedValueOnce(mockReferrerCustomer) // First call returns Jane
        .mockResolvedValueOnce(mockReferrerReferrerCustomer) // Second call returns Alice
        .mockResolvedValueOnce(null); // Third call returns null, ending the loop

      mockPrismaService.commissionTier.findMany.mockResolvedValue([
        { tier: 1, commission: 0.1 },
        { tier: 2, commission: 0.05 },
      ]);

      const result = await service['calculateCommissions'](
        {
          ...mockCharge,
          customer: mockCustomer,
          purchaseActivity: {
            ...mockPurchaseActivity,
            // package: {
            //   packageId: 1,
            //   name: 'Sample Package',
            //   description: 'Sample Description',
            //   tokenAmount: 100,
            //   price: 5000, // USD 50
            //   currency: 'USD',
            //   isActive: true,
            //   createdAt: new Date(),
            //   updatedAt: null,
            //   deletedAt: null,
            // },
            // tokenPrice: {
            //   tokenPriceId: 1,
            //   currency: 'USD',
            //   price: 0.5,
            //   createdAt: new Date(),
            //   updatedAt: null,
            // },
          },
        },
        mockPurchaseActivity.amount,
        mockPurchaseActivity.currency
      );

      console.log({ result });

      expect(result).toEqual([
        {
          customerId: 2, // Referral customer ID
          chargeId: mockCharge.chargeId,
          tier: 1,
          commissionRate: 0.1,
          amount: mockPurchaseActivity.amount * 0.1,
          currency: mockPurchaseActivity.currency,
        },
        {
          customerId: 3, // Referrer's Referral customer ID (Alice)
          chargeId: mockCharge.chargeId,
          tier: 2, // Tier 2 for Alice since she's the referrer's referrer
          commissionRate: 0.05,
          amount: mockPurchaseActivity.amount * 0.05,
          currency: mockPurchaseActivity.currency,
        },
      ]);
    });
  });

  describe('getCommissions', () => {
    it('should fetch commissions correctly', async () => {
      const mockCommissions = [
        {
          commissionId: 1,
          customerId: 1,
          chargeId: 1,
          tier: 1,
          commissionRate: 0.1,
          amount: 1000, // 10.00 in actual currency
          currency: 'USD',
          isTransferred: false,
          createdAt: new Date(),
          updatedAt: null,
        },
        {
          commissionId: 2,
          customerId: 2,
          chargeId: 2,
          tier: 2,
          commissionRate: 0.05,
          amount: 500, // 5.00 in actual currency
          currency: 'USD',
          isTransferred: false,
          createdAt: new Date(),
          updatedAt: null,
        },
      ];

      mockPrismaService.commission.findMany.mockResolvedValue(mockCommissions);

      // Mock the info argument
      const mockInfo = {};
      const result = await service.getCommissions(mockInfo);

      expect(result.data).toEqual([
        {
          ...mockCommissions[0],
          amount: 10.0,
        },
        {
          ...mockCommissions[1],
          amount: 5.0,
        },
      ]);
      expect(result.nextPageCursor).toBeNull();
    });

    it('should handle pagination correctly', async () => {
      const mockCommissions = Array(11)
        .fill(null)
        .map((_, index) => ({
          commissionId: index + 1,
          customerId: index + 1,
          chargeId: index + 1,
          tier: 1,
          commissionRate: 0.1,
          amount: 1000, // 10.00 in actual currency
          currency: 'USD',
          isTransferred: false,
          createdAt: new Date(),
          updatedAt: null,
        }));

      mockPrismaService.commission.findMany.mockResolvedValue(mockCommissions);

      // Mock the info argument
      const mockInfo = {};
      const result = await service.getCommissions(mockInfo);

      expect(result.data.length).toEqual(10);
      expect(result.nextPageCursor).toEqual(10);
    });

    it('should handle filtering by customerId', async () => {
      const mockCommissions = [
        {
          commissionId: 1,
          amount: 1000,
          customerId: 1,
          isTransferred: false,
          // ... other fields
        },
        {
          commissionId: 2,
          amount: 2000,
          customerId: 1,
          isTransferred: false,
          // ... other fields
        },
      ];

      mockPrismaService.commission.findMany.mockResolvedValue(mockCommissions);

      const mockInfo = {};
      const result = await service.getCommissions(mockInfo, undefined, 10, 1);

      expect(result.data).toEqual([
        {
          commissionId: 1,
          amount: 10, // formatted amount
          customerId: 1,
          isTransferred: false,
          // ... other fields
        },
        {
          commissionId: 2,
          amount: 20, // formatted amount
          customerId: 1,
          isTransferred: false,
          // ... other fields
        },
      ]);
      expect(result.nextPageCursor).toBeNull(); // since there's no next page in this mock data
    });

    it('should handle different limit values', async () => {
      const mockCommissions = [
        {
          commissionId: 1,
          amount: 1000,
          customerId: 1,
          isTransferred: false,
          // ... other fields
        },
        {
          commissionId: 2,
          amount: 2000,
          customerId: 2,
          isTransferred: false,
          // ... other fields
        },
        {
          commissionId: 3,
          amount: 3000,
          customerId: 3,
          isTransferred: false,
          // ... other fields
        },
      ];

      mockPrismaService.commission.findMany.mockResolvedValue(mockCommissions);

      const mockInfo = {};
      const result = await service.getCommissions(mockInfo, undefined, 2);

      expect(result.data).toEqual([
        {
          commissionId: 1,
          amount: 10, // formatted amount
          customerId: 1,
          isTransferred: false,
          // ... other fields
        },
        {
          commissionId: 2,
          amount: 20, // formatted amount
          customerId: 2,
          isTransferred: false,
          // ... other fields
        },
      ]);
      expect(result.nextPageCursor).toEqual(2); // since there's a next page in this mock data
    });

    it('should handle pagination with the cursor', async () => {
      const mockCommissions = [
        {
          commissionId: 1,
          customerId: 1,
          chargeId: 1,
          tier: 1,
          commissionRate: 0.1,
          amount: 1000, // 10.00 in actual currency
          currency: 'USD',
          isTransferred: false,
          createdAt: new Date(),
          updatedAt: null,
        },
        {
          commissionId: 2,
          customerId: 2,
          chargeId: 2,
          tier: 2,
          commissionRate: 0.05,
          amount: 500, // 5.00 in actual currency
          currency: 'USD',
          isTransferred: false,
          createdAt: new Date(),
          updatedAt: null,
        },
        {
          commissionId: 3,
          customerId: 3,
          chargeId: 3,
          tier: 3,
          commissionRate: 0.05,
          amount: 300, // 3.00 in actual currency
          currency: 'USD',
          isTransferred: false,
          createdAt: new Date(),
          updatedAt: null,
        },
      ];

      mockPrismaService.commission.findMany.mockResolvedValue(
        mockCommissions.slice(0, 3) // Mock 3 records
      );

      const mockInfo = {};
      const result = await service.getCommissions(mockInfo, 1, 2);

      expect(result.data).toEqual([
        {
          commissionId: 1,
          customerId: 1,
          chargeId: 1,
          tier: 1,
          commissionRate: 0.1,
          amount: 10.0,
          currency: 'USD',
          isTransferred: false,
          createdAt: expect.any(Date),
          updatedAt: null,
        },
        {
          commissionId: 2,
          customerId: 2,
          chargeId: 2,
          tier: 2,
          commissionRate: 0.05,
          amount: 5.0,
          currency: 'USD',
          isTransferred: false,
          createdAt: expect.any(Date),
          updatedAt: null,
        },
      ]);
      expect(result.nextPageCursor).toEqual(2); // assuming the cursor points to the next commissionId
    });

    it('should handle the ordering of the results', async () => {
      const mockCommissions = [
        {
          commissionId: 1,
          customerId: 1,
          chargeId: 1,
          tier: 1,
          commissionRate: 0.1,
          amount: 1000, // 10.00 in actual currency
          currency: 'USD',
          isTransferred: false,
          createdAt: new Date(),
          updatedAt: null,
        },
        {
          commissionId: 2,
          customerId: 2,
          chargeId: 2,
          tier: 2,
          commissionRate: 0.05,
          amount: 500, // 5.00 in actual currency
          currency: 'USD',
          isTransferred: false,
          createdAt: new Date(),
          updatedAt: null,
        },
      ];

      mockPrismaService.commission.findMany.mockResolvedValue(mockCommissions);

      // Mock the info argument
      const mockInfo = {};
      const result = await service.getCommissions(mockInfo);

      expect(result.data).toEqual(mockCommissions);
    });

    it('should handle cases where there are no commissions to return', async () => {
      mockPrismaService.commission.findMany.mockResolvedValue([]);

      // Mock the info argument
      const mockInfo = {};
      const result = await service.getCommissions(mockInfo);

      expect(result.data).toEqual([]);
      expect(result.nextPageCursor).toBeNull();
    });
  });
});
