import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: { ...data, password: hashedPassword, role: (data.role as Role) || Role.PATIENT }
    });
  }

  async findAll(role?: Role) {
    return this.prisma.user.findMany({ where: role ? { role } : {} });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User không tồn tại');
    return user;
  }

  async update(id: number, data: any) {
    await this.findOne(id);
    const { password, ...updateData } = data;
    return this.prisma.user.update({ where: { id }, data: updateData });
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    // Sử dụng transaction để đảm bảo an toàn dữ liệu
    return await this.prisma.$transaction(async (tx) => {
      if (user.role === Role.DOCTOR || user.role === Role.STAFF) {
        await tx.appointment.deleteMany({ where: { OR: [{ doctorId: id }, { patientId: id }] } });
        await tx.medicalRecord.deleteMany({ where: { doctorId: id } });
      } else if (user.role === Role.PATIENT) {
        await tx.appointment.deleteMany({ where: { patientId: id } });
        await tx.medicalRecord.deleteMany({ where: { patientId: id } });
      }
      return await tx.user.delete({ where: { id } });
    });
  }

  async resetPassword(id: number) {
  const newPassword = '123456'; // Mật khẩu mặc định mới
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return this.prisma.user.update({
    where: { id },
    data: { password: hashedPassword }
  });
}
}