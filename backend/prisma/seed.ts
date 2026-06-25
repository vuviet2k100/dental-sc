import { PrismaClient, Role, Gender, AppointmentStatus, ServiceType, AppointmentSource } from '@prisma/client';
import { Pool } from 'pg'; 
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_Xb3R6mwZGMhd@ep-red-hall-ao0lpe5f-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🔄 Đang bắt đầu nạp dữ liệu mẫu theo Schema mới...');

  try {
    // 1. Xóa dữ liệu (Đúng thứ tự để không vi phạm khóa ngoại)
    await prisma.treatmentImage.deleteMany();
    await prisma.medicalRecord.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('pass123', 10);

    // 2. Tạo Users (Admin, Doctor, Staff)
    const admin = await prisma.user.create({
      data: { name: 'Quản Trị Viên', email: 'admin@dental.com', password: hashedPassword, role: Role.ADMIN },
    });
    const doctor = await prisma.user.create({
      data: { name: 'BS. Bác Văn Sĩ', email: 'dr.bsi@smilecraft.com', password: hashedPassword, role: Role.DOCTOR },
    });
    const staff = await prisma.user.create({
      data: { name: 'NV. Nhân Thị Viên', email: 'st.nvien@smilecraft.com', password: hashedPassword, role: Role.STAFF },
    });

    // 3. Tạo Patient
    const p1 = await prisma.patient.create({
      data: { name: 'Lê Hoàng Long', phone: '0912345678', gender: Gender.MALE },
    });

    // 4. Tạo Appointment (Đầy đủ các trường nghiệp vụ mới)
    await prisma.appointment.create({
      data: {
        appointmentTime: new Date(),
        status: AppointmentStatus.SCHEDULED,
        note: 'Khách yêu cầu tư vấn niềng răng',
        
        // Trường mới
        service: ServiceType.IMP,
        source: AppointmentSource.ADS,
        teleName: 'Sale Nguyễn Văn A',
        teleNote: 'Khách quan tâm gói trả góp',
        saleNote: 'Đang đợi chốt sale',
        revenue: 0,
        
        patientId: p1.id,
        doctorId: doctor.id,
        staffId: staff.id,
      },
    });

    console.log('✅ Nạp dữ liệu thành công với cấu trúc Schema mới!');
  } catch (error) {
    console.error('❌ Lỗi nạp dữ liệu:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();