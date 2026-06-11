import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('appointments')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('dashboard')
  getStats() {
    return this.appService.getDashboardStats();
  }
}