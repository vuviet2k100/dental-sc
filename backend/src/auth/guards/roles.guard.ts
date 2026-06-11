import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/role.decorator'; 

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);

  if (!requiredRoles) return true;

  const request = context.switchToHttp().getRequest();
  const user = request.user;

  if (!user) {
    console.log("❌ RolesGuard: User không tồn tại trong request!");
    return false;
  }

  // Ép tất cả về chuỗi để so sánh
  // Ví dụ: user.role = "DOCTOR", requiredRoles = ["ADMIN", "DOCTOR"]
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