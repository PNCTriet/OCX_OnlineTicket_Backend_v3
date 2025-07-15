import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Không yêu cầu role cụ thể
    }
    const request = context.switchToHttp().getRequest();
    const user = request.supabaseUser || request.user;
    const userRole = user?.role;
    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenException('You do not have permission (role) to access this resource');
    }
    return true;
  }
} 