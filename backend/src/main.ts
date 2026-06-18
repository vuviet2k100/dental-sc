import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // Tăng giới hạn payload để xử lý ảnh
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Cấu hình Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Global Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.setGlobalPrefix('api');

  // Lấy danh sách allowed origins từ .env (dùng dấu phẩy ngăn cách)
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'https://dental-361u178pq-vuviet2k100-2082s-projects.vercel.app'];

  // Cấu hình CORS chặt chẽ
  app.enableCors({
    origin: (origin, callback) => {
      // Cho phép không có origin (như mobile app hoặc postman) hoặc các origin trong danh sách
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://dental-361u178pq-vuviet2k100-2082s-projects.vercel.app'];
      
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
    optionsSuccessStatus: 204,
  });

  const port = process.env.PORT || 10000;
  
  await app.listen(port, '0.0.0.0', () => {
    logger.log(`🚀 Server is running on port ${port}`);
    logger.log(`✅ CORS allowed origins: ${allowedOrigins.join(', ')}`);
  });
}
bootstrap();