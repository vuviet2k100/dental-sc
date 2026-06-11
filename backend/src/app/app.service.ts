import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    // Đếm song song tất cả các bảng trong Database
    const [totalPatients, totalAppointments, totalRecords, waitingAppointments] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.appointment.count(),
      this.prisma.medicalRecord.count(),
      this.prisma.appointment.count({
        where: { status: 'WAITING' } // Đếm xem có bao nhiêu ca đang chờ duyệt
      })
    ]);

    return {
      totalPatients,
      totalAppointments,
      totalRecords,
      waitingAppointments,
      serverTime: new Date()
    };
  }
}