import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // 1. Tạo Pool kết nối PostgreSQL
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL 
    });

    // 2. Tạo Adapter (Đây là yêu cầu bắt buộc của Prisma 7 khi dùng engine client)
    const adapter = new PrismaPg(pool);

    // 3. Khởi tạo PrismaClient với adapter
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}