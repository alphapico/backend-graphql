/* eslint-disable */

import { GraphQLClient } from 'graphql-request';
import { CookieJar } from 'tough-cookie';
import { default as fetch, RequestInit } from 'node-fetch';

const host = process.env.HOST ?? 'localhost';
const httpPort = process.env.PORT ?? '3001';

export const httpUrl = `http://${host}:${httpPort}/graphql`;
export const healthUrl = `http://${host}:${httpPort}/health`;

const cookieJar = new CookieJar();

const customFetch = async (url: string, init: RequestInit) => {
  const cookie = await cookieJar.getCookieString(url);
  if (init.headers) {
    if (typeof init.headers === 'object' && !Array.isArray(init.headers)) {
      (init.headers as Record<string, string>)['Cookie'] = cookie;
    }
  } else {
    init.headers = { Cookie: cookie };
  }

  const response = await fetch(url, init);

  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    await cookieJar.setCookie(setCookie, url);
  }

  return response;
};

export const graphQLClient = new GraphQLClient(httpUrl, {
  credentials: 'include',
  fetch: customFetch,
});

export const clearCookies = () => {
  cookieJar.removeAllCookiesSync();
};
