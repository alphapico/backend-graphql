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
// import { validate } from 'class-validator';
// import { ClassValidationException } from '@charonium/common/exceptions/class-validation.exception';
import { ERROR_MESSAGES } from '@charonium/common/constants/error-messages.constant';
import { PRISMA_ERROR_MESSAGES } from '@charonium/common/constants/prisma-error-messages.constant';
@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    private referralCodeUtil: ReferralCodeUtil
  ) {}

  async register(input: RegisterInput): Promise<Customer> {
    // const validationErrors = await validate(input);
    // if (validationErrors.length > 0) {
    //   throw new ClassValidationException(validationErrors);
    // }

    let referralCustomerId: number | undefined;

    const hashedPassword = await argon2.hash(input.password);
    const referralCode = await this.referralCodeUtil.encodeReferralCode();

    if (input.referralCode) {
      referralCustomerId = await this.referralCodeUtil.decodeReferralCode(
        input.referralCode
      );

      if (!referralCustomerId) {
        throw new BadRequestException(ERROR_MESSAGES.INVALID_REFERRAL_CODE);
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
      if (
        error.code === PRISMA_ERROR_MESSAGES.CLIENT.UNIQUE_CONSTRAINT_FAILED
      ) {
        throw new ConflictException(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
      throw error;
    }
  }
}
