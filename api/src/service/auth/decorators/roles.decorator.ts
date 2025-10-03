import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

// Define a constant for the roles metadata key
export const ROLES_KEY = 'roles';
// Create a custom decorator to set roles metadata
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);