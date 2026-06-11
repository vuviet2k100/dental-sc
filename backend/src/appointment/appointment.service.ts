import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    // Ví dụ: đếm số lượng lịch hẹn trong hệ thống
    const totalAppointments = await this.prisma.appointment.count();
    return {
      total: totalAppointments,
      // Thêm các thông số khác nếu cần
    };
  }

  async create(dto: any) {
    return this.prisma.appointment.create({
      data: {
        appointmentTime: new Date(dto.appointmentTime),
        note: dto.note || "",
        status: 'WAITING',
        patientId: Number(dto.patientId),
        doctorId: Number(dto.doctorId),
        staffId: dto.staffId ? Number(dto.staffId) : null, // staffId có thể null
      },
      include: { patient: true, doctor: true, staff: true },
    });
  }

  // ĐÃ SỬA: Thêm tham số staffId vào đây
  async findAll(staffId?: number) {
    const where: any = {};
    if (staffId) {
      where.staffId = staffId;
    }
    
    return this.prisma.appointment.findMany({
      // Nếu có staffId thì lọc, nếu không thì lấy tất cả
      where: staffId ? { staffId: staffId } : {}, 
      include: { patient: true, doctor: true },
      orderBy: { appointmentTime: 'asc' }
    });
  }

  async findOne(id: number) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, doctor: true },
    });
  }

  async update(id: number, dto: any) {
    return this.prisma.appointment.update({
      where: { id },
      data: {
        appointmentTime: dto.appointmentTime ? new Date(dto.appointmentTime) : undefined,
        patientId: dto.patientId ? Number(dto.patientId) : undefined,
        doctorId: dto.doctorId ? Number(dto.doctorId) : undefined,
        note: dto.note,
        status: dto.status,
      },
      include: { patient: true, doctor: true },
    });
  }

  async remove(id: number) {
    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  // Hàm này giờ có thể dùng chung hoặc xóa đi vì hàm findAll ở trên đã bao trùm cả logic này
  async findByStaffId(staffId: number) {
    return this.prisma.appointment.findMany({
      where: { staffId: staffId },
      include: { patient: true, doctor: true },
      orderBy: { appointmentTime: 'asc' }
    });
  }
}