import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    // Lấy secret từ config
    const secret = configService.get<string>('JWT_SECRET');

    // Kiểm tra an toàn: Nếu không có secret trong .env, ném lỗi ngay khi app khởi động
    if (!secret) {
      throw new InternalServerErrorException('Missing JWT_SECRET in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Ép kiểu chắc chắn là string (vì đã check if !secret ở trên)
      secretOrKey: secret as string, 
    });
  }

  // Hàm này tự động chạy sau khi Passport xác thực xong token
  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
}