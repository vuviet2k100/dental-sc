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
  const client = new Client({ connectionString });
  
  console.log('🚀 Đang kết nối tới PostgreSQL...');
  await client.connect();

  try {
    console.log('🌱 Đang làm sạch dữ liệu cũ...');
    // Xóa dữ liệu cũ và reset ID
    await client.query('TRUNCATE TABLE "TreatmentImage", "MedicalRecord", "Appointment", "Patient", "Users" RESTART IDENTITY CASCADE;');

    console.log('👥 Đang tạo User (Admin, Doctor, Staff)...');
    const hashedPassword = await bcrypt.hash('pass123', 10);

    const userRes = await client.query(`
      INSERT INTO "Users" (name, email, password, role, "createdAt") 
      VALUES 
      ($1, $2, $3, 'ADMIN', NOW()),
      ($4, $5, $3, 'DOCTOR', NOW()),
      ($6, $7, $3, 'STAFF', NOW())
      RETURNING id, name;
    `, [
      'Quản trị viên', 'admin@smilecraft.com', hashedPassword,
      'BS. Bác Văn Sĩ', 'dr.bsi@smilecraft.com',
      'NV. Nhân Thị Viên', 'st.nvien@smilecraft.com'
    ]);

    // Lấy ID chính xác từ kết quả truy vấn
    const doc1Id = userRes.rows.find(u => u.name === 'BS. Bác Văn Sĩ').id;
    const staff1Id = userRes.rows.find(u => u.name === 'NV. Nhân Thị Viên').id;

    console.log('🏥 Đang tạo danh sách Bệnh nhân...');
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
    // Chèn 2 lịch hẹn: một cho Bác sĩ, một cho Staff quản lý (nếu nghiệp vụ yêu cầu)
    await client.query(`
      INSERT INTO "Appointment" ("appointmentTime", note, status, "patientId", "doctorId", "createdAt") 
      VALUES 
      (NOW() + INTERVAL '5 days', $1, 'WAITING', $2, $3, NOW()),
      (NOW() + INTERVAL '6 days', $4, 'WAITING', $5, $6, NOW());
    `, [
      'Khám răng định kỳ', patient1Id, doc1Id,
      'Tư vấn niềng răng', patient2Id, doc1Id
    ]);

    console.log('✨ THÀNH CÔNG MỸ MÃN! Dữ liệu đã được nạp!');
  } catch (error) {
    console.error('❌ Thất bại khi chạy SQL Seed:', error);
  } finally {
    await client.end();
  }
}

main();