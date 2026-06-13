import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import * as express from 'express';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Tăng giới hạn payload để xử lý upload ảnh
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Cấu hình Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Pipe kiểm tra dữ liệu đầu vào
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.setGlobalPrefix('api');
  
  // Cấu hình CORS chuẩn xác
  app.enableCors({
    origin: [
      'https://dental-ongti410k-vuviet2k100-2082s-projects.vercel.app', // Domain lỗi hiện tại
      'https://dental-69ef4hlc8-vuviet2k100-2082s-projects.vercel.app'  // Domain dự phòng
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const port = process.env.PORT || 10000;
  await app.listen(port, '0.0.0.0');
}

bootstrap();