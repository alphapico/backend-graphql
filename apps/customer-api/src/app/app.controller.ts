import { Controller, Get, HttpCode, Header } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import { AppService } from './app.service';

@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(StatusCodes.OK)
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  getData() {
    return this.appService.checkHealth();
  }
}
