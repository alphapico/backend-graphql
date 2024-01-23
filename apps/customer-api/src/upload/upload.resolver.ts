import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UploadService } from './upload.service';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser, DESCRIPTION, IJwtPayload } from '@styx/common';
import { UploadInput } from './dto/upload.input';
import { SaveImageInput } from './dto/save-image.input';
import { Image } from './dto/image.dto';
import { PresignedUrl } from './dto/presigned-url.dto';
import { PresignedPost } from './dto/presigned-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver('Upload')
export class UploadResolver {
  constructor(private readonly uploadService: UploadService) {}

  @Mutation(() => PresignedPost)
  @UseGuards(AdminGuard)
  async generatePresignedPost(
    @Args('uploadInput') uploadInput: UploadInput,
    @CurrentUser() user: IJwtPayload
  ): Promise<PresignedPost> {
    return this.uploadService.generatePresignedPost(uploadInput, user.sub);
  }

  @Mutation(() => PresignedUrl, {
    description: DESCRIPTION.GENERATE_PRESIGNED_URL,
  })
  @UseGuards(JwtAuthGuard)
  async generatePresignedUrl(
    @Args({ name: 'uploadInput', type: () => UploadInput })
    uploadInput: UploadInput,
    @CurrentUser() user: IJwtPayload
  ): Promise<PresignedUrl> {
    return this.uploadService.generatePresignedUrl(uploadInput, user.sub);
  }

  @Mutation(() => [PresignedUrl])
  @UseGuards(AdminGuard)
  async generatePresignedUrls(
    @Args({ name: 'uploadInputs', type: () => [UploadInput] })
    uploadInputs: UploadInput[],
    @CurrentUser() user: IJwtPayload
  ): Promise<PresignedUrl[]> {
    return this.uploadService.generatePresignedUrls(uploadInputs, user.sub);
  }

  @Mutation(() => Image, { description: DESCRIPTION.SAVE_UPLOADED_IMAGE })
  @UseGuards(JwtAuthGuard)
  async saveUploadedImage(
    @Args('saveImageInput', { type: () => SaveImageInput })
    saveImageInput: SaveImageInput
  ): Promise<Image> {
    return this.uploadService.saveUploadedImage(saveImageInput);
  }
}
