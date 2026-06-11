import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Import module này vào

@Module({
  imports: [PrismaModule], // Thêm dòng này
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}