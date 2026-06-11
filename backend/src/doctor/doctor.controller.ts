import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.DOCTOR) 
@Controller('doctor')
export class DoctorController {
  constructor(private readonly service: DoctorService) {}

  @Get('my-patients')
  getPatients(@Request() req: any, @Query('doctorId') doctorId?: string) {
    const { userId, role } = req.user; 
    
    // Nếu là ADMIN và có truyền doctorId lên, ta ép kiểu sang số để truyền xuống service
    const targetDoctorId = (role === 'ADMIN' && doctorId) ? Number(doctorId) : userId;

    return this.service.getMyPatients(targetDoctorId, role, !!doctorId);
  }

  @Get('my-records')
  getRecords(@Request() req: any, @Query('doctorId') doctorId?: string) {
    const { userId, role } = req.user;

    // Tương tự, nếu admin truyền doctorId thì lấy ID đó, không thì dùng userId của chính mình
    const targetDoctorId = (role === 'ADMIN' && doctorId) ? Number(doctorId) : userId;

    return this.service.getMedicalRecords(targetDoctorId, role, !!doctorId);
  }
}