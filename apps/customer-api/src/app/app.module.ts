import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerModule } from '../customer/customer.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'charonium-schema.gql',
      context: ({ req }) => ({ req }),
      sortSchema: true, // disabled this in production
      playground: true, // disabled this in production
      introspection: true, // disabled this in production
    }),
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
