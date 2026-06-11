import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@Injectable()
export class MedicalRecordService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMedicalRecordDto) {
    return this.prisma.medicalRecord.create({
      data: { 
        diagnosis: dto.diagnosis, 
        treatment: dto.treatment, 
        note: dto.note, 
        patientId: dto.patientId, 
        doctorId: dto.doctorId 
      }
    });
  }

  async findAll() {
    return this.prisma.medicalRecord.findMany({
      include: { patient: true, doctor: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Hàm này khớp với Controller: findAll(@Query('doctorId') ...)
  async findByDoctorId(doctorId: number) {
    return this.prisma.medicalRecord.findMany({
      where: { doctorId: doctorId },
      include: { 
        patient: true, 
        doctor: { select: { name: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: number) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: { 
        patient: true, 
        doctor: true,
        images: true 
      }
    });
    if (!record) throw new NotFoundException('Không tìm thấy bệnh án');
    return record;
  }

  async update(id: number, dto: UpdateMedicalRecordDto, currentDoctorId?: number) {
    const record = await this.findOne(id);

    // Kiểm tra quyền (nếu là bác sĩ thì phải đúng bác sĩ tạo bệnh án)
    if (currentDoctorId && record.doctorId !== currentDoctorId) {
      throw new BadRequestException('Bạn không có quyền chỉnh sửa bệnh án này!');
    }
    
    const { patientId, doctorId, ...generalData } = dto;
    const updateData: any = { ...generalData };

    if (patientId !== undefined) updateData.patient = { connect: { id: patientId } };
    if (doctorId !== undefined) updateData.doctor = { connect: { id: doctorId } };

    return this.prisma.medicalRecord.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.treatmentImage.deleteMany({ where: { medicalRecordId: id } });
    return this.prisma.medicalRecord.delete({ where: { id } });
  }

  async updateImage(recordId: number, filename: string) {
    const record = await this.prisma.medicalRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Không tìm thấy bệnh án');

    return this.prisma.treatmentImage.create({
      data: { 
        imageUrl: `/uploads/${filename}`,
        medicalRecordId: recordId 
      }
    });
  }

  async removeImage(id: number) {
    const image = await this.prisma.treatmentImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Không tìm thấy ảnh');
    return await this.prisma.treatmentImage.delete({ where: { id } });
  }
}