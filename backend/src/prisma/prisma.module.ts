import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Thêm decorator này để biến PrismaModule thành toàn cục, không cần import lại ở các module khác nữa
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Bắt buộc phải export ra
})
export class PrismaModule {}