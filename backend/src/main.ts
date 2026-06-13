import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import * as express from 'express';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Tăng giới hạn để xử lý ảnh
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.setGlobalPrefix('api');
  
  // Cấu hình CORS chặt chẽ cho Vercel
  app.enableCors({
    origin: (origin, callback) => {
      // Cho phép mọi request có origin là vercel.app hoặc localhost (để dev)
      if (!origin || origin.endsWith('.vercel.app') || origin.startsWith('http://localhost')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Đảm bảo đã có PATCH ở đây
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
    preflightContinue: false, // Rất quan trọng: cho phép NestJS tự xử lý OPTIONS
    optionsSuccessStatus: 204, // Trình duyệt thích 204 cho preflight
  });

  const port = process.env.PORT || 10000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();