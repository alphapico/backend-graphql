import { Body, Controller, Post, Headers } from '@nestjs/common';
import { CoinbaseService } from './coinbase.service';
import { ExtChargeResource, writeDataToFile } from '@charonium/common';
import {
  CustomerStatus,
  PaymentStatus,
  UnresolvedReason,
} from '@prisma/client';
import { EmailService } from '../../email/email.service';
import { currencyPrecision } from '@charonium/common';
import { CommissionService } from '../../commission/commission.service';
import { StatusCodes } from 'http-status-codes';
import { format } from 'date-fns';

@Controller('coinbase')
export class CoinbaseController {
  constructor(
    private readonly coinbaseService: CoinbaseService,
    private commissionService: CommissionService,
    private emailService: EmailService
  ) {}

  @Post('webhook')
  async handleWebhook(
    @Body() body: any,
    @Headers('x-cc-webhook-signature') signature: string
  ) {
    try {
      writeDataToFile(`${this.constructor.name}/rawBody.txt`, body);
      writeDataToFile(`${this.constructor.name}/signature.txt`, signature);

      // Verify the signature of the webhook
      const event = this.coinbaseService.verify(
        JSON.stringify(body),
        signature,
        process.env.COINBASE_WEBHOOK_SECRET
      );

      console.log('Received event with type:', event.type);

      writeDataToFile(`${this.constructor.name}/event.txt`, event);

      // If the event is a charge, log the payment status
      if (event.type.startsWith('charge:')) {
        const rawCharge = event.data;

        if (
          'fee_rate' in rawCharge &&
          'payment_threshold' in rawCharge &&
          'local_exchange_rates' in rawCharge &&
          'exchange_rates' in rawCharge &&
          'timeline' in rawCharge
        ) {
          const charge = rawCharge as unknown as ExtChargeResource;
          const status = charge.timeline[charge.timeline.length - 1].status;
          const context = charge.timeline[charge.timeline.length - 1].context;

          console.log(
            'Payment status:',
            charge.timeline[charge.timeline.length - 1].status
          );

          switch (status) {
            // Payment created
            case PaymentStatus.NEW:
              await this.coinbaseService.handleChargeEvent(
                charge,
                event.type,
                status
              );
              break;
            // Transaction validated by the blockchain network
            case PaymentStatus.COMPLETED: {
              await this.coinbaseService.handleChargeEvent(
                charge,
                event.type,
                status
              );
              const multiplePayments =
                await this.coinbaseService.checkMultiplePayments(charge);
              if (!multiplePayments) {
                const isPurchaseConfirmed =
                  await this.commissionService.isPurchaseConfirmed(charge.code);
                if (!isPurchaseConfirmed) {
                  // Calculate commission and Purchase ECR-20 token
                  // Set purchaseConfirmed = True
                  const chargeId =
                    await this.commissionService.calculateCommission(
                      charge.code
                    );

                  const purchaseActivity =
                    await this.coinbaseService.getPurchaseActivityByChargeCode(
                      charge.code
                    );

                  // Get the precision for the currency
                  const currency = purchaseActivity.currency;
                  const precision = currencyPrecision[currency] || 2;

                  const data = {
                    customerName: purchaseActivity.customer.name,
                    purchaseCode: purchaseActivity.purchaseCode,
                    packageName: purchaseActivity.package?.name,
                    tokenPrice: purchaseActivity.tokenPrice?.price
                      ? (purchaseActivity.tokenPrice.price / 100).toFixed(
                          precision
                        )
                      : '0.00',
                    tokenAmount: purchaseActivity.tokenAmount,
                    totalAmount: purchaseActivity.amount
                      ? (purchaseActivity.amount / 100).toFixed(precision)
                      : '0.00',
                    currency: currency,
                    dateOfPurchase: format(
                      purchaseActivity.createdAt,
                      'MMMM dd, yyyy'
                    ),
                  };

                  await this.emailService.sendPurchaseConfirmationEmail(
                    purchaseActivity.customer,
                    data
                  );

                  // Send email to referrer about the earning's commission
                  const commissions =
                    await this.commissionService.getReferrerCommissionByCharge(
                      chargeId
                    );

                  for (const commission of commissions) {
                    const referrer = commission.customer;
                    if (
                      referrer &&
                      referrer.customerStatus !== CustomerStatus.SUSPENDED
                    ) {
                      const emailData = {
                        referrerName: referrer.name,
                        refereeName: purchaseActivity.customer.name,
                        totalAmount: purchaseActivity.amount
                          ? (purchaseActivity.amount / 100).toFixed(precision)
                          : '0.00',
                        currency: currency,
                        dateOfPurchase: format(
                          purchaseActivity.createdAt,
                          'MMMM dd, yyyy'
                        ),
                        commissionAmount: commission.amount
                          ? (commission.amount / 100).toFixed(precision)
                          : '0.00',
                      };
                      await this.emailService.sendReferrerCommissionEmail(
                        referrer,
                        emailData
                      );
                    }
                  }
                }
              }
              break;
            }

            // Payment request expired after 60 minutes
            case PaymentStatus.EXPIRED:
              await this.coinbaseService.handleChargeEvent(
                charge,
                event.type,
                status
              );
              break;
            // Request cancelled -- only new undetected charges can be cancelled
            case PaymentStatus.CANCELED:
              await this.coinbaseService.handleChargeEvent(
                charge,
                event.type,
                status
              );
              break;
            // Transaction confirmed but the payment diverged from what was expected
            case PaymentStatus.UNRESOLVED:
              switch (context) {
                // Payment less than requested amount
                case UnresolvedReason.UNDERPAID: {
                  await this.coinbaseService.handleChargeEvent(
                    charge,
                    event.type,
                    status,
                    context
                  );

                  // Retrieve the customer details from the database using the charge code
                  const customer =
                    await this.coinbaseService.getCustomerByCharge(charge);

                  // Calculate the remaining amount
                  const {
                    remainingAmount,
                    amountPaid,
                    amountRequired,
                    currency,
                  } = await this.coinbaseService.calculateRemainingAmount(
                    charge
                  );

                  // Get the precision for the currency of Crypto, default wll be Fiat
                  const precision = currencyPrecision[currency] || 2;

                  // Prepare the data for the email template
                  const data = {
                    customerName: customer.name,
                    customerEmail: customer.email,
                    chargeCode: charge.code,
                    amountPaid: amountPaid.toFixed(precision),
                    requiredAmount: amountRequired.toFixed(precision),
                    remainingAmount: remainingAmount.toFixed(precision),
                    currency: currency,
                    adminEmailAddress: process.env.ADMIN_EMAIL,
                  };

                  await this.emailService.sendUnresolvedUnderpaidEmail(
                    customer,
                    data
                  );
                  await this.emailService.sendUnresolvedUnderpaidEmailToAdmin(
                    customer,
                    data
                  );

                  break;
                }
                // Payment more than requested amount
                case UnresolvedReason.OVERPAID: {
                  await this.coinbaseService.handleChargeEvent(
                    charge,
                    event.type,
                    status,
                    context
                  );

                  // Retrieve the customer details from the database using the charge code
                  const customer =
                    await this.coinbaseService.getCustomerByCharge(charge);

                  // Calculate the excess amount
                  const { excessAmount, amountPaid, amountRequired, currency } =
                    await this.coinbaseService.calculateExcessAmount(charge);

                  // Get the precision for the currency
                  const precision = currencyPrecision[currency] || 2;

                  // Prepare the data for the email template
                  const data = {
                    customerName: customer.name,
                    customerEmail: customer.email,
                    chargeCode: charge.code,
                    amountPaid: amountPaid.toFixed(precision),
                    requiredAmount: amountRequired.toFixed(precision),
                    excessAmount: excessAmount.toFixed(precision),
                    currency: currency,
                  };

                  await this.emailService.sendUnresolvedOverpaidEmailToAdmin(
                    customer,
                    data
                  );

                  break;
                }

                // Payment made after the 60 minutes has passed
                case UnresolvedReason.DELAYED: {
                  await this.coinbaseService.handleChargeEvent(
                    charge,
                    event.type,
                    status,
                    context
                  );

                  // Retrieve the customer details from the database using the charge code
                  const customer =
                    await this.coinbaseService.getCustomerByCharge(charge);

                  // Calculate the total amount paid
                  const { totalPaid, currency } =
                    await this.coinbaseService.calculatePaymentDetails(charge);

                  // Get the precision for the currency
                  const precision = currencyPrecision[currency] || 2;
                  // Prepare the data for the email template
                  const data = {
                    customerName: customer.name,
                    customerEmail: customer.email,
                    chargeCode: charge.code,
                    amountPaid: totalPaid.toFixed(precision),
                    currency: currency,
                  };

                  await this.emailService.sendUnresolvedDelayedEmailToAdmin(
                    customer,
                    data
                  );

                  break;
                }

                // More than one payment made
                case UnresolvedReason.MULTIPLE: {
                  await this.coinbaseService.handleChargeEvent(
                    charge,
                    event.type,
                    status,
                    context
                  );

                  // Retrieve the customer details from the database using the charge code
                  const customer =
                    await this.coinbaseService.getCustomerByCharge(charge);

                  // Calculate the total amount paid
                  const { totalPaid, requiredAmount, currency } =
                    await this.coinbaseService.calculatePaymentDetails(charge);

                  // Get the precision for the currency
                  const precision = currencyPrecision[currency] || 2;
                  // Prepare the data for the email template
                  const data = {
                    customerName: customer.name,
                    customerEmail: customer.email,
                    chargeCode: charge.code,
                    amountPaid: totalPaid.toFixed(precision),
                    requiredAmount: requiredAmount.toFixed(precision),
                    currency: currency,
                  };

                  await this.emailService.sendUnresolvedMultipleEmailToAdmin(
                    customer,
                    data
                  );

                  break;
                }

                // Unknown payment issue
                case UnresolvedReason.OTHER: {
                  await this.coinbaseService.handleChargeEvent(
                    charge,
                    event.type,
                    status,
                    context
                  );

                  // Retrieve the customer details from the database using the charge code
                  const customer =
                    await this.coinbaseService.getCustomerByCharge(charge);

                  // Prepare the data for the email template
                  const data = {
                    customerName: customer.name,
                    customerEmail: customer.email,
                    chargeCode: charge.code,
                  };

                  await this.emailService.sendUnresolvedOtherEmailToAdmin(
                    customer,
                    data
                  );

                  break;
                }
              }
              break;
            // Transaction detected on the blockchain but not yet validated by the network
            case PaymentStatus.PENDING:
              await this.coinbaseService.handleChargeEvent(
                charge,
                event.type,
                status
              );
              break;
            // Merchant marked the payment as resolved
            case PaymentStatus.RESOLVED:
              await this.coinbaseService.handleChargeEvent(
                charge,
                event.type,
                status
              );
              break;
          }
        } else {
          console.error('Unexpected charge object structure in webhook');
        }
      }

      // Respond with a 200 status to acknowledge receipt of the event
      return { statusCode: StatusCodes.OK };
    } catch (error) {
      console.error('Error occurred:', error.message);

      // Respond with a 400 status if there was an error
      return { statusCode: StatusCodes.BAD_REQUEST, message: error.message };
    }
  }
}
