import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // Validate toàn bộ dữ liệu đầu vào theo DTO
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS chuẩn cho Cloud
  app.enableCors({
    origin: '*', // Sau khi test xong nhớ đổi thành domain frontend của bạn
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Serve static files nếu cần (nhưng nhớ Render không lưu file lâu dài)
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // PORT quan trọng cho Render
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on port: ${port}`);
}
bootstrap();