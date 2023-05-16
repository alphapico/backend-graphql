import { GraphQLClient, gql } from 'graphql-request';
import { CustomerRole } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { CONFIG } from '@charonium/common';

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
