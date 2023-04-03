/* eslint-disable */

import { GraphQLClient } from 'graphql-request';

const host = process.env.HOST ?? 'localhost';
const httpPort = process.env.PORT ?? '3001';

const httpUrl = `http://${host}:${httpPort}/graphql`;
export const healthUrl = `http://${host}:${httpPort}/health`;

export const graphQLClient = new GraphQLClient(httpUrl, {
  headers: {},
});
