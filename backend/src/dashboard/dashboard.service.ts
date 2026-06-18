import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    try {
      const [
        patients,
        appointments,
        doctors,
        staff,
      ] = await Promise.all([
        this.prisma.patient.count(),
        this.prisma.appointment.count(),
        this.prisma.user.count({ where: { role: 'DOCTOR' } }),
        this.prisma.user.count({ where: { role: 'STAFF' } }),
      ]);

      return {
        patients,
        appointments,
        doctors,
        staff,
      };
    } catch (error) {
      console.error("LỖI DB TẠI DASHBOARD SERVICE:", error);
      throw error; // Để controller bắt lấy lỗi này
    }
  }
}