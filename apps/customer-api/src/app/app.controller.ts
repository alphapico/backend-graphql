import { Controller, Get, HttpCode } from '@nestjs/common';

import { AppService } from './app.service';

@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(200)
  getData() {
    return this.appService.checkHealth();
  }
}
