import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { PatientModule } from '../patient/patient.module';
import { AppointmentModule } from '../appointment/appointment.module';
import { MedicalRecordModule } from '../medical-record/medical-record.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { DashboardModule } from '../dashboard/dashboard.module';
// Import thêm 2 module nghiệp vụ mới
import { DoctorModule } from '../doctor/doctor.module';
import { StaffModule } from '../staff/staff.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PatientModule,
    AppointmentModule,
    MedicalRecordModule,
    AuthModule,
    UsersModule,
    DashboardModule,
    DoctorModule, // Quản lý nghiệp vụ bác sĩ
    StaffModule   // Quản lý nghiệp vụ nhân viên
  ],
})
export class AppModule {}