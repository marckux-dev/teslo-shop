import { SetMetadata } from '@nestjs/common';
import { Rol } from '../interfaces/rol.enum';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: Rol[]) => (
  SetMetadata(META_ROLES, args)
);
