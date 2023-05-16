import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { PrismaService } from '@charonium/prisma';
import { CustomerModule } from '../customer/customer.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ReferralModule } from '../referral/referral.module';
import { AuthModule } from '../auth/auth.module';
import cookieParser from 'cookie-parser';
import { EmailModule } from '../email/email.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'charonium-schema.gql',
      context: ({ req, res }) => ({ req, res }),
      sortSchema: true, // disabled this in production
      playground: true, // disabled this in production
      introspection: true, // disabled this in production
    }),
    CustomerModule,
    ReferralModule,
    AuthModule,
    EmailModule,
    UploadModule,
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
