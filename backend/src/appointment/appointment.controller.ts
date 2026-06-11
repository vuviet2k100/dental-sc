import { Controller, Get, Post, Delete, Body, Param, UseGuards, Patch, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from '@prisma/client';
import { AppointmentsService } from './appointment.service';
import { Req } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentsService) {}

@Public() // <--- Thêm dòng này ở đây
@Get('stats') 
async getStats() {
  return this.appointmentService.getDashboardStats();
}
  @Post()
  @Roles(Role.ADMIN, Role.STAFF) 
  create(@Body() data: any, @Req() req: any) {
    const staffId = req.user.id;
    return this.appointmentService.create({ ...data, staffId });
  }

  // API Duy nhất để lấy danh sách: Hỗ trợ lọc qua query string ?staffId=...
  @Get()
  @Roles(Role.ADMIN, Role.STAFF, Role.DOCTOR) 
  async findAll(@Query('staffId') staffId?: string) {
    const id = staffId ? parseInt(staffId) : undefined;
    return this.appointmentService.findAll(id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.STAFF, Role.DOCTOR)
  findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(+id);
  }

  @Patch(':id') 
  @Roles(Role.ADMIN, Role.STAFF)
  update(@Param('id') id: string, @Body() data: any) {
    return this.appointmentService.update(+id, data); 
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.STAFF) 
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(+id);
  }
}