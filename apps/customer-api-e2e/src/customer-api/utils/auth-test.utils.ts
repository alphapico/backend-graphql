import { GraphQLClient, gql } from 'graphql-request';
import { CustomerRole } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { CONFIG } from '@charonium/common';
import { httpUrl } from '../../support/test-setup';

export const registerMutation = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      customerId
      email
      name
      referralCode
    }
  }
`;

export const verifyEmailMutation = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      success
      message
    }
  }
`;

export const loginMutation = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input)
  }
`;

interface IRegisterResponse {
  register: {
    customerId: string;
    email: string;
    name: string;
    referralCode: string;
  };
}

interface IVerifyEmailResponse {
  verifyEmail: {
    success: boolean;
    message: string;
  };
}

// ... include other mutations and queries here

export async function createAndVerifyCustomer(
  graphQLClient: GraphQLClient,
  registerInput: {
    name: string;
    email: string;
    password: string;
  }
) {
  const customer: IRegisterResponse = await graphQLClient.request(
    registerMutation,
    {
      input: registerInput,
    }
  );

  const customerPayload = {
    sub: customer.register.customerId,
    email: customer.register.email,
    role: CustomerRole.USER,
  };

  const customerVerifiedEmailToken = jwt.sign(
    customerPayload,
    process.env.JWT_SECRET,
    { expiresIn: CONFIG.EMAIL_TOKEN_EXPIRATION }
  );

  const verifiedEmailResponse: IVerifyEmailResponse =
    await graphQLClient.request(verifyEmailMutation, {
      token: customerVerifiedEmailToken,
    });

  return { customer, verifiedEmailResponse };
}

export async function registerAndLogin(graphQLClient, customerInput) {
  const { customer } = await createAndVerifyCustomer(
    graphQLClient,
    customerInput
  );
  const customerId = parseInt(customer.register.customerId, 10);
  const referralCode = customer.register.referralCode;

  // Now, attempt to log in with the registered user's credentials
  const loginInput = {
    email: customerInput.email,
    password: customerInput.password,
  };

  const loginResponse = await graphQLClient.rawRequest(loginMutation, {
    input: loginInput,
  });

  // Get the 'set-cookie' response header containing the access token
  const cookiesString = loginResponse.headers.get('set-cookie');
  const cookies = cookiesString.split(', ');
  const accessTokenHeader = cookies.find((cookie: string) =>
    cookie.startsWith('access_token=')
  );

  if (!accessTokenHeader) {
    throw new Error('Access token not found in the response headers');
  }

  const accessToken = accessTokenHeader
    .replace('access_token=', '')
    .split(';')[0];

  const graphQLClientWithAccessToken = new GraphQLClient(httpUrl, {
    credentials: 'include',
    headers: {
      cookie: `access_token=${accessToken}`,
    },
  });

  return { customerId, referralCode, graphQLClientWithAccessToken };
}
