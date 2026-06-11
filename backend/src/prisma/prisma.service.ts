import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import "dotenv/config";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Tạo pool kết nối PostgreSQL bằng thư viện 'pg'
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Tạo Adapter tương thích hoàn toàn với Prisma 7
    const adapter = new PrismaPg(pool);

    // Truyền adapter vào đây là hết sạch lỗi engine luôn!
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}