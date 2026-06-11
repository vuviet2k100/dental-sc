import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto) {
    const existingPatient = await this.prisma.patient.findUnique({
      where: { phone: createPatientDto.phone },
    });

    if (existingPatient) {
      throw new BadRequestException('Số điện thoại này đã được đăng ký!');
    }

    return this.prisma.patient.create({
      data: {
        name: createPatientDto.name,
        phone: createPatientDto.phone,
        birthDate: createPatientDto.birthDate ? new Date(createPatientDto.birthDate) : null,
        gender: createPatientDto.gender,
        address: createPatientDto.address,
      },
    });
  }

  async findAll() {
    return this.prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          include: { doctor: true },
          orderBy: { appointmentTime: 'desc' }
        },
        medicalRecords: {
          include: { doctor: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!patient) throw new NotFoundException(`Không tìm thấy bệnh nhân với ID: ${id}`);
    return patient;
  }

  async update(id: number, updatePatientDto: UpdatePatientDto) {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    if (!patient) throw new NotFoundException('Không tìm thấy bệnh nhân này!');

    const data: any = { ...updatePatientDto };
    if (updatePatientDto.birthDate) {
      data.birthDate = new Date(updatePatientDto.birthDate);
    }

    return this.prisma.patient.update({
      where: { id },
      data: data,
    });
  }

  /**
   * Sử dụng $transaction để đảm bảo tính toàn vẹn dữ liệu.
   * Xóa tất cả dữ liệu liên quan trước khi xóa bệnh nhân.
   */
  async remove(id: number) {
    return await this.prisma.$transaction(async (tx) => {
    // 1. Tìm tất cả Bệnh án của bệnh nhân này
    const medicalRecords = await tx.medicalRecord.findMany({
      where: { patientId: id },
      select: { id: true }
    });

    const recordIds = medicalRecords.map(r => r.id);

    // 2. Xóa toàn bộ ảnh liên quan đến các Bệnh án đó (Phải xóa bảng con trước)
    if (recordIds.length > 0) {
      await tx.treatmentImage.deleteMany({
        where: { medicalRecordId: { in: recordIds } }
      });
    }

    // 3. Xóa các Bệnh án
    await tx.medicalRecord.deleteMany({ where: { patientId: id } });

    // 4. Xóa Lịch hẹn
    await tx.appointment.deleteMany({ where: { patientId: id } });

    // 5. Cuối cùng mới xóa Bệnh nhân
    const patient = await tx.patient.delete({
      where: { id },
    });
    
    return patient;
  });
  }

  async findByDoctorId(doctorId: number) {
    return this.prisma.patient.findMany({
      where: { 
        medicalRecords: { 
          some: { doctorId: doctorId } 
        } 
      },
      distinct: ['id'] // Đảm bảo không bị trùng nếu bệnh nhân có nhiều bệnh án với 1 bác sĩ
    });
  }
}