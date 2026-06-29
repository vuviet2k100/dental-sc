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
      include: { 
        patient: true, 
        doctor: { select: { name: true, department: true } }, 
        staff: { select: { name: true, department: true } } 
      },
    });
  }

  // 3. Dùng cho remove (Cần 1 tham số: id)
  async remove(id: number) {
    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  async create(dto: any, staffId: number) {
    return this.prisma.appointment.create({
      data: { ...dto, staffId: staffId },
      include: { patient: true, doctor: true, staff: true },
    });
  }

  async update(id: number, data: any, user: any) {
    const currentUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!currentUser) throw new Error("User không tồn tại");

    // Dùng object tạm để gom dữ liệu hợp lệ
    let fieldsToUpdate: any = {};

    // Logic phân quyền
    if (currentUser.role === 'ADMIN') {
      fieldsToUpdate = data; 
    } 
    else if (currentUser.role === 'DOCTOR') {
      fieldsToUpdate = {
        status: data.status,
        type: data.type,
        note: data.note,
        service: data.service,
        saleNote: data.saleNote,
        revenue: data.revenue,
      };
    }
    else if (currentUser.department === 'RECEPTION') {
      fieldsToUpdate = {
        appointmentTime: data.appointmentTime,
        note: data.note,
        status: data.status,
        service: data.service,
        source: data.source,
        type: data.type,
        doctorId: data.doctorId,
        patientId: data.patientId,
        staffId: data.staffId,
      };
    } 
    else if (currentUser.department === 'TELE_SALE') {
      fieldsToUpdate = {
        appointmentTime: data.appointmentTime,
        saleNote: data.saleNote,
        revenue: data.revenue,
        teleNote: data.teleNote,
        status: data.status, 
        type: data.type,
        note: data.note, 
        service: data.service, 
        source: data.source,
      };
    }

    // Lọc sạch dữ liệu: Chỉ lấy những field có giá trị (không phải undefined)
    const updateData = Object.fromEntries(
      Object.entries(fieldsToUpdate).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(updateData).length === 0) {
      throw new Error("Không có dữ liệu hợp lệ để cập nhật hoặc bạn không có quyền!");
    }

    // Log debug (bạn có thể bỏ nếu thấy ổn định)
    console.log("Dữ liệu update thực tế:", updateData);

    return this.prisma.appointment.update({
      where: { id },
      data: updateData,
      include: { patient: true, doctor: true, staff: true },
    });
  }

  async findAll(staffId?: number, type?: string) {
    const where: any = {};
    if (staffId) where.staffId = staffId;
    if (type) where.type = type;

    return await this.prisma.appointment.findMany({
      where: where,
      include: { 
        patient: { select: { name: true, phone: true } }, 
        doctor: { select: { name: true, department: true } }, // Đã thêm department
        staff: { select: { name: true, department: true } }   // Đã thêm department
      },
      orderBy: { appointmentTime: 'asc' }
    });
  }
}