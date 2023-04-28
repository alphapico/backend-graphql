import { Injectable } from '@nestjs/common';
import { PrismaService } from '@charonium/prisma';
import { Customer } from '@prisma/client';

@Injectable()
export class ReferralCodeUtil {
  constructor(private prisma: PrismaService) {}

  async encodeReferralCode(): Promise<string> {
    let referralCode: string;
    let existingCustomer: Customer | null;

    do {
      referralCode = this.generateRandomString(8);
      existingCustomer = await this.prisma.customer.findUnique({
        where: { referralCode },
      });
    } while (existingCustomer);

    return referralCode;
  }

  async decodeReferralCode(referralCode: string): Promise<number | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { referralCode },
    });

    return customer ? customer.customerId : null;
  }

  generateRandomString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
