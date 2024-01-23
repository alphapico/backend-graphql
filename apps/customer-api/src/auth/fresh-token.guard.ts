import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CONFIG, ERROR_MESSAGES, IJwtPayload } from '@styx/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FreshTokenGuard extends AuthGuard('jwt') {
  private readonly TOKEN_FRESHNESS_DURATION: number;

  constructor() {
    super();
    // If in test environment, set a shorter duration,
    // else use the one from CONFIG
    this.TOKEN_FRESHNESS_DURATION =
      process.env.NODE_ENV === 'test'
        ? 2
        : CONFIG.TOKEN_FRESHNESS_DURATION || 600;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = await super.canActivate(context);
    if (!canActivate) return false;

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req as { user: IJwtPayload };
    if (!user || !user.iat) return false;

    // Check if the token is fresh (e.g., less than 10 minutes old)
    const dateNow = Date.now();
    const tokenAgeInSeconds = Math.floor(dateNow / 1000) - user.iat;
    if (tokenAgeInSeconds > this.TOKEN_FRESHNESS_DURATION) {
      // 600 seconds = 10 minutes
      throw new UnauthorizedException(ERROR_MESSAGES.TOKEN_IS_NOT_FRESH);
    }

    return true;
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
