import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';

@Module({
  controllers: [DoctorController], // Bắt buộc phải có dòng này!
  providers: [DoctorService],
})
export class DoctorModule {}
