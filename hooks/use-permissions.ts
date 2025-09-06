'use client';

import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';
import { type PermissionKey, Permissions } from '@/lib/auth/permissions';

export function usePermissions() {
  const { data: session } = useSession();
  
  const checkPermission = (permission: PermissionKey): boolean => {
    if (!session?.user) {
      return false;
    }

    const userRole = session.user.role as UserRole;
    const isVerified = session.user.isVerified as boolean;
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
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!session?.user?.role) {
      return false;
    }

    return roles.includes(session.user.role as UserRole);
  };

  const isVerified = (): boolean => {
    return session?.user?.isVerified === true;
  };

  const isAuthenticated = (): boolean => {
    return !!session?.user;
  };

  const getUserRole = (): UserRole | null => {
    return (session?.user?.role as UserRole) || null;
  };

  return {
    checkPermission,
    hasRole,
    isVerified,
    isAuthenticated,
    getUserRole,
  };
}