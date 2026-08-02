export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface UpsertRolePayload {
  name: string;
}

export interface SyncPermissionsPayload {
  permissions: string[];
}

export interface UnauthorizedPageState {
  reason?: "permission" | "role" | "generic";
  requiredPermissions?: string[];
  requiredRoles?: string[];
  attemptedPath?: string;
}

