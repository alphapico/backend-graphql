import { GraphQLClient, gql } from 'graphql-request';
import { Customer, CustomerRole } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { CONFIG, IJwtPayload } from '@charonium/common';
import { httpUrl } from '../../support/test-setup';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@charonium/prisma';

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

export const registerAdminMutation = gql`
  mutation RegisterAdmin($input: RegisterAdminInput!) {
    registerAdmin(input: $input)
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
    customerId: number;
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

  const customerPayload: IJwtPayload = {
    sub: customer.register.customerId,
    name: customer.register.name,
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
  const customerId = customer.register.customerId;
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

export async function createAndVerifyAdmin(
  graphQLClient: GraphQLClient,
  jwtService: JwtService,
  prismaService: PrismaService
) {
  const adminLoginInput = {
    email: process.env.ADMIN_EMAIL,
    password: 'admin_password12345',
  };

  let loginResponse;
  try {
    loginResponse = await graphQLClient.rawRequest(loginMutation, {
      input: adminLoginInput,
    });
    console.log('Admin with password admin_password12345 already registered');
  } catch (error) {
    console.log('Admin with password admin_password12345 not registered yet');
    // If login fails, register the admin
    const admin: Customer = await prismaService.customer.findUnique({
      where: { email: process.env.ADMIN_EMAIL },
    });

    const adminPayload: IJwtPayload = {
      sub: admin.customerId,
      name: admin.name,
      email: admin.email,
      role: CustomerRole.ADMIN,
    };

    const adminRegistrationToken = jwtService.sign(adminPayload);

    const registerAdminInput = {
      token: adminRegistrationToken,
      newName: 'Admin User',
      newPassword: 'admin_password12345',
    };

    await graphQLClient.request(registerAdminMutation, {
      input: registerAdminInput,
    });

    // Try logging in again after registration
    loginResponse = await graphQLClient.rawRequest(loginMutation, {
      input: adminLoginInput,
    });
  }

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

  const graphQLClientWithAdminAccessToken = new GraphQLClient(httpUrl, {
    credentials: 'include',
    headers: {
      cookie: `access_token=${accessToken}`,
    },
  });

  return { graphQLClientWithAdminAccessToken };
}
