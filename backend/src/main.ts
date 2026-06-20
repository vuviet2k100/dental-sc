import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express'; // Import chuẩn từ express

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // SỬA Ở ĐÂY: Dùng app.use để áp dụng middleware limit một cách chính xác
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.setGlobalPrefix('api');

  //Cấu hình ValidationPipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
    exceptionFactory: (errors) => {
    console.log(">>> Lỗi Validation chi tiết:", JSON.stringify(errors, null, 2));
    return new BadRequestException(errors);
  }  }));


  // Cấu hình CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGIN || 'https://dental-sc.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
}
console.log(">>> Đang chạy tại thư mục:", __dirname);
bootstrap();