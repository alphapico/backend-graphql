# Flow

## 1. Authentication and Authorization

### Normal User

#### a. Register User

![Register User](https://github.com/Tequnity/charonium/assets/128450164/5805b410-0832-4764-9596-57fc001891ff)

- At step 4, user verification link looks like this: `${FRONTEND_DOMAIN}/verify-email?token=${token}` . Frontend need to capture the token at send the token to Backend during step 5

#### b. Reset Password

![Reset Password](https://github.com/Tequnity/charonium/assets/128450164/f7a92599-199f-4f60-b051-2bec887609b2)

- At step 4, user reset password link looks like this: `${FRONTEND_DOMAIN}/reset-password?token=${token}` . Frontend need to capture the token at send the token to Backend during step 5

#### c. Resend Email

![Resend Email Verification](https://github.com/Tequnity/charonium/assets/128450164/6a47d6a1-15ca-4fde-875b-06ac1008d1ab)

- At step 4, user verification link looks like this: `${FRONTEND_DOMAIN}/verify-email?token=${token}` . Frontend need to capture the token at send the token to Backend during step 5

### Admin User

#### a. Register Admin

![Register Admin](https://github.com/Tequnity/charonium/assets/128450164/13f11a41-b9d5-4a63-86f8-eb5140475715)

- During app boot up, Admin gonna get email at step 1 from Backend API, which is set from ADMIN_EMAIL variable at `.serve.env` file.
- At step 2, Admin verification link looks like this: `${FRONTEND_DOMAIN}/register-admin?token=${token}` . Frontend need to capture the token at send the token to Backend during step 3

#### b. Resend Admin Registration Email

if link expired or forget password, since you can set password also here
![Resend Admin Email](https://github.com/Tequnity/charonium/assets/128450164/a8919bee-5c65-46e5-8b1c-8e07e2d081d2)

- At step 4, Admin verification link looks like this: `${FRONTEND_DOMAIN}/register-admin?token=${token}` . Frontend need to capture the token at send the token to Backend during step 5

<br />

## 2. Upload Image

#### a. Admin upload image

![UploadToS3](https://github.com/Tequnity/charonium/assets/128450164/25d225c8-e4dd-4584-a6d2-4bf3e46c3737)

- At step 2, Frontend should pass the `category` and `fileExtension` to `mutation generatePresignedUrl`. See the example `ERROR.md`
- At step 3, use the pre-signed URL to upload to S3 bucket
- After Frontend uploading image to S3 bucket, save the path in step 6 with this format `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key-from-generatePresignedUrl}` . You can see example in `upload.spec.ts` in end-to-end test folder

<br />

## 3. Referral Tree

#### a. Get Referral Map

- Let's say admin set the `depth=2` in database, by querying `getReferralMap` with arguments `customerId=<UserA ID>` , we would get the map like this:

![diagram-level1](https://github.com/Tequnity/charonium/assets/128450164/44f880c9-8f12-4f6a-ab06-981d14dd04e5)

- To query `getReferralMap` again, pass the arguments `customerId=<UserG ID>` and `startLevel=3` (the level of User G). If argument `startLevel` is not passed, we can still get the right data, but the `level` name will start from 0 (`level0`) instead of `level3`

![diagram-level2](https://github.com/Tequnity/charonium/assets/128450164/ff5417d7-2f6a-468f-b05b-eb8e495a1b03)

<br />

## 4. Handling Coins Purchase

Coins' price is calculated from the created **Package** or **Price per unit**.

#### a. Package

- You can specified `tokenAmount` and `price`
- `name` like ‘Gold’ or ‘Silver’ package . And `description` of the package
- Put the `currency` in `USD`, `EUR` or `GBP` (these are the only supported Fiat Money by Coinbase) or in `BTC`, `ETH` , `DOGE`, `SHIB` , `BCH`, `LTC`, `USDC` etc. (any supported Cryptocurrencies by Coinbase https://help.coinbase.com/en/prime/trading-and-funding/supported-cryptocurrencies-and-trading-pairs )

#### b. Price per unit

- Put the `price` in any amount.
- Put the `currency` in `USD`, `EUR` or `GBP`(these are the only supported Fiat Money by Coinbase) or in `BTC`, `ETH` , `DOGE`, `SHIB`, `BCH`, `LTC`, `USDC` etc. (any supported Cryptocurrencies by Coinbase)

#### c. Coin purchase flow

<img width="2312" alt="CoinbaseCommerce_vtest" src="https://github.com/Tequnity/charonium/assets/128450164/6d9f0975-3fe3-4fb5-b1b2-5739598cbed6">

- Each filled, purple-colored rounded rectangle represents a `PaymentStatus` state in Coinbase Commerce.
- **Token Purchase Process**: Typically, when a user wants to buy a token, a Charge is created. After making payment, the Payment Status transitions from **`NEW`**, to **`PENDING`**, and finally to **`COMPLETED`**, indicating the successful purchase of the coin.
- **Charge Cancellation**: Users can cancel the Charge, which will trigger the **`CANCELLED`** state.
- **Charge Expiry**: If no payment is made within one hour, the state will automatically change to **`EXPIRED`**.
- **Handling Unresolved States**: In certain situations, the state might become **`UNRESOLVED`**, leading to an email notification being sent to the Admin. Manual intervention is required in these cases. For instance:
  - If the Unresolved Reason is **`OVERPAID`**, the admin must manually transfer the excess amount back to the user's wallet and then choose either 'YES' or 'NO' on the 'Payment Accepted' button. A 'YES' selection confirms the **coin's purchase**, and **referrer's commission** are then calculated, while a 'NO' selection means the coin has not been purchased.
  - If the Unresolved Reason is **`MULTIPLE`**, it indicates multiple payments were made for the same Charge. Again, the admin must manually transfer the excess amount back to the user's wallet and choose 'YES' or 'NO' on the 'Payment Accepted' button. The admin should check the icon in the list to see if the coin has been purchased before deciding on 'YES' or 'NO'.

#### d. Frontend Actions for Successful or Cancelled Payments

- If the user clicks “cancel payment”, Coinbase will redirect them to:
  `cancel_url: "https://<FRONTEND_DOMAIN>/payment-cancelled"`
- If the user successfully makes a payment, Coinbase will redirect them to:
  `redirect_url: "https://<FRONTEND_DOMAIN>/payment-success"`
- Note that the provided URL must be valid and cannot be a `localhost` URL. To simulate a real URL, you can use `ngrok`. Follow the steps below to set it up:

  ```bash
  # Install ngrok globally
  npm install -g ngrok

  # Authenticate your ngrok agent. This step is required only once.
  # The authtoken is saved in the default configuration file.
  ngrok config add-authtoken <Authtoken-from-ngrok-website>

  # Point to localhost:5000
  ngrok http 5000
  ```

<br />

## 5. Email templates

All email templates can be found in `<root>/apps/customer-api/email-templates`. You are welcome to modify the HTML template designs as needed.

| Email Type                 | Template Name                             |
| -------------------------- | ----------------------------------------- |
| VERIFICATION               | `verification.html`                       |
| PASSWORD_RESET             | `reset-password.html`                     |
| ADMIN_REGISTRATION         | `admin-registration.html`                 |
| WELCOME                    | `user-welcome.html`, `admin-welcome.html` |
| UNRESOLVED_UNDERPAID       | `payment-underpaid.html`                  |
| ADMIN_UNRESOLVED_UNDERPAID | `admin-payment-underpaid.html`            |
| ADMIN_UNRESOLVED_OVERPAID  | `admin-payment-overpaid.html`             |
| ADMIN_UNRESOLVED_DELAYED   | `admin-payment-delayed.html`              |
| ADMIN_UNRESOLVED_MULTIPLE  | `admin-payment-multiple.html`             |
| ADMIN_UNRESOLVED_OTHER     | `admin-payment-other.html`                |
