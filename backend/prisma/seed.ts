import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Nạp file .env từ thư mục gốc backend
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ LỖI: Không tìm thấy DATABASE_URL trong file .env!");
  process.exit(1);
}

async function main() {
  // Khởi tạo client kết nối trực tiếp PostgreSQL
  const client = new Client({ connectionString });
  
  console.log('🚀 Đang kết nối trực tiếp tới PostgreSQL qua SQL thuần...');
  await client.connect();

  try {
    console.log('🌱 Đang làm sạch dữ liệu cũ trong các bảng...');
    // Dùng TRUNCATE CASCADE để xóa sạch dữ liệu cũ và reset luôn cả ID tự tăng (autoincrement) về 1
    await client.query('TRUNCATE TABLE "TreatmentImage", "MedicalRecord", "Appointment", "Patient", "Users" RESTART IDENTITY CASCADE;');

    console.log('👥 Đang mã hóa mật khẩu và tạo User/Bác sĩ...');
    const hashedPassword = await bcrypt.hash('pass123', 10);

    // 1. Chèn dữ liệu vào bảng Users (Lưu ý: Tên bảng map trong schema của bạn là "Users")
    const userRes = await client.query(`
      INSERT INTO "Users" (name, email, password, role, "createdAt") 
      VALUES 
      ($1, $2, $3, 'ADMIN', NOW()),
      ($4, $5, $3, 'DOCTOR', NOW()),
      ($6, $7, $3, 'DOCTOR', NOW())
      RETURNING id, name;
    `, [
      'Quản trị viên', 'admin@smilecraft.com', hashedPassword,
      'BS. Nguyễn Văn Trung', 'dr.trung@smilecraft.com',
      'BS. Trần Thị Mai', 'dr.mai@smilecraft.com'
    ]);

    // Lấy ID của các Bác sĩ vừa tạo dựa vào tên
    const doc1Id = userRes.rows.find(u => u.name.includes('Trung')).id;
    const doc2Id = userRes.rows.find(u => u.name.includes('Mai')).id;

    console.log('🏥 Đang tạo danh sách Bệnh nhân...');
    // 2. Chèn dữ liệu vào bảng Patient
    const patientRes = await client.query(`
      INSERT INTO "Patient" (name, phone, gender, "createdAt", "updatedAt") 
      VALUES 
      ($1, $2, $3, NOW(), NOW()),
      ($4, $5, $6, NOW(), NOW())
      RETURNING id;
    `, ['Lê Hoàng Long', '0912345678', 'Nam', 'Phạm Thanh Thảo', '0987654321', 'Nữ']);

    const patient1Id = patientRes.rows[0].id;
    const patient2Id = patientRes.rows[1].id;

    console.log('📅 Đang liên kết tạo Lịch hẹn mẫu...');
    // 3. Chèn dữ liệu vào bảng Appointment (Map chuẩn Enum status WAITING, IN_PROGRESS)
    await client.query(`
      INSERT INTO "Appointment" ("appointmentTime", note, status, "patientId", "doctorId", "createdAt") 
      VALUES 
      (NOW() + INTERVAL '5 days', $1, 'WAITING', $2, $3, NOW()),
      (NOW() + INTERVAL '6 days', $4, 'IN_PROGRESS', $5, $6, NOW());
    `, [
      'Khám răng định kỳ và cạo vôi', patient1Id, doc1Id,
      'Tư vấn niềng răng chuyên sâu', patient2Id, doc2Id
    ]);

    console.log('✨ THÀNH CÔNG MỸ MÃN! Dữ liệu đã được nạp trực tiếp vào Postgres!');
  } catch (error) {
    console.error('❌ Thất bại khi chạy SQL Seed:', error);
  } finally {
    await client.end();
  }
}

main();