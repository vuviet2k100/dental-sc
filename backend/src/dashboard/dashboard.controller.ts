import { Controller, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator'; // Sửa lại tên file import nếu bạn đặt là số nhiều (roles.decorator)
import { DashboardService } from './dashboard.service';
import { Role } from '@prisma/client'; // ✨ BỔ SUNG: Import Enum Role chuẩn từ Prisma

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard) // ĐÚNG THỨ TỰ: Kiểm tra Token trước, phân quyền sau
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.STAFF) // ✨ CẬP NHẬT: Dùng Role.ADMIN từ Prisma thay vì chuỗi thô 'ADMIN' để đồng bộ Type
  getDashboard() {
    // ✨ CẬP NHẬT: Đổi từ getStats() thành getDashboardStats() để khớp với hàm trong Service của bạn
    return this.dashboardService.getDashboardStats(); 
  }
}