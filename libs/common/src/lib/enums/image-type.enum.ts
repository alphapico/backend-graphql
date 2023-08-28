import { registerEnumType } from '@nestjs/graphql';

export enum ImageType {
  CUSTOMER = 'CUSTOMER',
  PACKAGE = 'PACKAGE',
}

registerEnumType(ImageType, { name: 'ImageType' });
