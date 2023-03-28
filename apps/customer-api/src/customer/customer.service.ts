import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterInput } from './dto/register.input';
import * as argon2 from 'argon2';
import { Customer } from './dto/customer.dto';
import { ReferralCodeUtil } from '@charonium/common/utils/referralCode.util';

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    private referralCodeUtil: ReferralCodeUtil
  ) {}

  async register(input: RegisterInput): Promise<Customer> {
    let referralCustomerId: number | undefined;
    const hashedPassword = await argon2.hash(input.password);
    const referralCode = await this.referralCodeUtil.encodeReferralCode();

    if (input.referralCode) {
      referralCustomerId = await this.referralCodeUtil.decodeReferralCode(
        input.referralCode
      );

      if (!referralCustomerId) {
        throw new BadRequestException('Invalid referral code.');
      }
    }

    try {
      const customer = await this.prisma.customer.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          referralCustomerId,
          referralCode,
        },
      });

      // send email verification using auth service. (not implemented yet)
      // email verfication using Amazon SES. (not implemented yet)

      return customer;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists.');
      }
      throw error;
    }
  }
}
