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
    origin: true, // Cho phép mọi origin để test, sau đó bạn có thể siết lại
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');


// Trong main.ts, trước app.listen
const server = app.getHttpServer();
const router = (server as any)._events.request._router;

// Định nghĩa kiểu rõ ràng để TypeScript không phàn nàn
const availableRoutes: string[] = router.stack
  .map((layer: any) => layer.route?.path)
  .filter((path: string | undefined): path is string => path !== undefined);

console.log(">>> Danh sách các route đã đăng ký:", availableRoutes);

const url = await app.getUrl();
  console.log(`🚀 Ứng dụng đang chạy tại: ${url}`);
  console.log(`📋 Global Prefix là: /api`);

}
console.log(">>> Đang chạy tại thư mục:", __dirname);
bootstrap();