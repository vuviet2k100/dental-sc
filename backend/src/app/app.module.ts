import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path'; // Cần import path để dùng process.cwd()

// Import các Module
import { PrismaModule } from '../prisma/prisma.module';
import { PatientModule } from '../patient/patient.module';
import { AppointmentModule } from '../appointment/appointment.module';
import { MedicalRecordModule } from '../medical-record/medical-record.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { DoctorModule } from '../doctor/doctor.module';
import { StaffModule } from '../staff/staff.module';

@Module({
  imports: [
    // 1. Core
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: path.resolve(process.cwd(), '.env'),
    }),
    PrismaModule,
    AuthModule,
    
    // 2. Feature Modules
    UsersModule,
    DashboardModule,
    PatientModule,
    AppointmentModule,
    MedicalRecordModule,
    DoctorModule,
    StaffModule,
  ],
})
export class AppModule {}