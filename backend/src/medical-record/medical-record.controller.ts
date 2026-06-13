import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, ParseIntPipe, UseInterceptors, UploadedFile, 
  Req, BadRequestException, Query, InternalServerErrorException
} from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('medical-record')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Post()
  @Roles(Role.ADMIN, Role.DOCTOR)
  create(@Body() dto: CreateMedicalRecordDto, @Req() req: any) {
    const doctorId = req.user.id;
    return this.medicalRecordService.create({ ...dto, doctorId });
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.STAFF)
  findAll(@Query('doctorId') doctorId?: string) {
    if (doctorId) {
      return this.medicalRecordService.findByDoctorId(Number(doctorId));
    }
    return this.medicalRecordService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.STAFF)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicalRecordService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMedicalRecordDto, @Req() req: any) {
    const currentDoctorId = req.user.role === Role.DOCTOR ? req.user.id : undefined;
    return this.medicalRecordService.update(id, dto, currentDoctorId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medicalRecordService.remove(id);
  }

  @Post('upload/:id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @UseInterceptors(FileInterceptor('file')) 
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Vui lòng chọn tệp tin!');
    
    try {
      return await this.medicalRecordService.uploadImage(file, id);
    } catch (error: unknown) {
      // Ép kiểu lỗi an toàn để tránh lỗi TypeScript 'unknown'
      const message = error instanceof Error ? error.message : 'Lỗi không xác định';
      console.error("Lỗi upload chi tiết:", error);
      
      // Trả về InternalServerError thay vì làm crash server
      throw new InternalServerErrorException(`Không thể tải ảnh lên: ${message}`);
    }
  }

  @Delete('image/:imageId')
  @Roles(Role.ADMIN, Role.DOCTOR)
  removeImage(@Param('imageId', ParseIntPipe) imageId: number) {
    return this.medicalRecordService.removeImage(imageId);
  }
}