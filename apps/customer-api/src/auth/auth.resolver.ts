import { Resolver, Mutation, Query, Args, Context, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { Request, Response } from 'express';
import {
  CurrentUser,
  ERROR_MESSAGES,
  IJwtPayload,
  SUCCESS_MESSAGES,
} from '@charonium/common';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { JwtPayload } from './dto/jwt-payload.dto';
import { FreshTokenGuard } from './fresh-token.guard';
import { Customer } from '../customer/dto/customer.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => String)
  async login(
    @Args('input') input: LoginInput,
    @Context('res') res: Response
  ): Promise<string> {
    const { accessToken, refreshToken } = await this.authService.login(input);
    res.cookie('access_token', accessToken, { httpOnly: true, secure: false });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
    });
    return SUCCESS_MESSAGES.LOGIN_SUCCESS;
  }

  @Mutation(() => String)
  async refreshTokens(
    @Context('req') req: Request,
    @Context('res') res: Response
  ): Promise<string> {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const payload = await this.authService.verifyRefreshToken(refreshToken);

    // Write the output to a text file
    // writeDataToFile(`${this.constructor.name}/refresh-tokens.txt`, payload);

    delete payload.exp;

    const newAccessToken = await this.authService.createAccessToken(payload);
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: false,
    });
    return SUCCESS_MESSAGES.REFRESH_TOKEN_SUCCESS;
  }

  @Mutation(() => Customer)
  @UseGuards(AdminGuard)
  async suspendCustomer(
    @Args('customerId', { type: () => Int }) customerId: number
  ): Promise<Customer> {
    const customer = await this.authService.suspendCustomer(customerId);
    return {
      ...customer,
      charges: [],
      commissions: [],
      wallets: [],
      purchaseActivities: [],
    };
  }

  @Mutation(() => Customer)
  @UseGuards(AdminGuard)
  async reinstateCustomer(
    @Args('customerId', { type: () => Int }) customerId: number
  ): Promise<Customer> {
    const customer = await this.authService.reinstateCustomer(customerId);
    return {
      ...customer,
      charges: [],
      commissions: [],
      wallets: [],
      purchaseActivities: [],
    };
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async logout(@Context('res') res: Response): Promise<string> {
    this.authService.logout(res);
    return SUCCESS_MESSAGES.LOGOUT_SUCCESS;
  }

  @Query(() => JwtPayload)
  @UseGuards(JwtAuthGuard)
  async protectedMethod(@CurrentUser() user: IJwtPayload): Promise<JwtPayload> {
    return user;
  }

  @Query(() => JwtPayload)
  @UseGuards(AdminGuard)
  async protectedAdminMethod(
    @CurrentUser() user: IJwtPayload
  ): Promise<JwtPayload> {
    return user;
  }

  @Query(() => JwtPayload)
  @UseGuards(FreshTokenGuard)
  async protectedFreshTokenMethod(
    @CurrentUser() user: IJwtPayload
  ): Promise<JwtPayload> {
    return user;
  }
}
