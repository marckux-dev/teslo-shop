import { Rol } from '../interfaces/rol.enum';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';

export const Auth = (...roles: Rol[]) => (
  applyDecorators(
    RoleProtected(...roles),
    UseGuards( AuthGuard(), UserRoleGuard )
  )
);