import { Test, TestingModule } from '@nestjs/testing';
import { CoinbaseService } from './coinbase.service';
import { PrismaService } from '@charonium/prisma';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ERROR_MESSAGES, ExtChargeResource } from '@charonium/common';
import { resources } from 'coinbase-commerce-node';
import { Payment, PaymentStatus, UnresolvedReason } from '@prisma/client';

describe('CoinbaseService', () => {
  let service: CoinbaseService;
  let mockPrismaService: MockPrismaService;

  const resourceCreatedMockData: ExtChargeResource = {
    id: 'a5c42971-7635-4f4d-92f4-54f160bc64fc',
    code: '9FZMDTBL',
    name: 'Charge Name',
    description: 'Charge Description',
    pricing_type: 'fixed_price',
    pricing: {
      local: {
        amount: '1.000000000000000000',
        currency: 'MATIC',
      },
      ethereum: {
        amount: '0.000399000',
        currency: 'ETH',
      },
      usdc: {
        amount: '0.747300',
        currency: 'USDC',
      },
      bitcoincash: {
        amount: '0.00301240',
        currency: 'BCH',
      },
      litecoin: {
        amount: '0.00808373',
        currency: 'LTC',
      },
      bitcoin: {
        amount: '0.00002508',
        currency: 'BTC',
      },
    },
    exchange_rates: {
      'ETH-USD': '1875.06',
      'BTC-USD': '29469.115',
      'LTC-USD': '91.115',
      'DOGE-USD': '0.07928',
      'BCH-USD': '246.245',
      'USDC-USD': '1.0',
      'DAI-USD': '0.99985',
      'APE-USD': '2.0085',
      'SHIB-USD': '0.000007875',
      'USDT-USD': '0.999905',
      'PMATIC-USD': '0.73145',
      'PUSDC-USD': '1.0',
      'PWETH-USD': '1874.835',
    },
    local_exchange_rates: {
      'ETH-MATIC': '2562.257447390000000000',
      'BTC-MATIC': '40269.356381525000000000',
      'LTC-MATIC': '124.508062312107000000',
      'DOGE-MATIC': '0.108335610822629000',
      'BCH-MATIC': '336.492210986608000000',
      'USDC-MATIC': '1.366493577480190000',
      'DAI-MATIC': '1.366288603443560000',
      'APE-MATIC': '2.744602350368950000',
      'SHIB-MATIC': '0.000010761136922656',
      'USDT-MATIC': '1.366363760590330000',
      'PMATIC-MATIC': '0.999521727247882000',
      'PUSDC-MATIC': '1.366493577480190000',
      'PWETH-MATIC': '2561.949986335060000000',
    },
    payment_threshold: {
      overpayment_absolute_threshold: {
        amount: '5.00',
        currency: 'USD',
      },
      overpayment_relative_threshold: '0.045',
      underpayment_absolute_threshold: {
        amount: '5.00',
        currency: 'USD',
      },
      underpayment_relative_threshold: '0.005',
    },
    hosted_url: 'https://commerce.coinbase.com/charges/9FZMDTBL"',
    cancel_url: 'https://example.com/cancel',
    redirect_url: 'https://example.com/redirect',
    fee_rate: 0.01,
    metadata: { email: 'test@example.com' },
    resource: 'charge',
    created_at: '2023-07-24T02:57:21Z',
    expires_at: '2023-07-24T03:57:21Z',
    payments: [],
    addresses: {
      ethereum: '0xee2889601e9ad7e8e56e72a937bf44bf11449659',
      usdc: '0xee2889601e9ad7e8e56e72a937bf44bf11449659',
      bitcoincash: 'qpezmfnnxj22ka4ze230u0qwrh278rxj65fuwd7s06',
      litecoin: 'MKfejJJLPhq88FxKqfx3x7zKFm316yLwCG',
      bitcoin: '3KA9AYLuX2cxzj35QPcnNphwwm3ZuoU2iK',
    },
    timeline: [
      {
        status: 'NEW',
        time: '2023-07-24T02:57:21Z',
      },
    ],
  };
  const prismaCreatedMockData = {
    code: '9FZMDTBL',
    name: 'Charge Name',
    description: 'Charge Description',
    pricingType: 'fixed_price',
    pricing: {
      local: {
        amount: '1.000000000000000000',
        currency: 'MATIC',
      },
      ethereum: {
        amount: '0.000399000',
        currency: 'ETH',
      },
      usdc: {
        amount: '0.747300',
        currency: 'USDC',
      },
      bitcoincash: {
        amount: '0.00301240',
        currency: 'BCH',
      },
      litecoin: {
        amount: '0.00808373',
        currency: 'LTC',
      },
      bitcoin: {
        amount: '0.00002508',
        currency: 'BTC',
      },
    },
    exchangeRates: {
      'ETH-USD': '1875.06',
      'BTC-USD': '29469.115',
      'LTC-USD': '91.115',
      'DOGE-USD': '0.07928',
      'BCH-USD': '246.245',
      'USDC-USD': '1.0',
      'DAI-USD': '0.99985',
      'APE-USD': '2.0085',
      'SHIB-USD': '0.000007875',
      'USDT-USD': '0.999905',
      'PMATIC-USD': '0.73145',
      'PUSDC-USD': '1.0',
      'PWETH-USD': '1874.835',
    },
    localExchangeRates: {
      'ETH-MATIC': '2562.257447390000000000',
      'BTC-MATIC': '40269.356381525000000000',
      'LTC-MATIC': '124.508062312107000000',
      'DOGE-MATIC': '0.108335610822629000',
      'BCH-MATIC': '336.492210986608000000',
      'USDC-MATIC': '1.366493577480190000',
      'DAI-MATIC': '1.366288603443560000',
      'APE-MATIC': '2.744602350368950000',
      'SHIB-MATIC': '0.000010761136922656',
      'USDT-MATIC': '1.366363760590330000',
      'PMATIC-MATIC': '0.999521727247882000',
      'PUSDC-MATIC': '1.366493577480190000',
      'PWETH-MATIC': '2561.949986335060000000',
    },
    paymentThreshold: {
      overpayment_absolute_threshold: {
        amount: '5.00',
        currency: 'USD',
      },
      overpayment_relative_threshold: '0.045',
      underpayment_absolute_threshold: {
        amount: '5.00',
        currency: 'USD',
      },
      underpayment_relative_threshold: '0.005',
    },
    hostedUrl: 'https://commerce.coinbase.com/charges/9FZMDTBL"',
    cancelUrl: 'https://example.com/cancel',
    redirectUrl: 'https://example.com/redirect',
    feeRate: 0.01,
    expiresAt: '2023-07-24T03:57:21Z',
    customerId: 1,
  };

  class MockPrismaService {
    tokenPackage = {
      findUnique: jest.fn().mockResolvedValue({
        packageId: 1,
        name: 'Gold',
        tokenAmount: 100,
        price: 5000, // means USD 50
        currency: 'USD',
        isActive: true,
      }),
    };

    tokenPrice = {
      findFirst: jest.fn().mockResolvedValue({
        tokenPriceId: 1,
        currency: 'USD',
        price: 50, // means USD 0.5
      }),
    };

    customer = {
      findUnique: jest.fn().mockResolvedValue({
        customerId: 1,
        email: 'test@example.com',
      }),
    };

    charge = {
      create: jest.fn().mockResolvedValue(prismaCreatedMockData),
    };

    purchaseActivity = {
      create: jest.fn(),
    };
  }

  beforeEach(async () => {
    mockPrismaService = new MockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoinbaseService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CoinbaseService>(CoinbaseService);
  });

  describe('preparePurchaseDetails', () => {
    it('should prepare purchase details with packageId', async () => {
      const result = await service['preparePurchaseDetails'](1);
      //   console.log(result);
      expect(result).toEqual({
        amount: 5000,
        currency: 'USD',
        description: 'Purchase of Gold',
        tokenAmount: 100,
        tokenPackage: expect.any(Object),
        tokenPrice: null,
      });
    });

    it('should prepare purchase details with quantity', async () => {
      const result = await service['preparePurchaseDetails'](undefined, 200);
      //   console.log(result);
      expect(result).toEqual({
        amount: 10000,
        currency: 'USD',
        description: 'Purchase of 200 tokens at 100.00 USD',
        tokenAmount: 200,
        tokenPackage: null,
        tokenPrice: expect.any(Object),
      });
    });

    it('should throw error when neither packageId nor quantity is provided', async () => {
      await expect(service['preparePurchaseDetails']()).rejects.toThrow(
        new BadRequestException(ERROR_MESSAGES.QUANTITY_TOKEN_NOT_PROVIDED)
      );
    });

    it('should throw error when packageId is not found', async () => {
      mockPrismaService.tokenPackage.findUnique.mockResolvedValue(null);
      await expect(service['preparePurchaseDetails'](999)).rejects.toThrow(
        new NotFoundException(ERROR_MESSAGES.TOKEN_PACKAGE_NOT_FOUND)
      );
    });

    it('should throw error when tokenPrice is not found', async () => {
      mockPrismaService.tokenPrice.findFirst.mockResolvedValue(null);
      await expect(
        service['preparePurchaseDetails'](undefined, 200)
      ).rejects.toThrow(
        new NotFoundException(ERROR_MESSAGES.TOKEN_PRICE_NOT_FOUND)
      );
    });

    it('should throw error when package is not active', async () => {
      mockPrismaService.tokenPackage.findUnique.mockResolvedValue({
        packageId: 1,
        name: 'Gold',
        tokenAmount: 100,
        price: 5000,
        currency: 'USD',
        isActive: false,
      });
      await expect(service['preparePurchaseDetails'](1)).rejects.toThrow(
        new NotFoundException(ERROR_MESSAGES.TOKEN_PACKAGE_NOT_FOUND)
      );
    });
  });

  describe('createCharge', () => {
    it('should create a charge successfully', async () => {
      // Mock the resources.Charge.create method
      const mockChargeCreate = jest.fn().mockResolvedValue({
        name: 'Test Charge',
        description: 'Test Description',
        local_price: {
          amount: '100.00',
          currency: 'USD',
        },
        pricing_type: 'fixed_price',
        metadata: {
          email: 'test@example.com',
        },
        redirect_url: 'https://redirect.url',
        cancel_url: 'https://cancel.url',
      });

      // Replace the original resources.Charge.create method with the mock
      jest
        .spyOn(resources.Charge, 'create')
        .mockImplementation(mockChargeCreate);

      // Call the createCharge method
      const result = await service.createCharge(
        10000, // USD 100
        'USD',
        'test@example.com',
        'Test Name',
        'Test Description',
        'https://redirect.url',
        'https://cancel.url'
      );

      // Assert the expected result
      expect(result).toEqual({
        name: 'Test Charge',
        description: 'Test Description',
        local_price: {
          amount: '100.00',
          currency: 'USD',
        },
        pricing_type: 'fixed_price',
        metadata: {
          email: 'test@example.com',
        },
        redirect_url: 'https://redirect.url',
        cancel_url: 'https://cancel.url',
      });

      // Assert that the mock method was called with the correct parameters
      expect(mockChargeCreate).toHaveBeenCalledWith({
        name: 'Test Name',
        description: 'Test Description',
        local_price: {
          amount: '100.00',
          currency: 'USD',
        },
        pricing_type: 'fixed_price',
        metadata: {
          email: 'test@example.com',
        },
        redirect_url: 'https://redirect.url',
        cancel_url: 'https://cancel.url',
      });
    });

    it('should throw an error if charge creation fails', async () => {
      // Mock the resources.Charge.create method to reject with an error
      jest
        .spyOn(resources.Charge, 'create')
        .mockRejectedValue(new Error('Failed to create charge'));

      // Expect the createCharge method to throw an HttpException
      await expect(
        service.createCharge(
          10000, // USD 100
          'USD',
          'test@example.com',
          'Test Name',
          'Test Description',
          'https://redirect.url',
          'https://cancel.url'
        )
      ).rejects.toThrow(
        new HttpException(
          ERROR_MESSAGES.FAILED_CREATE_CHARGE,
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('recordCharge', () => {
    it('should handle a new charge and create a record in the database', async () => {
      const result = await service['recordCharge'](resourceCreatedMockData);

      // Expectations
      expect(result).toEqual(prismaCreatedMockData);

      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });

      expect(mockPrismaService.charge.create).toHaveBeenCalledWith({
        data: expect.objectContaining(prismaCreatedMockData),
      });
    });

    it('should throw an error if customer retrieval fails', async () => {
      // Mocking the PrismaService method to throw an error
      mockPrismaService.customer.findUnique = jest
        .fn()
        .mockRejectedValue(new Error('Customer not found'));

      // Expectation
      await expect(
        service['recordCharge'](resourceCreatedMockData)
      ).rejects.toThrow(
        new InternalServerErrorException(
          ERROR_MESSAGES.FAILED_RECORDING_NEW_CHARGE
        )
      );
    });

    it('should throw an error if charge creation fails', async () => {
      // Mocking the PrismaService methods
      mockPrismaService.customer.findUnique = jest.fn().mockResolvedValue({
        customerId: 1,
        email: 'test@example.com',
      });

      // Mocking the charge creation to throw an error
      mockPrismaService.charge.create = jest
        .fn()
        .mockRejectedValue(new Error('Charge creation failed'));

      // Expectation
      await expect(
        service['recordCharge'](resourceCreatedMockData)
      ).rejects.toThrow(
        new InternalServerErrorException(
          ERROR_MESSAGES.FAILED_RECORDING_NEW_CHARGE
        )
      );
    });
  });

  describe('getCustomerByCharge', () => {
    it('should return a customer if found', async () => {
      // Mocking the PrismaService method to return a customer
      const mockCustomer = { email: 'test@example.com', customerId: 1 };
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);

      // Expectation
      const customer = await service.getCustomerByCharge(
        resourceCreatedMockData
      );
      expect(customer).toEqual(mockCustomer);
    });

    it('should throw a BadRequestException if customer not found', async () => {
      // Mocking the PrismaService method to return null (customer not found)
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      // Expectation
      await expect(
        service.getCustomerByCharge(resourceCreatedMockData)
      ).rejects.toThrow(
        new BadRequestException(ERROR_MESSAGES.CUSTOMER_NOT_FOUND)
      );
    });
  });

  describe('recordPurchaseActivity', () => {
    it('should record purchase activity successfully', async () => {
      // Mocking the PrismaService method to return the created purchase activity
      const mockPurchaseActivity = {
        chargeId: 1,
        packageId: 2,
        tokenPriceId: 3,
        tokenAmount: 100,
        amount: 20000, // USD 200
        currency: 'USD',
        purchaseConfirmed: false,
      };
      mockPrismaService.purchaseActivity.create.mockResolvedValue(
        mockPurchaseActivity
      );

      const chargeId = 1;
      const tokenPackage = {
        packageId: 2,
        name: 'Gold',
        description: 'Goldilock',
        tokenAmount: 500.0,
        price: 20000, // USD 200
        currency: 'USD',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const tokenPrice = {
        tokenPriceId: 3,
        price: 200, // USD 2
        currency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const tokenAmount = 100;
      const amount = 20000; // USD 200
      const currency = 'USD';

      // Expectation
      await service['recordPurchaseActivity'](
        chargeId,
        amount,
        currency,
        tokenPackage,
        tokenPrice,
        tokenAmount
      );

      // Verify that the PrismaService method was called with the correct arguments
      expect(mockPrismaService.purchaseActivity.create).toHaveBeenCalledWith({
        data: {
          chargeId: chargeId,
          packageId: tokenPackage.packageId,
          tokenPriceId: tokenPrice.tokenPriceId,
          tokenAmount: tokenAmount,
          amount: amount,
          currency: currency,
          purchaseConfirmed: false,
        },
      });
    });
  });

  describe('calculateTotalPaid', () => {
    it('should calculate the total paid amount correctly', () => {
      const mockPayments: Payment[] = [
        {
          paymentId: 1,
          chargeId: null,
          network: null,
          transaction: null,
          value: {
            local: { amount: '10', currency: 'USD' },
          },
          type: null,
          status: null,
          paymentStatus: PaymentStatus.UNRESOLVED,
          unresolvedReason: UnresolvedReason.UNDERPAID,
          createdAt: new Date(),
          updatedAt: null,
        },
        {
          paymentId: 2,
          chargeId: null,
          network: null,
          transaction: null,
          value: {
            local: { amount: '20', currency: 'USD' },
          },
          type: null,
          status: null,
          paymentStatus: PaymentStatus.UNRESOLVED,
          unresolvedReason: UnresolvedReason.UNDERPAID,
          createdAt: new Date(),
          updatedAt: null,
        },
      ];

      const result = service.calculateTotalPaid(mockPayments, 'USD');
      expect(result).toEqual(30);
    });

    it('should throw an error if currency does not match', () => {
      const mockPayments: Payment[] = [
        {
          paymentId: 1,
          chargeId: null,
          network: null,
          transaction: null,
          value: {
            local: { amount: '10', currency: 'USD' },
          },
          type: null,
          status: null,
          paymentStatus: PaymentStatus.UNRESOLVED,
          unresolvedReason: UnresolvedReason.UNDERPAID,
          createdAt: new Date(),
          updatedAt: null,
        },
        {
          paymentId: 2,
          chargeId: null,
          network: null,
          transaction: null,
          value: {
            local: { amount: '20', currency: 'EUR' },
          },
          type: null,
          status: null,
          paymentStatus: PaymentStatus.UNRESOLVED,
          unresolvedReason: UnresolvedReason.UNDERPAID,
          createdAt: new Date(),
          updatedAt: null,
        },
      ];

      expect(() => service.calculateTotalPaid(mockPayments, 'USD')).toThrow(
        BadRequestException
      );
    });
  });

  //   describe('purchaseTokens',()=>{
  //     it('should purchase tokens successfully with packageId', async () => {
  //       // Arrange
  //       const email = 'test@example.com';
  //       const name = 'Test User';
  //       const redirect_url = 'https://example.com/redirect';
  //       const cancel_url = 'https://example.com/cancel';
  //       const packageId = 1;
  //       const quantity = 100;

  //       // Mocking the createCharge method to return resourceCreatedMockData
  //       jest
  //         .spyOn(service, 'createCharge')
  //         .mockResolvedValue(resourceCreatedMockData);

  //       // Mocking the recordCharge method to return prismaCreatedMockData
  //       jest
  //         .spyOn(service, 'recordCharge')
  //         .mockResolvedValue(prismaCreatedMockData);

  //       // Act
  //       const result = await service.purchaseTokens(
  //         email,
  //         name,
  //         redirect_url,
  //         cancel_url,
  //         packageId,
  //         quantity
  //       );

  //       // Assert
  //       expect(result).toEqual(prismaCreatedMockData);
  //       expect(mockPrismaService.tokenPackage.findUnique).toHaveBeenCalledWith({
  //         where: { packageId },
  //       });
  //       expect(mockPrismaService.tokenPrice.findFirst).toHaveBeenCalledWith({
  //         where: { currency: 'USD' },
  //       });
  //       expect(service.createCharge).toHaveBeenCalledWith(
  //         50,
  //         'USD',
  //         email,
  //         name,
  //         'Gold',
  //         redirect_url,
  //         cancel_url
  //       );
  //       expect(service.recordCharge).toHaveBeenCalledWith(
  //         resourceCreatedMockData
  //       );
  //     });
  //   })
});
