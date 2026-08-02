/**
 * Centralized RBAC utility to check if a user has access to a resource based on their roles and permissions.
 * 
 * Rules:
 * 1. Admin and Manager automatically get access to ALL resources without exception.
 * 2. If no specific roles or permissions are required (both undefined), it's considered public for authenticated users.
 * 3. Validate explicitly required roles if provided.
 * 4. Validate granular permissions if provided.
 */
export const hasAccess = (
  userRoles: string[] = [],
  userPermissions: string[] = [],
  allowedRoles?: string[],
  allowedPermissions?: string[]
): boolean => {
  // 1. Super-access roles
  if (userRoles.includes("admin")) {
    return true;
  }

  // 2. If no specific restriction (both undefined), it's public for authenticated users
  if (allowedRoles === undefined && allowedPermissions === undefined) {
    return true;
  }

  // 3. Check roles if allowedRoles is provided
  if (allowedRoles && allowedRoles.length > 0) {
    if (userRoles.some((role) => allowedRoles.includes(role))) {
      return true;
    }
  }

  // 4. Check granular permissions if allowedPermissions is provided
  if (allowedPermissions && allowedPermissions.length > 0) {
    if (userPermissions.some((perm) => allowedPermissions.includes(perm))) {
      return true;
    }
  }

  // If provided an empty array of roles or permissions, and user is not admin/manager, access is denied
  return false;
};

export interface DenialContext {
  denied: boolean;
  reason?: "permission" | "role" | "generic";
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

/**
 * Returns contextual information about why access was denied.
 * Useful for building detailed 403 response states for UI feedback.
 */
export const getDenialContext = (
  userRoles: string[] = [],
  userPermissions: string[] = [],
  allowedRoles?: string[],
  allowedPermissions?: string[]
): DenialContext => {
  if (hasAccess(userRoles, userPermissions, allowedRoles, allowedPermissions)) {
    return { denied: false };
  }

  // Priority 1: Check if denied due to permissions requirement
  if (allowedPermissions && allowedPermissions.length > 0) {
    const missingPermissions = allowedPermissions.filter(
      (perm) => !userPermissions.includes(perm)
    );
    return {
      denied: true,
      reason: "permission",
      requiredPermissions: missingPermissions.length > 0 ? missingPermissions : allowedPermissions,
    };
  }

  // Priority 2: Check if denied due to roles requirement
  if (allowedRoles && allowedRoles.length > 0) {
    return {
      denied: true,
      reason: "role",
      requiredRoles: allowedRoles,
    };
  }

  return {
    denied: true,
    reason: "generic",
  };
};

