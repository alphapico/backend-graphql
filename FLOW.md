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
