import { Scalar } from '@nestjs/graphql';

@Scalar('JSON', () => JSON)
export class JSONScalar { }