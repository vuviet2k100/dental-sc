import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async getAllPatients() {
    return this.prisma.patient.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllAppointments() {
    return this.prisma.appointment.findMany({
      include: { 
        patient: true, 
        doctor: { select: { name: true } } 
      },
      // Sửa thành appointmentTime theo đúng schema của bạn
      orderBy: { appointmentTime: 'asc' } 
    });
  }

  async updateAppointmentStatus(id: number, status: AppointmentStatus) {
    return this.prisma.appointment.update({
      where: { id },
      data: { status }
    });
  }
}