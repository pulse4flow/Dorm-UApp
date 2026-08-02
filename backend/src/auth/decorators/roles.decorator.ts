import { SetMetadata } from '@nestjs/common';

export type UserRole = 'student' | 'manager' | 'staff';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: (UserRole | string)[]) => SetMetadata(ROLES_KEY, roles);
