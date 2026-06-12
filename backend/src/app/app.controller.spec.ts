import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Giả sử bạn dùng guard này
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Dental System API is Running! (v1.0.0)';
  }
  constructor(private readonly appService: AppService) {}

  @Get('dashboard')
  @Roles(Role.ADMIN) // Chỉ Admin mới được vào
  @UseGuards(JwtAuthGuard, RolesGuard) // Phải đăng nhập và check role
  getDashboard() {
    return { message: "Chào mừng Admin đến với Dashboard!" };
  }
}