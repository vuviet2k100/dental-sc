import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PatientService } from './patient.service';
import { Role } from '@common/enum';
import { Roles } from '@/auth/decorators/role.decorator';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UpdatePatientDto } from './dto/update-patient.dto';


@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.STAFF) // Cần cấp quyền cho các role được xem
  findAll() {
    return this.patientService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.STAFF)
  findOne(@Param('id') id: string) {
    return this.patientService.findOne(+id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.STAFF) // Chỉ Admin/Staff được tạo bệnh nhân
  create(@Body() createPatientDto: any) {
    return this.patientService.create(createPatientDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.STAFF) // Admin/Staff được cập nhật
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientService.update(+id, updatePatientDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN) // Chỉ Admin được xóa
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.patientService.remove(id);
  }

  @Get('my-patients')
  @Roles(Role.DOCTOR)
  async getMyPatients(@Req() req: any) {
    return this.patientService.findByDoctorId(req.user.id);
  }
}