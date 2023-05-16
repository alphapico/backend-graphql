import { clearCookies, graphQLClient, httpUrl } from '../support/test-setup';
import { gql, GraphQLClient } from 'graphql-request';
import {
  clearDatabase,
  connectToDatabase,
  disconnectFromDatabase,
} from '../support/test-utils';
import { Test } from '@nestjs/testing';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { CONFIG, IJwtPayload } from '@charonium/common';
import { PrismaModule, PrismaService } from '@charonium/prisma';
import { Customer, Image } from '@prisma/client';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import Blob from 'fetch-blob';
import FormData from 'form-data';

describe('Upload', () => {
  console.log('Running Upload tests');

  let jwtService: JwtService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    await connectToDatabase();

    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: CONFIG.ACCESS_TOKEN_EXPIRATION },
        }),
        PrismaModule,
      ],
    }).compile();

    jwtService = moduleRef.get<JwtService>(JwtService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await clearDatabase();
    // Clear cookies before running the test
    clearCookies();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
  });

  const registerAdminMutation = gql`
    mutation RegisterAdmin($input: RegisterAdminInput!) {
      registerAdmin(input: $input)
    }
  `;

  const loginMutation = gql`
    mutation Login($input: LoginInput!) {
      login(input: $input)
    }
  `;

  const generatePresignedUrlMutation = gql`
    mutation GeneratePresignedUrl($uploadInput: UploadInput!) {
      generatePresignedUrl(uploadInput: $uploadInput) {
        presignedUrl
        key
      }
    }
  `;

  const generatePresignedPostMutation = gql`
    mutation GeneratePresignedPost($uploadInput: UploadInput!) {
      generatePresignedPost(uploadInput: $uploadInput) {
        url
        fields {
          key
          value
        }
      }
    }
  `;

  const saveUploadedImageMutation = gql`
    mutation SaveUploadedImage($saveImageInput: SaveImageInput!) {
      saveUploadedImage(saveImageInput: $saveImageInput) {
        imageId
        path
        createdAt
      }
    }
  `;

  it('should upload image successfully using presigned URL', async () => {
    // Admin login
    const admin: Customer = await prismaService.customer.findUnique({
      where: { email: process.env.ADMIN_EMAIL },
    });

    const adminPayload: IJwtPayload = {
      sub: admin.customerId,
      email: admin.email,
      role: admin.customerRole,
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

    const adminLoginInput = {
      email: process.env.ADMIN_EMAIL,
      password: 'admin_password12345',
    };

    const loginResponse = await graphQLClient.rawRequest(loginMutation, {
      input: adminLoginInput,
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

    const graphQLClientWithAdminAccessToken = new GraphQLClient(httpUrl, {
      credentials: 'include',
      headers: {
        cookie: `access_token=${accessToken}`,
      },
    });

    // Generate a presigned URL
    const uploadInput = {
      category: 'test',
      fileExtension: 'jpg',
    };

    const presignedUrlResponse: {
      generatePresignedUrl: { presignedUrl; key };
    } = await graphQLClientWithAdminAccessToken.request(
      generatePresignedUrlMutation,
      {
        uploadInput: uploadInput,
      }
    );

    expect(presignedUrlResponse.generatePresignedUrl).toBeDefined();

    // Upload a file to S3
    const filePath = path.join(__dirname, '../assets/pointer_on_c.jpg');
    // const filePath = path.join(__dirname, '../assets/coconut_tree.JPG');
    const buffer = fs.readFileSync(filePath); // Replace this with an actual image file
    const uploadResponse = await fetch(
      presignedUrlResponse.generatePresignedUrl.presignedUrl,
      {
        method: 'PUT',
        body: buffer,
        headers: {
          'Content-Type': `image/${
            uploadInput.fileExtension === 'jpg'
              ? 'jpeg'
              : uploadInput.fileExtension
          }`,
        },
      }
    );

    // console.log(await uploadResponse.text());
    // console.log({ uploadResponse });

    expect(uploadResponse.ok).toBe(true);

    const s3FileUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${presignedUrlResponse.generatePresignedUrl.key}`;

    // Save the uploaded image
    const saveImageInput = {
      path: s3FileUrl,
    };

    const saveImageResponse: { saveUploadedImage: Image } =
      await graphQLClientWithAdminAccessToken.request(
        saveUploadedImageMutation,
        {
          saveImageInput: saveImageInput,
        }
      );

    expect(saveImageResponse.saveUploadedImage).toBeDefined();
    expect(saveImageResponse.saveUploadedImage.path).toEqual(
      saveImageInput.path
    );
  });

  //   it('should upload image successfully using presigned POST', async () => {
  //     // Admin login
  //     const admin: Customer = await prismaService.customer.findUnique({
  //       where: { email: process.env.ADMIN_EMAIL },
  //     });

  //     const adminPayload: IJwtPayload = {
  //       sub: admin.customerId,
  //       email: admin.email,
  //       role: admin.customerRole,
  //     };

  //     const adminRegistrationToken = jwtService.sign(adminPayload);

  //     const registerAdminInput = {
  //       token: adminRegistrationToken,
  //       newName: 'Admin User',
  //       newPassword: 'admin_password12345',
  //     };

  //     await graphQLClient.request(registerAdminMutation, {
  //       input: registerAdminInput,
  //     });

  //     const adminLoginInput = {
  //       email: process.env.ADMIN_EMAIL,
  //       password: 'admin_password12345',
  //     };

  //     const loginResponse = await graphQLClient.rawRequest(loginMutation, {
  //       input: adminLoginInput,
  //     });

  //     // Get the 'set-cookie' response header containing the access token
  //     const cookiesString = loginResponse.headers.get('set-cookie');
  //     const cookies = cookiesString.split(', ');
  //     const accessTokenHeader = cookies.find((cookie: string) =>
  //       cookie.startsWith('access_token=')
  //     );

  //     if (!accessTokenHeader) {
  //       throw new Error('Access token not found in the response headers');
  //     }

  //     const accessToken = accessTokenHeader
  //       .replace('access_token=', '')
  //       .split(';')[0];

  //     const graphQLClientWithAdminAccessToken = new GraphQLClient(httpUrl, {
  //       credentials: 'include',
  //       headers: {
  //         cookie: `access_token=${accessToken}`,
  //       },
  //     });

  //     // Generate a presigned URL
  //     const uploadInput = {
  //       category: 'test',
  //       fileExtension: 'jpg',
  //     };

  //     const presignedPostResponse: {
  //       generatePresignedPost: { url; fields };
  //     } = await graphQLClientWithAdminAccessToken.request(
  //       generatePresignedPostMutation,
  //       {
  //         uploadInput: uploadInput,
  //       }
  //     );

  //     expect(presignedPostResponse.generatePresignedPost).toBeDefined();

  //     // Upload a file to S3
  //     const filePath = path.join(__dirname, '../assets/pointer_on_c.jpg');
  //     const buffer = fs.readFileSync(filePath);
  //     const formData = new FormData();
  //     presignedPostResponse.generatePresignedPost.fields.forEach(
  //       ({ key, value }) => {
  //         formData.append(key, value);
  //       }
  //     );

  //     formData.append('file', buffer);

  //     const uploadResponse = await fetch(
  //       presignedPostResponse.generatePresignedPost.url,
  //       {
  //         method: 'POST',
  //         body: formData,
  //       }
  //     );

  //     console.log(await uploadResponse.text());

  //     expect(uploadResponse.ok).toBe(true);

  //     const keyField = presignedPostResponse.generatePresignedPost.fields.find(
  //       (field) => field.key === 'key'
  //     );

  //     if (!keyField) {
  //       throw new Error('Key not found in the response fields');
  //     }

  //     const s3FileUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${keyField.value}`;

  //     // Save the uploaded image
  //     const saveImageInput = {
  //       path: s3FileUrl,
  //     };

  //     const saveImageResponse: { saveUploadedImage: Image } =
  //       await graphQLClientWithAdminAccessToken.request(
  //         saveUploadedImageMutation,
  //         {
  //           saveImageInput: saveImageInput,
  //         }
  //       );

  //     expect(saveImageResponse.saveUploadedImage).toBeDefined();
  //     expect(saveImageResponse.saveUploadedImage.path).toEqual(
  //       saveImageInput.path
  //     );
  //   });
});
