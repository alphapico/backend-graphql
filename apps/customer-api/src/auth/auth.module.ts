import { Module, forwardRef } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CustomerModule } from '../customer/customer.module';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './jwt.strategy';
import { CONFIG } from '@charonium/common';

@Module({
  imports: [forwardRef(() => CustomerModule), JwtModule.register({})],
  providers: [
    AuthService,
    JwtStrategy,
    AuthResolver,
    {
      provide: 'ACCESS_TOKEN_JWT_SERVICE',
      useFactory: () => {
        return new JwtService({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: CONFIG.ACCESS_TOKEN_EXPIRATION },
        });
      },
    },
    {
      provide: 'REFRESH_TOKEN_JWT_SERVICE',
      useFactory: () => {
        return new JwtService({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: CONFIG.REFRESH_TOKEN_EXPIRATION },
        });
      },
    },
    {
      provide: 'EMAIL_TOKEN_JWT_SERVICE',
      useFactory: () => {
        return new JwtService({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: CONFIG.EMAIL_TOKEN_EXPIRATION },
        });
      },
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
