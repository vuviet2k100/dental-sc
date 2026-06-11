import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import 'dotenv/config'; 
import { ValidationPipe, Logger } from '@nestjs/common'; // Thêm Logger
import { NestExpressApplication } from '@nestjs/platform-express'; // Import cái này
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap'); // Khởi tạo Logger

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads', // URL sẽ là http://localhost:3000/uploads/filename.jpg
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Tự động loại bỏ các field không có trong DTO
    forbidNonWhitelisted: true, // Báo lỗi nếu client gửi thừa field
    transform: true, // Tự động chuyển đổi kiểu dữ liệu (vd: string "1" thành number 1)
  }));

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(3000);
  logger.log(`Application is running on: ${await app.getUrl()}`); // Log ra console cổng server
}
bootstrap();