import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import đầy đủ
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    // Cấu hình JwtModule bất đồng bộ để lấy secret từ file .env
    JwtModule.registerAsync({
      imports: [ConfigModule], // Phải là 'imports' (số nhiều)
      inject: [ConfigService],
      
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        console.log('--- SECRET TRONG JWT MODULE ---', secret); // KIỂM TRA LOG NÀY
        return {
          secret: 'my-secret-key-123',
          signOptions: { expiresIn: '1d' },
        };
      },
      }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService], // Export nếu các module khác cần gọi AuthService
})
export class AuthModule {}