import {
  ChargePayments,
  ERROR_MESSAGES,
  ExtChargeResource,
  writeDataToFile,
} from '@charonium/common';
import { PrismaService } from '@charonium/prisma';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  Charge,
  Customer,
  Payment,
  PaymentStatus,
  TokenPackage,
  TokenPrice,
  UnresolvedReason,
} from '@prisma/client';
import {
  ChargeResource,
  Client,
  Webhook,
  resources,
} from 'coinbase-commerce-node';
import { format } from 'date-fns';
// import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CoinbaseService {
  constructor(private prismaService: PrismaService) {
    Client.init(process.env.COINBASE_API_KEY);
  }

  verify(body: any, signature: string, secret: string) {
    return Webhook.verifyEventBody(body, signature, secret);
  }

  async purchaseTokens(
    email: string,
    name: string,
    redirect_url: string,
    cancel_url: string,
    packageId?: number,
    quantity?: number
  ) {
    const {
      amount,
      currency,
      description,
      tokenAmount,
      tokenPackage,
      tokenPrice,
    } = await this.preparePurchaseDetails(packageId, quantity);

    const rawCharge = await this.createCharge(
      amount,
      currency,
      email,
      name,
      description,
      redirect_url,
      cancel_url
    );

    writeDataToFile(`${this.constructor.name}/rawCharge.txt`, rawCharge);

    if (
      'fee_rate' in rawCharge &&
      'payment_threshold' in rawCharge &&
      'local_exchange_rates' in rawCharge &&
      'exchange_rates' in rawCharge
    ) {
      const charge = rawCharge as unknown as ExtChargeResource;
      const prismaCharge = await this.recordCharge(charge);

      writeDataToFile(`${this.constructor.name}/charge.txt`, charge);

      await this.recordPurchaseActivity(
        prismaCharge.chargeId,
        prismaCharge.customerId,
        amount,
        currency,
        tokenPackage,
        tokenPrice,
        tokenAmount
      );

      return prismaCharge;
    } else {
      // Handle the error case where the expected properties are not present
      const errorMsg = 'Unexpected charge object structure';
      writeDataToFile(`${this.constructor.name}/charge-error.txt`, errorMsg);

      throw new InternalServerErrorException(
        ERROR_MESSAGES.UNEXPECTED_CHARGE_STRUCTURE
      );
    }
  }

  private async preparePurchaseDetails(packageId?: number, quantity?: number) {
    let tokenPackage: TokenPackage | null = null;
    let tokenPrice: TokenPrice | null = null;
    let amount: number;
    let currency = 'USD'; // Default currency
    let description = '';
    let tokenAmount: number;

    if (packageId) {
      tokenPackage = await this.prismaService.tokenPackage.findUnique({
        where: { packageId },
      });
      if (!tokenPackage || !tokenPackage.isActive)
        throw new NotFoundException(ERROR_MESSAGES.TOKEN_PACKAGE_NOT_FOUND);

      amount = tokenPackage.price;
      currency = tokenPackage.currency;
      tokenAmount = tokenPackage.tokenAmount;
      description = `Purchase of ${tokenPackage.name}`;
    } else {
      tokenPrice = await this.prismaService.tokenPrice.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      if (!tokenPrice)
        throw new NotFoundException(ERROR_MESSAGES.TOKEN_PRICE_NOT_FOUND);

      if (!quantity)
        throw new BadRequestException(
          ERROR_MESSAGES.QUANTITY_TOKEN_NOT_PROVIDED
        );

      amount = tokenPrice.price * quantity;
      tokenAmount = quantity;
      currency = tokenPrice.currency;
      // Convert back to decimal form for display
      description = `Purchase of ${quantity} tokens at ${(amount / 100).toFixed(
        2
      )} ${currency}`;
    }

    return {
      amount,
      currency,
      description,
      tokenAmount,
      tokenPackage,
      tokenPrice,
    };
  }

  private async recordPurchaseActivity(
    chargeId: number,
    customerId: number,
    amount: number,
    currency: string,
    tokenPackage?: TokenPackage,
    tokenPrice?: TokenPrice,
    tokenAmount?: number
  ) {
    const purchaseCode = await this.generateUniquePurchaseCode();

    await this.prismaService.purchaseActivity.create({
      data: {
        chargeId: chargeId,
        customerId: customerId,
        purchaseCode: purchaseCode,
        packageId: tokenPackage?.packageId,
        tokenPriceId: tokenPrice?.tokenPriceId,
        price: tokenPackage?.price ?? tokenPrice?.price,
        tokenAmount: tokenAmount,
        amount: amount,
        currency: currency,
        purchaseConfirmed: false,
        paymentStatus: PaymentStatus.NEW,
      },
    });
  }

  async createCharge(
    amount: number,
    currency: string,
    email: string,
    name: string,
    description: string,
    redirect_url: string,
    cancel_url: string
  ) {
    try {
      // Convert the integer amount to a string with two decimal places
      const formattedAmount = (amount / 100).toFixed(2);

      return await resources.Charge.create({
        name: name,
        description: description,
        local_price: {
          amount: formattedAmount,
          currency: currency,
        },
        pricing_type: 'fixed_price',
        metadata: {
          email: email,
        },
        redirect_url: redirect_url,
        cancel_url: cancel_url,
      });
    } catch (error) {
      // Write the output to a text file
      writeDataToFile(`${this.constructor.name}/charge-error.txt`, error);

      throw new InternalServerErrorException(
        ERROR_MESSAGES.FAILED_CREATE_CHARGE
      );
    }
  }

  async getCustomerByCharge(charge: ChargeResource): Promise<Customer> {
    // Look up the customer using the email in the metadata
    const customer = await this.prismaService.customer.findUnique({
      where: { email: charge.metadata.email },
    });

    if (!customer) {
      throw new BadRequestException(ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    }

    return customer;
  }

  async recordCharge(charge: ExtChargeResource) {
    try {
      // Extract the necessary information from the charge object
      const {
        code,
        name,
        description,
        pricing_type,
        addresses,
        pricing,
        exchange_rates,
        local_exchange_rates,
        hosted_url,
        cancel_url,
        redirect_url,
        fee_rate,
        expires_at,
        payment_threshold,
      } = charge;

      // Get customer
      const customer = await this.getCustomerByCharge(charge);

      // Convert pricing to a JSON object
      const addressesJson = JSON.parse(JSON.stringify(addresses));
      const pricingJson = JSON.parse(JSON.stringify(pricing));
      const exchangeRate = JSON.parse(JSON.stringify(exchange_rates));
      const localExchangeRate = JSON.parse(
        JSON.stringify(local_exchange_rates)
      );
      const paymentThreshold = JSON.parse(JSON.stringify(payment_threshold));

      // Create a new Charge record in the database
      const newCharge = await this.prismaService.charge.create({
        data: {
          code: code,
          name: name,
          description: description,
          pricingType: pricing_type,
          addresses: addressesJson,
          pricing: pricingJson,
          exchangeRates: exchangeRate,
          localExchangeRates: localExchangeRate,
          paymentThreshold: paymentThreshold,
          hostedUrl: hosted_url,
          cancelUrl: cancel_url,
          redirectUrl: redirect_url,
          feeRate: fee_rate,
          expiresAt: expires_at,
          customerId: customer.customerId,
        },
      });
      return newCharge;
    } catch (error) {
      console.error(
        'Error occurred while recording new charge:',
        error.message
      );
      throw new InternalServerErrorException(
        ERROR_MESSAGES.FAILED_RECORDING_NEW_CHARGE
      );
    }
  }

  async handleChargeEvent(
    charge: ExtChargeResource,
    type: string,
    paymentStatus: PaymentStatus,
    unresolvedReason?: UnresolvedReason
  ) {
    try {
      // Extract the necessary information from the charge object
      const { code } = charge;

      // Look up the charge in the database using the code
      const existingCharge = (await this.getChargeByCode(
        code,
        true
      )) as ChargePayments;

      // Update PurchaseAcitivty Payment Status
      await this.updatePurchaseActivityPaymentStatus(
        existingCharge.chargeId,
        paymentStatus
      );

      // Create a set of transaction IDs from existing payments
      const existingTransactionIds = new Set(
        existingCharge.payments.map((payment) => payment.transaction)
      );

      // If payments array is empty, create a payment record with null or default values
      if (charge.payments.length === 0) {
        await this.createPaymentRecord(
          type,
          paymentStatus,
          unresolvedReason,
          existingCharge.chargeId
        );
      } else {
        // Create a new payment record for each payment in the charge
        for (const payment of charge.payments) {
          // Check if a payment with the same transaction ID already exists
          if (!existingTransactionIds.has(payment.transaction_id)) {
            await this.createPaymentRecordFromCharge(
              payment,
              type,
              paymentStatus,
              unresolvedReason,
              existingCharge.chargeId
            );
          }
        }
      }
    } catch (error) {
      console.error(
        `Error occurred while handling ${PaymentStatus[
          paymentStatus
        ].toLowerCase()} charge:`,
        error.message
      );
      throw new InternalServerErrorException(
        ERROR_MESSAGES.FAILED_HANDLING_CHARGE_EVENT
      );
    }
  }

  async updatePurchaseActivityPaymentStatus(
    chargeId: number,
    paymentStatus: PaymentStatus
  ): Promise<void> {
    await this.prismaService.purchaseActivity.update({
      where: {
        chargeId: chargeId,
      },
      data: {
        paymentStatus: paymentStatus,
      },
    });
  }

  async createPaymentRecord(
    type: string,
    paymentStatus: PaymentStatus,
    unresolvedReason: UnresolvedReason,
    chargeId: number
  ) {
    return this.prismaService.payment.create({
      data: {
        type: type,
        paymentStatus: paymentStatus,
        unresolvedReason: unresolvedReason,
        chargeId: chargeId,
      },
    });
  }

  async createPaymentRecordFromCharge(
    payment: ChargeResource['payments'][number],
    type: string,
    paymentStatus: PaymentStatus,
    unresolvedReason: UnresolvedReason,
    chargeId: number
  ) {
    return this.prismaService.payment.create({
      data: {
        network: payment.network,
        transaction: payment.transaction_id,
        value: {
          local: {
            amount: payment.value?.local?.amount,
            currency: payment.value?.local?.currency,
          },
          crypto: {
            amount: payment.value?.crypto?.amount,
            currency: payment.value?.crypto?.currency,
          },
        },
        type: type,
        status: payment.status,
        paymentStatus: paymentStatus,
        unresolvedReason: unresolvedReason,
        chargeId: chargeId,
      },
    });
  }

  async getChargeByCode(
    code: string,
    includePayments = false
  ): Promise<Charge | ChargePayments> {
    const includeOptions = includePayments ? { payments: true } : {};

    const charge = await this.prismaService.charge.findUnique({
      where: { code: code },
      include: includeOptions,
    });

    if (!charge) {
      throw new NotFoundException(ERROR_MESSAGES.CHARGE_NOT_FOUND);
    }

    return charge;
  }

  async getPaymentsByChargeId(chargeId: number): Promise<Payment[]> {
    return this.prismaService.payment.findMany({
      where: {
        chargeId: chargeId,
      },
    });
  }

  async checkMultiplePayments(charge: ChargeResource): Promise<boolean> {
    const existingCharge = (await this.getChargeByCode(charge.code)) as Charge;

    const payments = await this.prismaService.payment.findMany({
      where: {
        chargeId: existingCharge.chargeId,
        paymentStatus: PaymentStatus.COMPLETED,
      },
    });

    return payments.length > 1;
  }

  async calculatePaymentDetails(chargeResource: ChargeResource) {
    // Retrieve the charge details from the database using the code
    const charge = (await this.getChargeByCode(chargeResource.code)) as Charge;
    // Retrieve the payments from the database using the charge ID
    const payments = await this.getPaymentsByChargeId(charge.chargeId);

    // Extract the required amount
    const pricing = charge.pricing as {
      local: { amount: string; currency: string };
    };
    const requiredAmount = parseFloat(pricing.local.amount);

    const totalPaid = this.calculateTotalPaid(payments, pricing.local.currency);

    return {
      totalPaid,
      requiredAmount,
      currency: pricing.local.currency,
    };
  }

  calculateTotalPaid(payments: Payment[], currency: string): number {
    // Sum up all the payments
    let totalPaid = 0;
    for (const payment of payments) {
      const value = payment.value as {
        local: { amount: string; currency: string };
      };

      // Check if the currencies match
      if (currency !== value.local.currency) {
        throw new BadRequestException(ERROR_MESSAGES.CURRENCY_MISMATCH);
      }

      totalPaid += parseFloat(value.local.amount);
    }
    return totalPaid;
  }

  async calculateRemainingAmount(chargeResource: ChargeResource) {
    const { totalPaid, requiredAmount, currency } =
      await this.calculatePaymentDetails(chargeResource);

    // Calculate the remaining amount
    const remainingAmount = requiredAmount - totalPaid;

    return {
      remainingAmount,
      amountPaid: totalPaid,
      amountRequired: requiredAmount,
      currency: currency,
    };
  }

  async calculateExcessAmount(chargeResource: ChargeResource) {
    const { totalPaid, requiredAmount, currency } =
      await this.calculatePaymentDetails(chargeResource);

    // Calculate the excess amount
    const excessAmount = totalPaid - requiredAmount;

    return {
      excessAmount,
      amountPaid: totalPaid,
      amountRequired: requiredAmount,
      currency: currency,
    };
  }

  async generateUniquePurchaseCode(): Promise<string> {
    const datePart = this.getDatePart();
    let randomPart: string;
    let fullCode: string;

    do {
      randomPart = this.generateRandomString(5);
      fullCode = `${datePart}-${randomPart}`;
    } while (await this.codeExistsInDatabase(fullCode));

    return fullCode;
  }

  getDatePart(): string {
    return format(new Date(), 'yyMMMdd').toUpperCase();
  }

  async codeExistsInDatabase(code: string): Promise<boolean> {
    const existingCode = await this.prismaService.purchaseActivity.findUnique({
      where: { purchaseCode: code },
    });
    return !!existingCode;
  }

  generateRandomString(length: number): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }

  async getPurchaseActivityByChargeCode(chargeCode: string) {
    const charge = await this.prismaService.charge.findUnique({
      where: { code: chargeCode },
      include: {
        purchaseActivity: {
          include: {
            customer: true,
            package: true,
            tokenPrice: true,
          },
        },
      },
    });

    if (!charge.purchaseActivity) {
      throw new NotFoundException(
        ERROR_MESSAGES.PURCHASE_ACTIVITY_BY_CHARGE_NOT_FOUND
      );
    }

    return charge.purchaseActivity;
  }
}
