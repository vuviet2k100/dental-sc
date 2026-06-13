import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/role.decorator'; 
import { Request } from 'express'; // Import kiểu Request

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. CHÌA KHÓA CỐT LÕI: Cho phép OPTIONS đi qua ngay lập tức để tránh lỗi CORS
    if (request.method === 'OPTIONS') {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    // Trích xuất user từ request (đảm bảo request đã qua JwtAuthGuard)
    const user = (request as any).user;

    if (!user) {
      console.log("❌ RolesGuard: User không tồn tại trong request!");
      return false;
    }

    // Ép tất cả về chuỗi để so sánh
    const userRoleStr = String(user.role).toUpperCase();
    const hasRole = requiredRoles.some((role) => String(role).toUpperCase() === userRoleStr);

    if (!hasRole) {
      console.log(`❌ Bị chặn! User role: ${userRoleStr}, Cần một trong các quyền: ${requiredRoles.join(', ')}`);
    } else {
      console.log(`✅ Truy cập thành công với quyền: ${userRoleStr}`);
    }

    return hasRole;
  }
}