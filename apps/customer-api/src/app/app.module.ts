import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { PrismaService } from '@styx/prisma';
import { CustomerModule } from '../customer/customer.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ReferralModule } from '../referral/referral.module';
import { AuthModule } from '../auth/auth.module';
import cookieParser from 'cookie-parser';
import { EmailModule } from '../email/email.module';
import { UploadModule } from '../upload/upload.module';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';
import { CommissionModule } from '../commission/commission.module';
import { ConfigModule } from '../config/config.module';
import GraphQLJSON from 'graphql-type-json';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'styx-schema.gql',
      resolvers: { JSON: GraphQLJSON },
      context: ({ req, res }) => ({ req, res }),
      sortSchema: true, // disabled this in production, process.env.NODE_ENV !== 'production'
      playground: true, // disabled this in production, process.env.NODE_ENV !== 'production'
      introspection: true, // disabled this in production, process.env.NODE_ENV !== 'production'
    }),
    CustomerModule,
    ReferralModule,
    AuthModule,
    EmailModule,
    UploadModule,
    PaymentGatewayModule,
    CommissionModule,
    ConfigModule,
    WalletModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
// export class AppModule {}
