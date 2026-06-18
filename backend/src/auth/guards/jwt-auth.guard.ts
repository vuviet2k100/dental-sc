import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Request } from 'express'; // Import kiểu Request

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Trích xuất request từ context
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Luôn cho phép OPTIONS (CORS Preflight)
    if (request.method === 'OPTIONS') {
      return true;
    }

    // 2. Kiểm tra xem route có được gắn decorator @Public() không
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // 3. Nếu không public, thực hiện kiểm tra JWT của AuthGuard
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: any) {
    if (err || !user) {
      console.log('--- AuthGuard từ chối ---');
      console.log('Lỗi (err):', err);
      console.log('Thông tin (info):', info); // Cái này quan trọng nhất
      throw err || new UnauthorizedException();
    }
    return user;
  }
}