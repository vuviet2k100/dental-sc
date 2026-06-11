import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointment.service';
import { AppointmentsController } from './appointment.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Thêm dòng này

@Module({
  imports: [PrismaModule], // Bỏ PrismaModule vào đây nhé vuviet
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentModule {}