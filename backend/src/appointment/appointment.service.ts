import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  // 1. Dùng cho stats (Không tham số)
  async getDashboardStats() {
    const [patients, appointments, doctors, staff] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.appointment.count(),
      this.prisma.user.count({ where: { role: 'DOCTOR' } }),
      this.prisma.user.count({ where: { role: 'STAFF' } }),
    ]);
    return { patients, appointments, doctors, staff };
  }

  // 2. Dùng cho findOne (Cần 1 tham số: id)
  async findOne(id: number) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, doctor: true, staff: true },
    });
  }

  // 3. Dùng cho remove (Cần 1 tham số: id)
  async remove(id: number) {
    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  // CÁC HÀM CÒN LẠI (Create, Update, FindAll) giữ nguyên như trước...
  async create(dto: any, staffId: number) {
    return this.prisma.appointment.create({
      data: { ...dto, staffId: staffId },
      include: { patient: true, doctor: true, staff: true },
    });
  }

  async update(id: number, data: any) {
    const { id: _id, createdAt: _ca, patient: _p, doctor: _d, staff: _s, ...updateData } = data;
    return this.prisma.appointment.update({
      where: { id },
      data: updateData,
      include: { patient: true, doctor: true, staff: true },
    });
  }

  async findAll(staffId?: number) {
    return this.prisma.appointment.findMany({
      where: staffId ? { staffId } : {},
      include: { patient: true, doctor: true, staff: true },
    });
  }
}