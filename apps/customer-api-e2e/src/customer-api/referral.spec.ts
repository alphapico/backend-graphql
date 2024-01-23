import { clearCookies, graphQLClient } from '../support/test-setup';
import { gql } from 'graphql-request';
import {
  clearDatabase,
  connectToDatabase,
  disconnectFromDatabase,
} from '../support/test-utils';
import {
  createAndVerifyCustomer,
  registerAndLogin,
} from './utils/auth-test.utils';
import { ERROR_MESSAGES } from '@styx/common';

describe('Referral', () => {
  //   console.log('Running Referral tests');

  beforeAll(async () => {
    await connectToDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    // Clear cookies before running the test
    clearCookies();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
  });

  interface IGetReferralMapResponse {
    getReferralMap: {
      level: string;
      referralEntries: {
        referrer: {
          customerId: number;
          name: string;
          email: string;
          referralCode: string;
          referralCustomerId: number | null;
        };
        referees: {
          customerId: number;
          name: string;
          email: string;
          referralCode: string;
          referralCustomerId: number | null;
        }[];
      }[];
    }[];
  }

  const getReferralMapQuery = gql`
    query GetReferralMap($input: ReferralInput!) {
      getReferralMap(input: $input) {
        level
        referralEntries {
          referrer {
            customerId
            name
            email
            referralCode
            referralCustomerId
          }
          referees {
            customerId
            name
            email
            referralCode
            referralCustomerId
          }
        }
      }
    }
  `;

  it('should return an empty referral map for a customer with no referrals', async () => {
    // Create a customer but do not create any referrals for them
    const customerInput = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };

    // Login Customer
    const { customerId, graphQLClientWithAccessToken } = await registerAndLogin(
      graphQLClient,
      customerInput
    );

    const response: IGetReferralMapResponse =
      await graphQLClientWithAccessToken.request(getReferralMapQuery, {
        input: {
          referrerId: customerId,
        },
      });

    expect(response).toHaveProperty('getReferralMap');
    expect(response.getReferralMap).toHaveLength(0); // No levels have referral entries
  });

  it('should return an error for a non-existent customer', async () => {
    // Create a customer but do not create any referrals for them
    const customerInput = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };

    // Login Customer
    const { graphQLClientWithAccessToken } = await registerAndLogin(
      graphQLClient,
      customerInput
    );
    const nonExistentCustomerId = 9999; // Assuming this ID does not exist

    try {
      await graphQLClientWithAccessToken.request(getReferralMapQuery, {
        input: {
          referrerId: nonExistentCustomerId,
        },
      });
    } catch (error) {
      expect(error.response.errors[0].message).toBe(
        ERROR_MESSAGES.CUSTOMER_NOT_FOUND
      );
    }
  });

  it('should return an error for a negative start level', async () => {
    // Create a customer
    const customerInput = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: 'password12345',
    };

    // Login Customer
    const { customerId, graphQLClientWithAccessToken } = await registerAndLogin(
      graphQLClient,
      customerInput
    );

    const negativeStartLevel = -1;

    try {
      await graphQLClientWithAccessToken.request(getReferralMapQuery, {
        input: {
          referrerId: customerId,
          startLevel: negativeStartLevel,
        },
      });
    } catch (error) {
      expect(error.response.errors[0].message).toBe(
        ERROR_MESSAGES.START_LEVEL_MUST_BE_NON_NEGATIVE
      );
    }

    // await expect(
    //   graphQLClientWithAccessToken.request(getReferralMapQuery, {
    //     input: {
    //       referrerId: customerId,
    //       startLevel: negativeStartLevel,
    //     },
    //   })
    // ).rejects.toThrowError(); // Expect an error to be thrown
  });

  it('should return a referral map for a customer with referrals', async () => {
    // Create referrer
    const referrerInput = {
      name: 'John Doe Staniay',
      email: 'john.doe.stania@gmail.com',
      password: 'password12345',
    };

    // Login referrer
    const {
      customerId: referrerId,
      referralCode,
      graphQLClientWithAccessToken,
    } = await registerAndLogin(graphQLClient, referrerInput);

    // Create referral (level 1)
    const refereeInput = {
      name: 'Jane Smith Sythy',
      email: 'jane.smith.syth@gmail.com',
      password: 'password12345',
      referralCode,
    };

    const { customer: referee } = await createAndVerifyCustomer(
      graphQLClient,
      refereeInput
    );

    const refereeId = referee.register.customerId;

    const response: IGetReferralMapResponse =
      await graphQLClientWithAccessToken.request(getReferralMapQuery, {
        input: {
          referrerId,
        },
      });

    expect(response).toHaveProperty('getReferralMap');
    expect(response.getReferralMap).toHaveLength(1); // Only one level has referral entries
    expect(response.getReferralMap[0].referralEntries).toHaveLength(1);
    expect(
      response.getReferralMap[0].referralEntries[0].referrer.customerId
    ).toEqual(referrerId);
    expect(
      response.getReferralMap[0].referralEntries[0].referees.map(
        (r) => r.customerId
      )
    ).toContain(refereeId);
  });

  it('should progressively retrieve a multi-leveled referral map for a customer', async () => {
    // depth by default is 3
    const depth = 3;
    const startLevel = 0;

    // Create User A
    const userAInput = {
      name: 'User A',
      email: 'userA@gmail.com',
      password: 'password12345',
    };

    // Login User A
    const {
      customerId: userAId,
      referralCode: referralCodeA,
      graphQLClientWithAccessToken,
    } = await registerAndLogin(graphQLClient, userAInput);

    // Create User B
    const userBInput = {
      name: 'User B',
      email: 'userB@gmail.com',
      password: 'password12345',
      referralCode: referralCodeA,
    };

    const { customer: userB } = await createAndVerifyCustomer(
      graphQLClient,
      userBInput
    );

    const referralCodeB = userB.register.referralCode;

    // Create User C
    const userCInput = {
      name: 'User C',
      email: 'userC@gmail.com',
      password: 'password12345',
      referralCode: referralCodeA,
    };

    await createAndVerifyCustomer(graphQLClient, userCInput);

    // Create User D
    const userDInput = {
      name: 'User D',
      email: 'userD@gmail.com',
      password: 'password12345',
      referralCode: referralCodeA,
    };

    const { customer: userD } = await createAndVerifyCustomer(
      graphQLClient,
      userDInput
    );

    const referralCodeD = userD.register.referralCode;

    // Create User E
    const userEInput = {
      name: 'User E',
      email: 'userE@gmail.com',
      password: 'password12345',
      referralCode: referralCodeB,
    };

    const { customer: userE } = await createAndVerifyCustomer(
      graphQLClient,
      userEInput
    );

    const referralCodeE = userE.register.referralCode;

    // Create User M
    const userMInput = {
      name: 'User M',
      email: 'userM@gmail.com',
      password: 'password12345',
      referralCode: referralCodeD,
    };

    await createAndVerifyCustomer(graphQLClient, userMInput);

    // Create User N
    const userNInput = {
      name: 'User N',
      email: 'userN@gmail.com',
      password: 'password12345',
      referralCode: referralCodeD,
    };

    await createAndVerifyCustomer(graphQLClient, userNInput);

    // Create User F
    const userFInput = {
      name: 'User F',
      email: 'userF@gmail.com',
      password: 'password12345',
      referralCode: referralCodeE,
    };

    await createAndVerifyCustomer(graphQLClient, userFInput);

    // Create User G
    const userGInput = {
      name: 'User G',
      email: 'userG@gmail.com',
      password: 'password12345',
      referralCode: referralCodeE,
    };

    const { customer: userG } = await createAndVerifyCustomer(
      graphQLClient,
      userGInput
    );

    const referralCodeG = userG.register.referralCode;

    // Create User H
    const userHInput = {
      name: 'User H',
      email: 'userH@gmail.com',
      password: 'password12345',
      referralCode: referralCodeG,
    };

    const { customer: userH } = await createAndVerifyCustomer(
      graphQLClient,
      userHInput
    );

    const referralCodeH = userH.register.referralCode;

    // Create User I
    const userIInput = {
      name: 'User I',
      email: 'userI@gmail.com',
      password: 'password12345',
      referralCode: referralCodeG,
    };

    await createAndVerifyCustomer(graphQLClient, userIInput);

    // Create User J
    const userJInput = {
      name: 'User J',
      email: 'userJ@gmail.com',
      password: 'password12345',
      referralCode: referralCodeG,
    };

    const { customer: userJ } = await createAndVerifyCustomer(
      graphQLClient,
      userJInput
    );

    const referralCodeJ = userJ.register.referralCode;

    // Create User K
    const userKInput = {
      name: 'User K',
      email: 'userK@gmail.com',
      password: 'password12345',
      referralCode: referralCodeH,
    };

    await createAndVerifyCustomer(graphQLClient, userKInput);

    // Create User L
    const userLInput = {
      name: 'User L',
      email: 'userL@gmail.com',
      password: 'password12345',
      referralCode: referralCodeH,
    };

    await createAndVerifyCustomer(graphQLClient, userLInput);

    // Create User P
    const userPInput = {
      name: 'User P',
      email: 'userP@gmail.com',
      password: 'password12345',
      referralCode: referralCodeJ,
    };

    await createAndVerifyCustomer(graphQLClient, userPInput);

    const response: IGetReferralMapResponse =
      await graphQLClientWithAccessToken.request(getReferralMapQuery, {
        input: {
          referrerId: userAId,
          startLevel,
        },
      });

    // Add your assertions here based on the expected referral map
    // Assertions
    expect(response).toHaveProperty('getReferralMap');

    // Check that there are 4 levels
    expect(response.getReferralMap).toHaveLength(4);

    // Check level 0
    const level0 = response.getReferralMap.find(
      (level) => level.level === `level${startLevel}`
    );
    expect(level0.referralEntries[0].referees).toHaveLength(3); // User A has 3 referrals
    expect(level0.referralEntries[0].referrer.customerId).toEqual(userAId);
    expect(level0.referralEntries[0].referees.map((r) => r.name)).toEqual(
      expect.arrayContaining(['User B', 'User C', 'User D'])
    );

    // Check level 1
    const level1 = response.getReferralMap.find(
      (level) => level.level === `level${startLevel + 1}`
    );
    expect(level1.referralEntries).toHaveLength(2); // User B, User D have referrals, User C does not have referral

    // Check User B's referrals in level 1
    const userBReferrals = level1.referralEntries.find(
      (entry) => entry.referrer.name === 'User B'
    );
    expect(userBReferrals.referees).toHaveLength(1); // User B has 1 referral
    expect(userBReferrals.referees[0].name).toEqual('User E');

    // Check User D's referrals in level 1
    const userDReferrals = level1.referralEntries.find(
      (entry) => entry.referrer.name === 'User D'
    );
    expect(userDReferrals.referees).toHaveLength(2); // User D has 2 referrals
    expect(userDReferrals.referees.map((r) => r.name)).toEqual(
      expect.arrayContaining(['User M', 'User N'])
    );

    // Check level 2
    const level2 = response.getReferralMap.find(
      (level) => level.level === `level${startLevel + 2}`
    );
    expect(level2.referralEntries).toHaveLength(1); // Only User E has referrals, User M and N don't have referral

    // Check User E's referrals in level 2
    const userEReferrals = level2.referralEntries.find(
      (entry) => entry.referrer.name === 'User E'
    );
    expect(userEReferrals.referees).toHaveLength(2); // User E has 2 referrals
    expect(userEReferrals.referees.map((r) => r.name)).toEqual(
      expect.arrayContaining(['User F', 'User G'])
    );

    // Check level 3
    const level3 = response.getReferralMap.find(
      (level) => level.level === `level${startLevel + 3}`
    );
    expect(level3.referralEntries).toHaveLength(1); // Only User G has referrals, User F has no referral

    // Check User G's referrals in level 3
    const userGReferrals = level3.referralEntries.find(
      (entry) => entry.referrer.name === 'User G'
    );
    expect(userGReferrals.referees).toHaveLength(3); // User G has 3 referrals
    expect(userGReferrals.referees.map((r) => r.name)).toEqual(
      expect.arrayContaining(['User H', 'User I', 'User J'])
    );

    // fetching User H and its referrals
    const userHId = userH.register.customerId;
    const response2: IGetReferralMapResponse = await graphQLClient.request(
      getReferralMapQuery,
      {
        input: {
          referrerId: userHId,
          startLevel: startLevel + depth + 1,
        },
      }
    );

    // Assertions
    expect(response2).toHaveProperty('getReferralMap');
    // Check that there are 1 level
    expect(response2.getReferralMap).toHaveLength(1);

    // Check level 4
    const level4a = response2.getReferralMap.find(
      (level) => level.level === `level${startLevel + 4}`
    );

    // Check User H's referrals in level 3
    const userHReferrals = level4a.referralEntries.find(
      (entry) => entry.referrer.name === 'User H'
    );
    expect(userHReferrals.referees).toHaveLength(2); // User H has 2 referrals
    expect(userHReferrals.referees.map((r) => r.name)).toEqual(
      expect.arrayContaining(['User K', 'User L'])
    );

    // fetching User J and its referrals
    const userJId = userJ.register.customerId;
    const response3: IGetReferralMapResponse = await graphQLClient.request(
      getReferralMapQuery,
      {
        input: {
          referrerId: userJId,
          startLevel: startLevel + depth + 1,
        },
      }
    );

    // Assertions
    expect(response3).toHaveProperty('getReferralMap');
    // Check that there are 1 level
    expect(response3.getReferralMap).toHaveLength(1);

    // Check level 4
    const level4b = response3.getReferralMap.find(
      (level) => level.level === `level${startLevel + 4}`
    );

    // Check User J's referrals in level 3
    const userJReferrals = level4b.referralEntries.find(
      (entry) => entry.referrer.name === 'User J'
    );
    expect(userJReferrals.referees).toHaveLength(1); // User J has 1 referral
    expect(userJReferrals.referees[0].name).toEqual('User P');
  });
});
