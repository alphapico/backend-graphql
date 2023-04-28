import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ERROR_MESSAGES, IJwtPayload } from '@charonium/common';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.access_token,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: IJwtPayload) {
    if (!payload || !payload.sub || !payload.email) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_ACCESS_TOKEN);
    }

    return { id: payload.sub, email: payload.email };
  }
}
