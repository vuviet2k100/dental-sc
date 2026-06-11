import { Controller, Get, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { StaffService } from './staff.service';
import { Roles } from '../auth/decorators/role.decorator';
import { Role, AppointmentStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly service: StaffService) {}

  // Cho phép Bác sĩ xem danh sách bệnh nhân
  @Get('patients')
  @Roles(Role.ADMIN, Role.STAFF, Role.DOCTOR)
  getPatients() {
    return this.service.getAllPatients();
  }

  // Cho phép Bác sĩ xem danh sách lịch hẹn
  @Get('appointments')
  @Roles(Role.ADMIN, Role.STAFF, Role.DOCTOR)
  getAppointments() {
    return this.service.getAllAppointments();
  }

  // CHỈ ADMIN & STAFF mới được đổi trạng thái
  @Patch('appointments/:id/status')
  @Roles(Role.ADMIN, Role.STAFF)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: AppointmentStatus
  ) {
    return this.service.updateAppointmentStatus(id, status);
  }
}