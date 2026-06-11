import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly service: UsersService) {}

  @Post() 
  @Roles(Role.ADMIN) 
  create(@Body() body: any) { 
    return this.service.create(body); 
  }

  // ĐÃ SỬA: Cho phép DOCTOR được truy cập để xem danh sách (ví dụ: khi hiển thị danh sách bác sĩ trong dropdown)
  @Get() 
  @Roles(Role.ADMIN, Role.STAFF, Role.DOCTOR) 
  findAll(@Query('role') role?: string) {
    // Nếu truyền role, filter theo role đó, nếu không thì lấy tất cả
    return this.service.findAll(role as Role); 
  }

  @Get(':id') 
  @Roles(Role.ADMIN, Role.STAFF, Role.DOCTOR) // Cho phép xem chi tiết
  findOne(@Param('id', ParseIntPipe) id: number) { 
    return this.service.findOne(id); 
  }

  @Patch(':id') 
  @Roles(Role.ADMIN, Role.STAFF) 
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) { 
    return this.service.update(id, body); 
  }

  @Delete(':id') 
  @Roles(Role.ADMIN) 
  remove(@Param('id', ParseIntPipe) id: number) { 
    return this.service.remove(id); 
  }

  @Patch(':id/reset-password')
  @Roles(Role.ADMIN) // Chỉ Admin mới được reset
  async resetPassword(@Param('id', ParseIntPipe) id: number) {
  // Logic: Đặt mật khẩu về mặc định là '123456' hoặc random
  return this.service.resetPassword(Number(id));
}
}