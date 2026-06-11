import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DoctorService {
  constructor(private prisma: PrismaService) {}

  // Lấy danh sách bệnh nhân dựa vào trường doctorId trong bảng Appointment
  async getMyPatients(doctorId: number, role: string, hasDoctorIdQuery: boolean) {
    // Nếu là ADMIN và KHÔNG click vào bác sĩ cụ thể -> Lấy tất cả lịch hẹn
    // Ngược lại (Doctor tự xem, hoặc Admin click đích danh 1 Bác sĩ) -> Lọc theo doctorId
    const filter = (role === 'ADMIN' && !hasDoctorIdQuery) ? {} : { doctorId };

    return this.prisma.appointment.findMany({
      where: filter,
      include: { 
        patient: true // Lấy kèm thông tin bệnh nhân
      },
      distinct: ['patientId'] // Đảm bảo một bệnh nhân không bị lặp lại nhiều lần
    });
  }

  // Lấy danh sách bệnh án dựa vào trường doctorId trong bảng MedicalRecord
  async getMedicalRecords(doctorId: number, role: string, hasDoctorIdQuery: boolean) {
    const filter = (role === 'ADMIN' && !hasDoctorIdQuery) ? {} : { doctorId };
    
    return this.prisma.medicalRecord.findMany({
      where: filter,
      include: { 
        patient: true 
      }
    });
  }
}