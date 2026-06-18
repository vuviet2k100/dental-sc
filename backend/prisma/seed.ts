import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ LỖI: DATABASE_URL không tồn tại!");
  process.exit(1);
}

async function main() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();

  try {
    console.log('🔄 Đang làm sạch và khởi tạo lại dữ liệu...');
    await client.query('TRUNCATE TABLE "TreatmentImage", "MedicalRecord", "Appointments", "Patient", "Users" RESTART IDENTITY CASCADE;');

    // 1. Tạo Users
    const hashedPassword = await bcrypt.hash('pass123', 10);
    const userRes = await client.query(`
      INSERT INTO "Users" (name, email, password, role, "createdAt") 
      VALUES 
      ($1, $2, $3, 'ADMIN', NOW()),
      ($4, $5, $3, 'DOCTOR', NOW()),
      ($6, $7, $3, 'STAFF', NOW())
      RETURNING id, name, role;
    `, [
      'Quản trị viên', 'admin@smilecraft.com', hashedPassword,
      'BS. Bác Văn Sĩ', 'dr.bsi@smilecraft.com',
      'NV. Nhân Thị Viên', 'st.nvien@smilecraft.com'
    ]);

    const doctor = userRes.rows.find(u => u.role === 'DOCTOR');
    const staff = userRes.rows.find(u => u.role === 'STAFF');

    // 2. Tạo Patients
    const patientRes = await client.query(`
      INSERT INTO "Patient" (name, phone, gender, "createdAt", "updatedAt") 
      VALUES 
      ('Lê Hoàng Long', '0912345678', 'MALE', NOW(), NOW()),
      ('Phạm Thanh Thảo', '0987654321', 'FEMALE', NOW(), NOW())
      RETURNING id;
    `);

    // 3. Tạo Appointments (Có xử lý staffId)
    if (patientRes.rows.length >= 2) {
      await client.query(`
        INSERT INTO "Appointments" ("appointmentTime", note, status, "patientId", "doctorId", "staffId", "createdAt") 
        VALUES 
        (NOW() + INTERVAL '5 days', 'Khám răng định kỳ', 'WAITING', $1, $2, $3, NOW()),
        (NOW() + INTERVAL '6 days', 'Tư vấn niềng răng', 'WAITING', $4, $2, $3, NOW());
      `, [
        patientRes.rows[0].id, doctor.id, staff.id,
        patientRes.rows[1].id, doctor.id, staff.id
      ]);
      console.log('✅ Dữ liệu mẫu đã được nạp thành công (Bao gồm Bác sĩ & Nhân viên)');
    }

  } catch (error) {
    console.error('❌ Lỗi nạp dữ liệu:', error);
  } finally {
    await client.end();
  }
}

main();