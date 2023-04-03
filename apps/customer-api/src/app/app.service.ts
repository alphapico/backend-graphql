import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  checkHealth(): { message: string } {
    return { message: 'Server is ready' };
  }
}
