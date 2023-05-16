import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { PrismaService } from '@charonium/prisma';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { CONFIG, ERROR_MESSAGES, writeDataToFile } from '@charonium/common';
import { UploadInput } from './dto/upload.input';
import { SaveImageInput } from './dto/save-image.input';
import { Image } from './dto/image.dto';
import { PresignedUrl } from './dto/presigned-url.dto';
import { FieldRecord, PresignedPost } from './dto/presigned-post.dto';

@Injectable()
export class UploadService {
  private readonly s3: S3Client;
  constructor(private readonly prismaService: PrismaService) {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
    });
  }

  async generatePresignedPost(
    uploadInput: UploadInput,
    customerId: number
  ): Promise<PresignedPost> {
    if (!CONFIG.SUPPORTED_IMG_EXTENSIONS.includes(uploadInput.fileExtension)) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_FILE_EXTENSION);
    }

    const hash = crypto
      .createHash('md5')
      .update(`${customerId}_${Date.now()}_${uuid()}`)
      .digest('hex');

    const key = `${uploadInput.category}/${hash}.${uploadInput.fileExtension}`;

    // Write the output to a text file
    // writeDataToFile(`${this.constructor.name}/key.txt`, key);
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      Conditions: [{ acl: 'public-read' }, { bucket: process.env.BUCKET_NAME }],
      Fields: { acl: 'public-read' },
      Expires: CONFIG.PRESIGNED_S3_URL_TTL,
    };

    const presignedPostData = await createPresignedPost(this.s3, params);
    // Write the output to a text file
    // writeDataToFile(
    //   `${this.constructor.name}/presigned-post.txt`,
    //   presignedPostData
    // );

    const fieldsArray: FieldRecord[] = Object.entries(
      presignedPostData.fields
    ).map(([key, value]) => ({ key, value }));

    const presignedPost: PresignedPost = {
      url: presignedPostData.url,
      fields: fieldsArray,
    };

    return presignedPost;
  }

  async generatePresignedUrl(
    uploadInput: UploadInput,
    customerId: number
  ): Promise<PresignedUrl> {
    if (!CONFIG.SUPPORTED_IMG_EXTENSIONS.includes(uploadInput.fileExtension)) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_FILE_EXTENSION);
    }

    try {
      const hash = crypto
        .createHash('md5')
        .update(`${customerId}_${Date.now()}_${uuid()}`)
        .digest('hex');

      const key = `${uploadInput.category}/${hash}.${uploadInput.fileExtension}`;

      // Write the output to a text file
      // writeDataToFile(`${this.constructor.name}/key.txt`, key);

      const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
        ACL: 'public-read',
        ContentType: `image/${
          uploadInput.fileExtension === 'jpg'
            ? 'jpeg'
            : uploadInput.fileExtension
        }`,
      });

      const presignedUrl = await getSignedUrl(this.s3, command, {
        expiresIn: CONFIG.PRESIGNED_S3_URL_TTL,
      });

      // Write the output to a text file
      // writeDataToFile(`${this.constructor.name}/presignedUrl.txt`, presignedUrl);

      return { presignedUrl, key };
    } catch (error) {
      throw new InternalServerErrorException(
        ERROR_MESSAGES.FAILED_GENERATE_PRESIGNED_URL
      );
    }
  }

  async generatePresignedUrls(
    uploadInputs: UploadInput[],
    customerId: number
  ): Promise<PresignedUrl[]> {
    return Promise.all(
      uploadInputs.map((uploadInput) => {
        return this.generatePresignedUrl(uploadInput, customerId);
      })
    );
  }

  async saveUploadedImage(saveImageInput: SaveImageInput): Promise<Image> {
    // Write the output to a text file
    // writeDataToFile(
    //   `${this.constructor.name}/save-image.txt`,
    //   saveImageInput.path
    // );
    return this.prismaService.image.create({
      data: {
        path: saveImageInput.path,
      },
    });
  }
}
