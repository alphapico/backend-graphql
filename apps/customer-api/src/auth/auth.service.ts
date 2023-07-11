import {
  BadRequestException,
  Injectable,
  Res,
  Inject,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { CustomerService } from '../customer/customer.service';
import { JwtService } from '@nestjs/jwt';
import { LoginInput } from './dto/login.input';
import {
  ERROR_MESSAGES,
  IJwtPayload,
  JSONWEBTOKEN_ERROR_MESSAGES,
} from '@charonium/common';
import * as argon2 from 'argon2';
import { Response } from 'express';
import { CustomerStatus, EmailStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => CustomerService))
    private customerService: CustomerService,
    @Inject('ACCESS_TOKEN_JWT_SERVICE')
    private accessTokenJwtService: JwtService,
    @Inject('REFRESH_TOKEN_JWT_SERVICE')
    private refreshTokenJwtService: JwtService,
    @Inject('EMAIL_TOKEN_JWT_SERVICE')
    private emailTokenJwtService: JwtService
  ) {}

  async login(
    input: LoginInput
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const customer = await this.customerService.findByEmail(input.email);

    if (!customer) {
      throw new NotFoundException(ERROR_MESSAGES.INVALID_INPUT_EMAIL);
    }

    if (!(await argon2.verify(customer.password, input.password))) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_INPUT_PASSWORD);
    }

    // CustomerStatus turns from PENDING into ACTIVE after email is verified
    if (customer.emailStatus !== EmailStatus.VERIFIED) {
      throw new BadRequestException(ERROR_MESSAGES.CUSTOMER_NOT_VERIFIED);
    }

    if (customer.customerStatus === CustomerStatus.SUSPENDED) {
      throw new BadRequestException(ERROR_MESSAGES.CUSTOMER_SUSPENDED);
    }

    const payload = {
      sub: customer.customerId,
      email: customer.email,
      role: customer.customerRole,
    };
    const accessToken = this.accessTokenJwtService.sign(payload);
    const refreshToken = this.refreshTokenJwtService.sign(payload);

    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(token: string): Promise<IJwtPayload> {
    try {
      const payload = this.refreshTokenJwtService.verify(token);

      const customer = await this.customerService.findByCustomerId(payload.sub);

      if (!customer) {
        throw new UnauthorizedException(ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
      }

      if (customer.customerStatus === CustomerStatus.SUSPENDED) {
        throw new UnauthorizedException(ERROR_MESSAGES.CUSTOMER_SUSPENDED);
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }
  }

  async verifyEmailToken(token: string): Promise<IJwtPayload> {
    try {
      return this.emailTokenJwtService.verify(token);
    } catch (error) {
      if (error.name === JSONWEBTOKEN_ERROR_MESSAGES.TokenExpiredError) {
        throw new BadRequestException(ERROR_MESSAGES.EMAIL_ERROR.TOKEN_EXPIRED);
      } else {
        throw new BadRequestException(ERROR_MESSAGES.EMAIL_ERROR.TOKEN_INVALID);
      }
    }
  }

  async createAccessToken(payload: IJwtPayload): Promise<string> {
    return this.accessTokenJwtService.sign(payload);
  }

  async createEmailToken(payload: IJwtPayload): Promise<string> {
    return this.emailTokenJwtService.sign(payload);
  }

  logout(@Res() res: Response): void {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }
}
