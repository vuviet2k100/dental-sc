import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

// Ép kiểu về 'any' để bỏ qua kiểm tra TypeScript phức tạp của Neon
const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString } as any);
const adapter = new PrismaNeon(pool as any);

export default adapter;