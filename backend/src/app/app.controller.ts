import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('dashboard')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('dashboard')
  getHello(): string {
    return 'hello world';
  }

  // Thêm Decorator ở đây
  @Public()
  @Get('stats') 
  async getStats() {
    return this.appService.getDashboardStats();
  }
}