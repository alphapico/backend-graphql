// Define the helper function
// function spqlDirx(key, value) {
//   value = typeof value === 'string' ? `\\"${value}\\"` : value.toString();
//   return `@spectaql(options: [{ key: "${key}", value: "${value}" }])`;
// }

// function spqlDirx(key, value) {
//   // Check if the value is an object (including arrays)
//   if (typeof value === 'object') {
//     // If so, stringify it and escape double quotes
//     value = JSON.stringify(value).replace(/"/g, '\\"');
//   } else if (typeof value === 'string') {
//     // If the value is a string, escape double quotes and wrap it in double quotes
//     value = `\\"${value.replace(/"/g, '\\"')}\\"`;
//   } else {
//     // For other types, just call toString()
//     value = value.toString();
//   }
//   return `@spectaql(options: [{ key: "${key}", value: "${value}" }])`;
// }

function spqlDirx(key, value) {
  if (typeof value === 'object') {
    // Stringify the JSON object with indentation for readability,
    // and replace double quotes with escaped double quotes
    value = JSON.stringify(value, null, 2).replace(/"/g, '\\"');
    // Replace newline characters with literal \n for multi-line string formatting
    value = value.replace(/\n/g, '\\n');
  } else if (typeof value === 'string') {
    value = `\\"${value.replace(/"/g, '\\"')}\\"`;
  } else {
    value = value.toString();
  }
  return `@spectaql(options: [{ key: "${key}", value: "${value}" }])`;
}

// Use the helper function to define the directives
module.exports = {
  type: {
    JwtPayload: {
      email: spqlDirx('example', 'johndoe@gmail.com'),
      exp: spqlDirx('example', 1697779177),
      iat: spqlDirx('example', 1697778277),
    },
    VerifyEmailResult: {
      message: spqlDirx('example', 'Customer is successfully verified'),
      success: spqlDirx('example', true),
    },
    Customer: {
      email: spqlDirx('example', 'johndoe@gmail.com'),
      emailStatus: spqlDirx('example', 'VERIFIED'),
      customerStatus: spqlDirx('example', 'ACTIVE'),
    },
    ReferralMap: {
      level: spqlDirx('example', 'level0'),
    },
    TokenPrice: {
      currency: spqlDirx('example', 'EUR'),
    },
    TokenPackage: {
      currency: spqlDirx('example', 'USD'),
    },
    Charge: {
      addresses: spqlDirx('example', {
        dai: '0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f',
        usdc: '0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f',
        pusdc: '0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f',
        pweth: '0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f',
        tether: '0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f',
        apecoin: '0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f',
        bitcoin: '34URso9pwmaWXXXsGjwiUdy3g9j23qg5TW',
        polygon: '0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f',
        dogecoin: 'DB5kPE4VY6TFaopwphBaHpWkqDAxsbDhic',
        ethereum: '0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f',
        litecoin: 'MUndhhRBZffhd7nXhnQ7mTMgKd2LBeyEHE',
        shibainu: '0x4acc48c6aca0f9e4ac74abd0447429424c8a4a7f',
        bitcoincash: 'qzqyjeskkq2wxy3t8k0rctmgpsc59wdv4g6epkd8u5',
      }),
      cancelUrl: spqlDirx(
        'example',
        'https://<FRONTEND_URL>/payment-cancelled'
      ),
      code: spqlDirx('example', 'WH3PHAJT'),
      description: spqlDirx('example', 'Purchase of 20 tokens at 25.00 EUR'),
      exchangeRates: spqlDirx('example', {
        'APE-USD': '1.4775',
        'BCH-USD': '187.03',
        'BTC-USD': '25810.785',
        'DAI-USD': '0.99985',
        'ETH-USD': '1635.665',
        'LTC-USD': '64.08',
        'DOGE-USD': '0.062855',
        'SHIB-USD': '0.000008135',
        'USDC-USD': '1.0',
        'USDT-USD': '0.999385',
        'PUSDC-USD': '1.0',
        'PWETH-USD': '1635.835',
        'PMATIC-USD': '0.54525',
      }),
      feeRate: spqlDirx('example', 0.01),
      hostedUrl: spqlDirx(
        'example',
        'https://commerce.coinbase.com/charges/WH3PHAJT'
      ),
      localExchangeRates: spqlDirx('example', {
        'APE-EUR': '1.37',
        'BCH-EUR': '172.90',
        'BTC-EUR': '23860.84',
        'DAI-EUR': '0.92',
        'ETH-EUR': '1512.09',
        'LTC-EUR': '59.24',
        'DOGE-EUR': '0.06',
        'SHIB-EUR': '0.00',
        'USDC-EUR': '0.92',
        'USDT-EUR': '0.92',
        'PUSDC-EUR': '0.92',
        'PWETH-EUR': '1512.25',
        'PMATIC-EUR': '0.50',
      }),
      name: spqlDirx('example', 'John Smith'),
      paymentThreshold: spqlDirx('example', {
        overpayment_absolute_threshold: {
          amount: '5.00',
          currency: 'USD',
        },
        overpayment_relative_threshold: '0.045',
        underpayment_absolute_threshold: {
          amount: '5.00',
          currency: 'USD',
        },
        underpayment_relative_threshold: '0.005',
      }),
      pricing: spqlDirx('example', {
        dai: {
          amount: '27.047099993858618793',
          currency: 'DAI',
        },
        usdc: {
          amount: '27.043043',
          currency: 'USDC',
        },
        local: {
          amount: '25.00',
          currency: 'EUR',
        },
        pusdc: {
          amount: '27.043043',
          currency: 'PUSDC',
        },
        pweth: {
          amount: '0.016531644651728041',
          currency: 'PWETH',
        },
        tether: {
          amount: '27.059685',
          currency: 'USDT',
        },
        apecoin: {
          amount: '18.303243945082598985',
          currency: 'APE',
        },
        bitcoin: {
          amount: '0.00104774',
          currency: 'BTC',
        },
        polygon: {
          amount: '49.597511000',
          currency: 'PMATIC',
        },
        dogecoin: {
          amount: '430.24489585',
          currency: 'DOGE',
        },
        ethereum: {
          amount: '0.016533000',
          currency: 'ETH',
        },
        litecoin: {
          amount: '0.42202002',
          currency: 'LTC',
        },
        shibainu: {
          amount: '3324283.088980889981561156',
          currency: 'SHIB',
        },
        bitcoincash: {
          amount: '0.14459201',
          currency: 'BCH',
        },
      }),
      pricingType: spqlDirx('example', 'fixed_price'),
      redirectUrl: spqlDirx(
        'example',
        'https://<FRONTEND_URL>/payment-success'
      ),
    },
    CommissionTier: {
      tier: spqlDirx('example', 1),
      commissionRate: spqlDirx('example', 0.1),
    },
    CommissionBase: {
      commissionRate: spqlDirx('example', 0.02),
      currency: spqlDirx('example', 'EUR'),
      tier: spqlDirx('example', 1),
    },
    Wallet: {
      address: spqlDirx(
        'example',
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
      ),
      cryptoType: spqlDirx('example', 'ETH'),
      isDefault: spqlDirx('example', true),
    },
  },
  input: {
    RegisterInput: {
      email: spqlDirx('example', 'johndoe@gmail.com'),
      name: spqlDirx('example', 'John Doe'),
      password: spqlDirx('example', 'secured-password'),
      referralCode: spqlDirx('example', 'JKMUJZEU'),
    },
    LoginInput: {
      email: spqlDirx('example', 'johndoe@gmail.com'),
      password: spqlDirx('example', 'secured-password'),
    },
    EmailInput: {
      email: spqlDirx('example', 'johndoe@gmail.com'),
    },
    ResetPasswordInput: {
      token: spqlDirx('example', 'some-long-token-string'),
      newPassword: spqlDirx('example', 'new-secured-password'),
    },
    ChangePasswordInput: {
      oldPassword: spqlDirx('example', 'old-secured-password'),
      newPassword: spqlDirx('example', 'new-secured-password'),
    },
    RegisterAdminInput: {
      token: spqlDirx('example', 'some-long-token-string'),
      newName: spqlDirx('example', 'Admin John Doe'),
      newPassword: spqlDirx('example', 'new-secured-password'),
    },
    UploadInput: {
      fileExtension: spqlDirx('example', 'jpg'),
      type: spqlDirx('example', 'PACKAGE'),
    },
    SaveImageInput: {
      path: spqlDirx(
        'example',
        'https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key-from-generatePresignedUrl}'
      ),
      type: spqlDirx('example', 'PACKAGE'),
    },
    ReferralInput: {
      startLevel: spqlDirx('example', 0),
    },
    TokenPriceCreateInput: {
      currency: spqlDirx('example', 'EUR'),
    },
    TokenPackageCreateInput: {
      currency: spqlDirx('example', 'USD'),
    },
    TokenPackageUpdateInput: {
      currency: spqlDirx('example', 'USD'),
    },
    PurchaseTokensInput: {
      redirect_url: spqlDirx(
        'example',
        'https://<FRONTEND_URL>/payment-success'
      ),
      cancel_url: spqlDirx(
        'example',
        'https://<FRONTEND_URL>/payment-cancelled'
      ),
    },
    CreateCommissionTierInput: {
      tier: spqlDirx('example', 1),
      commissionRate: spqlDirx('example', 0.1),
    },
    UpdateCommissionTierInput: {
      tier: spqlDirx('example', 1),
      commissionRate: spqlDirx('example', 0.105),
    },
    CreateWalletInput: {
      address: spqlDirx(
        'example',
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
      ),
      cryptoType: spqlDirx('example', 'ETH'),
    },
  },
  args: {
    Mutation: {
      verifyEmail: {
        token: spqlDirx('example', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...'),
      },
    },
    Query: {
      getPurchaseActivities: {
        limit: spqlDirx('example', 10),
        paymentStatus: spqlDirx('example', 'COMPLETED'),
      },
    },
  },
  returns: {
    Mutation: {
      generatePresignedPost: spqlDirx('undocumented', true),
      generatePresignedUrls: spqlDirx('undocumented', true),
    },
    // Uncomment below if needed
    // Mutation: {
    //     refreshTokens: spqlDirx("example", "Refresh token successful"),
    // },
  },
};
