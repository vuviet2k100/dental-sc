import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service'; // Nhớ import Service
import { PrismaModule } from '../prisma/prisma.module'; // Cần import PrismaModule để Service có thể truy cập DB

@Module({
  imports: [PrismaModule], // Nhớ thêm dòng này để dùng được Prisma trong Service
  controllers: [DashboardController],
  providers: [DashboardService], // <--- CẦN THÊM DÒNG NÀY
})
export class DashboardModule {}