import { clearCookies, graphQLClient } from '../support/test-setup';
import { gql } from 'graphql-request';
import {
  clearDatabase,
  connectToDatabase,
  disconnectFromDatabase,
} from '../support/test-utils';
import { Test } from '@nestjs/testing';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { CONFIG, ImageType } from '@charonium/common';
import { PrismaModule, PrismaService } from '@charonium/prisma';
import { Customer, Image } from '@prisma/client';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { createAndVerifyAdmin } from './utils/auth-test.utils';
// import Blob from 'fetch-blob';
// import FormData from 'form-data';

describe('Upload', () => {
  // console.log('Running Upload tests');

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

  interface CreateTokenPackageResponse {
    createTokenPackage: {
      packageId: number;
      name: string;
      price: number;
      tokenAmount: number;
      description: string;
      currency: string;
      isActive: boolean;
    };
  }

  interface GetTokenPackageResponse {
    getTokenPackage: {
      packageId: number;
      name: string;
      price: number;
      tokenAmount: number;
      description: string;
      currency: string;
      isActive: boolean;
      image: {
        imageId: number;
        path: string;
      };
    };
  }

  const generatePresignedUrlMutation = gql`
    mutation GeneratePresignedUrl($uploadInput: UploadInput!) {
      generatePresignedUrl(uploadInput: $uploadInput) {
        presignedUrl
        key
      }
    }
  `;

  // const generatePresignedPostMutation = gql`
  //   mutation GeneratePresignedPost($uploadInput: UploadInput!) {
  //     generatePresignedPost(uploadInput: $uploadInput) {
  //       url
  //       fields {
  //         key
  //         value
  //       }
  //     }
  //   }
  // `;

  const saveUploadedImageMutation = gql`
    mutation SaveUploadedImage($saveImageInput: SaveImageInput!) {
      saveUploadedImage(saveImageInput: $saveImageInput) {
        imageId
        path
        createdAt
      }
    }
  `;

  const meQuery = gql`
    query Me {
      me {
        customerId
        image {
          imageId
          path
        }
      }
    }
  `;

  it('should upload customer image successfully using presigned URL', async () => {
    // Admin login and get GraphQL client with admin access token
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    const meResponse: { me: Customer & { image: Image } } =
      await graphQLClientWithAdminAccessToken.request(meQuery);
    const adminCustomerId = meResponse.me.customerId;

    // Generate a presigned URL
    const uploadInput = {
      type: ImageType.CUSTOMER,
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
      type: ImageType.CUSTOMER,
      customerId: adminCustomerId,
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

    // Fetch the admin data using the `me` resolver to verify the image
    const meResponse2: { me: Customer & { image: Image } } =
      await graphQLClientWithAdminAccessToken.request(meQuery);
    expect(meResponse2.me).toBeDefined();
    expect(meResponse2.me.image).toBeDefined();
    expect(meResponse2.me.image.path).toEqual(saveImageInput.path);
  });

  it('should upload token package image successfully using presigned URL', async () => {
    // Admin login and get GraphQL client with admin access token
    const { graphQLClientWithAdminAccessToken } = await createAndVerifyAdmin(
      graphQLClient,
      jwtService,
      prismaService
    );

    // Create a new token package
    const tokenPackageInput = {
      name: 'Gold',
      description: 'Gold package description',
      tokenAmount: 100,
      price: 50,
      currency: 'USD',
      isActive: true,
    };

    const createTokenPackageMutation = gql`
      mutation CreateTokenPackage($input: TokenPackageCreateInput!) {
        createTokenPackage(input: $input) {
          packageId
          name
          description
          tokenAmount
          price
          currency
          isActive
        }
      }
    `;

    const responseCreate =
      await graphQLClientWithAdminAccessToken.request<CreateTokenPackageResponse>(
        createTokenPackageMutation,
        {
          input: tokenPackageInput,
        }
      );

    expect(responseCreate.createTokenPackage).toBeDefined();
    expect(responseCreate.createTokenPackage.packageId).toBeDefined();
    const packageId = responseCreate.createTokenPackage.packageId;

    // Generate a presigned URL for token package image
    const uploadInput = {
      type: ImageType.PACKAGE,
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
    const buffer = fs.readFileSync(filePath);
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

    expect(uploadResponse.ok).toBe(true);

    const s3FileUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${presignedUrlResponse.generatePresignedUrl.key}`;

    // Save the uploaded image for the token package
    const saveImageInput = {
      path: s3FileUrl,
      type: ImageType.PACKAGE,
      packageId: packageId,
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

    // Get Token Package
    const getTokenPackageQuery = gql`
      query GetTokenPackage($packageId: Int!) {
        getTokenPackage(packageId: $packageId) {
          packageId
          name
          description
          tokenAmount
          price
          currency
          isActive
          image {
            imageId
            path
          }
        }
      }
    `;

    // Fetch the token package data to verify the image

    const responseGet =
      await graphQLClientWithAdminAccessToken.request<GetTokenPackageResponse>(
        getTokenPackageQuery,
        {
          packageId: packageId,
        }
      );

    expect(responseGet.getTokenPackage).toBeDefined();
    expect(responseGet.getTokenPackage.image).toBeDefined();
    expect(responseGet.getTokenPackage.image.path).toEqual(saveImageInput.path);
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
