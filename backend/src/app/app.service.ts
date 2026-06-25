import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    // Đếm song song tất cả các bảng trong Database
    const [totalPatients, totalAppointments, totalRecords, scheduledAppointments] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.appointment.count(),
      this.prisma.medicalRecord.count(),
      this.prisma.appointment.count({
        where: { status: 'SCHEDULED' } // Đếm xem có bao nhiêu ca đang chờ duyệt
      })
    ]);

    return {
      totalPatients,
      totalAppointments,
      totalRecords,
      scheduledAppointments,
      serverTime: new Date()
    };
  }
}