import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  getStats() {
    throw new Error('Method not implemented.');
  }
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
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
}
}
