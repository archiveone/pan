import { headers } from 'next/headers';
import { UserRole } from '@prisma/client';

export type Permission = {
  roles: UserRole[];
  requireVerification?: boolean;
};

export const Permissions = {
  // Property permissions
  CREATE_PROPERTY: {
    roles: ['AGENT', 'ADMIN'],
    requireVerification: true,
  },
  MANAGE_PROPERTY: {
    roles: ['AGENT', 'ADMIN'],
  },
  VIEW_PRIVATE_PROPERTY: {
    roles: ['AGENT', 'ADMIN'],
    requireVerification: true,
  },

  // Service permissions
  CREATE_SERVICE: {
    roles: ['USER', 'AGENT', 'ADMIN'],
    requireVerification: true,
  },
  MANAGE_SERVICE: {
    roles: ['USER', 'AGENT', 'ADMIN'],
  },

  // Leisure permissions
  CREATE_LEISURE: {
    roles: ['USER', 'AGENT', 'ADMIN'],
    requireVerification: true,
  },
  MANAGE_LEISURE: {
    roles: ['USER', 'AGENT', 'ADMIN'],
  },

  // Admin permissions
  MANAGE_USERS: {
    roles: ['ADMIN'],
  },
  VIEW_ANALYTICS: {
    roles: ['ADMIN'],
  },

  // Agent permissions
  MANAGE_CLIENTS: {
    roles: ['AGENT', 'ADMIN'],
  },
  VIEW_AGENT_DASHBOARD: {
    roles: ['AGENT', 'ADMIN'],
  },

  // General permissions
  USE_MESSAGING: {
    roles: ['USER', 'AGENT', 'ADMIN'],
    requireVerification: true,
  },
  USE_CONNECT: {
    roles: ['USER', 'AGENT', 'ADMIN'],
    requireVerification: true,
  },
} as const;

export type PermissionKey = keyof typeof Permissions;

export function checkPermission(permission: PermissionKey): boolean {
  const headersList = headers();
  const userRole = headersList.get('x-user-role') as UserRole;
  const isVerified = headersList.get('x-user-verified') === 'true';

  const requiredPermission = Permissions[permission];

  // Check role
  if (!requiredPermission.roles.includes(userRole)) {
    return false;
  }

  // Check verification if required
  if (requiredPermission.requireVerification && !isVerified) {
    return false;
  }

  return true;
}

export function hasRole(roles: UserRole[]): boolean {
  const headersList = headers();
  const userRole = headersList.get('x-user-role') as UserRole;
  return roles.includes(userRole);
}

export function isVerified(): boolean {
  const headersList = headers();
  return headersList.get('x-user-verified') === 'true';
}

export function getUserId(): string {
  const headersList = headers();
  const userId = headersList.get('x-user-id');
  if (!userId) {
    throw new Error('User ID not found in headers');
  }
  return userId;
}

export function getUserRole(): UserRole {
  const headersList = headers();
  const userRole = headersList.get('x-user-role') as UserRole;
  if (!userRole) {
    throw new Error('User role not found in headers');
  }
  return userRole;
}