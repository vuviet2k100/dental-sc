import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    // Lấy URL từ biến môi trường
    const connectionString = configService.get<string>('DATABASE_URL');
    
    if (!connectionString) {
      throw new Error('DATABASE_URL chưa được thiết lập trong file .env!');
    }

    // Khởi tạo Adapter với Pool kết nối PostgreSQL chuẩn
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    
    const adapter = new PrismaPg(pool);

    // Gọi super() trước khi làm bất cứ việc gì khác
    super({ adapter } as any);
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.error('>>> Không thể kết nối Database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}