import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
   
    const secret = configService.get<string>('JWT_SECRET');
    console.log('--- SECRET TRONG JWT STRATEGY ---', secret); // KIỂM TRA LOG NÀY
    
    if (!secret) {
      throw new InternalServerErrorException('Missing JWT_SECRET in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'my-secret-key-123', // Bây giờ 'secret' chắc chắn là string
    });
  }

  async validate(payload: any) {
    console.log('--- JWT Strategy Validate Payload ---', payload);
  if (!payload.sub) {
     console.error('Payload thiếu sub!');
     return null; // Trả về null để Guard báo 401
  } 
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}