import { Controller, Get, Post, Delete, Body, Param, UseGuards, Patch, Query, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from '@prisma/client';
import { AppointmentsService } from './appointment.service'; // Đảm bảo đúng file service
import { Public } from '../auth/decorators/public.decorator';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentsService) {}

  @Public()
  @Get('stats') 
  async getStats() {
    return this.appointmentService.getDashboardStats();
  }

  @Post()
  @Roles(Role.ADMIN, Role.STAFF) 
  create(@Body() data: CreateAppointmentDto, @Req() req: any) {
    // req.user.id được lấy từ JWT qua JwtAuthGuard
    return this.appointmentService.create(data, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.STAFF, Role.DOCTOR) 
  async findAll(@Query('staffId') staffId?: string) {
    return this.appointmentService.findAll(staffId ? parseInt(staffId) : undefined);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.STAFF, Role.DOCTOR)
  findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(+id);
  }

  @Patch(':id') 
  @Roles(Role.ADMIN, Role.STAFF)
  update(@Param('id') id: string, @Body() data: any) {
    // Controller này sẽ gọi hàm update đã được xử lý an toàn trong Service
    return this.appointmentService.update(+id, data); 
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.STAFF) 
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(+id);
  }
}