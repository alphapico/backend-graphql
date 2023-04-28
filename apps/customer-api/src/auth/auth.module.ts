import { Module, forwardRef } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CustomerModule } from '../customer/customer.module';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './jwt.strategy';

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
          signOptions: { expiresIn: '15m' },
        });
      },
    },
    {
      provide: 'REFRESH_TOKEN_JWT_SERVICE',
      useFactory: () => {
        return new JwtService({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1d' },
        });
      },
    },
    {
      provide: 'EMAIL_TOKEN_JWT_SERVICE',
      useFactory: () => {
        return new JwtService({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        });
      },
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
