import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Không có role requirement thì cho phép
    }

    const request = context.switchToHttp().getRequest();
    const user = request.userLocal || request.user;
    if (!user || !user.role) {
      throw new ForbiddenException('No user or role found');
    }
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied. Insufficient role.');
    }
    return true;
  }
} 