import { graphQLClient } from '../support/test-setup';
import { gql } from 'graphql-request';
import {
  clearDatabase,
  connectToDatabase,
  disconnectFromDatabase,
} from '../support/test-utils';

describe('Customer', () => {
  console.log('Running Customer tests');

  beforeAll(async () => {
    await connectToDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
  });

  // Define the expected response interface
  interface RegisterResponse {
    register: {
      customerId: string;
      email: string;
      name: string;
      referralCode: string;
    };
  }

  const registerMutation = gql`
    mutation Register($input: RegisterInput!) {
      register(input: $input) {
        customerId
        email
        name
        referralCode
      }
    }
  `;

  it('should register a new customer without referral code', async () => {
    const input = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };

    const response: RegisterResponse = await graphQLClient.request(
      registerMutation,
      {
        input,
      }
    );

    expect(response).toHaveProperty('register');
    expect(response.register).toHaveProperty('customerId');
    expect(response.register.name).toEqual(input.name);
    expect(response.register.email).toEqual(input.email);
    expect(response.register.referralCode).toBeDefined();
  });

  it('should register a new customer with a valid referral code', async () => {
    const referrerInput = {
      name: 'Jane Smith',
      email: 'jane.smith@gmail.com',
      password: 'password12345',
    };

    const referrerResponse: RegisterResponse = await graphQLClient.request(
      registerMutation,
      {
        input: referrerInput,
      }
    );

    const referralCode = referrerResponse.register.referralCode;

    const newUserInput = {
      name: 'Alice Brown',
      email: 'alice.brown@gmail.com',
      password: 'password12345',
      referralCode,
    };

    const newUserResponse: RegisterResponse = await graphQLClient.request(
      registerMutation,
      {
        input: newUserInput,
      }
    );

    expect(newUserResponse).toHaveProperty('register');
    expect(newUserResponse.register).toHaveProperty('customerId');
    expect(newUserResponse.register.name).toEqual(newUserInput.name);
    expect(newUserResponse.register.email).toEqual(newUserInput.email);
    expect(newUserResponse.register.referralCode).toBeDefined();
  });

  it('should not register a new customer with an invalid referral code', async () => {
    const newUserInput = {
      name: 'Alice Brown',
      email: 'alice.brown@gmail.com',
      password: 'password12345',
      referralCode: 'INVALIDCODE',
    };

    try {
      await graphQLClient.request(registerMutation, {
        input: newUserInput,
      });
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.response.errors[0].message).toEqual(
        'Invalid referral code.'
      );
    }
  });

  it('should not register a new customer with an email that is already in use', async () => {
    const existingCustomer = {
      name: 'Alice Brown',
      email: 'alice.brown@gmail.com',
      password: 'password12345',
    };

    // Create the existing customer
    await graphQLClient.request(registerMutation, {
      input: existingCustomer,
    });

    const newUserInput = {
      name: 'Bob Smith',
      email: 'alice.brown@gmail.com', // Same email as the existing customer
      password: 'password12345',
    };

    try {
      await graphQLClient.request(registerMutation, {
        input: newUserInput,
      });
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.response.errors[0].message).toEqual('Email already exists.');
    }
  });

  it('should not register a new customer with an invalid email', async () => {
    const input = {
      name: 'John Doe',
      email: 'john.doe#max.com',
      password: 'password12345',
    };

    try {
      await graphQLClient.request(registerMutation, {
        input,
      });
    } catch (error) {
      //   console.log(JSON.stringify(error, null, 2));
      expect(error).toBeDefined();
      expect(
        error.response.errors[0].extensions.originalError.message[0]
      ).toEqual('email must be an email');
    }
  });
});
