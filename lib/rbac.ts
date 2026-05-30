export type Role = "admin" | "landlord" | "tenant" | "vendor" | "agent";

export type Permission =
  | "properties:read"
  | "properties:write"
  | "properties:delete"
  | "tenants:read"
  | "tenants:write"
  | "tenants:delete"
  | "payments:read"
  | "payments:write"
  | "payments:approve"
  | "maintenance:read"
  | "maintenance:write"
  | "maintenance:assign"
  | "leases:read"
  | "leases:write"
  | "applications:read"
  | "applications:write"
  | "applications:approve"
  | "listings:read"
  | "listings:write"
  | "vendors:read"
  | "vendors:write"
  | "reports:read"
  | "admin:read"
  | "admin:write";

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    "properties:read",
    "properties:write",
    "properties:delete",
    "tenants:read",
    "tenants:write",
    "tenants:delete",
    "payments:read",
    "payments:write",
    "payments:approve",
    "maintenance:read",
    "maintenance:write",
    "maintenance:assign",
    "leases:read",
    "leases:write",
    "applications:read",
    "applications:write",
    "applications:approve",
    "listings:read",
    "listings:write",
    "vendors:read",
    "vendors:write",
    "reports:read",
    "admin:read",
    "admin:write",
  ],
  landlord: [
    "properties:read",
    "properties:write",
    "tenants:read",
    "tenants:write",
    "payments:read",
    "payments:write",
    "payments:approve",
    "maintenance:read",
    "maintenance:write",
    "maintenance:assign",
    "leases:read",
    "leases:write",
    "applications:read",
    "applications:write",
    "applications:approve",
    "listings:read",
    "listings:write",
    "vendors:read",
    "reports:read",
  ],
  agent: [
    "properties:read",
    "properties:write",
    "tenants:read",
    "tenants:write",
    "payments:read",
    "maintenance:read",
    "maintenance:write",
    "leases:read",
    "applications:read",
    "applications:write",
    "listings:read",
    "listings:write",
    "reports:read",
  ],
  tenant: [
    "payments:read",
    "payments:write",
    "maintenance:read",
    "maintenance:write",
    "leases:read",
    "listings:read",
  ],
  vendor: [
    "maintenance:read",
    "maintenance:write",
    "vendors:read",
    "vendors:write",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function can(
  userRole: string | null | undefined,
  permission: Permission
): boolean {
  if (!userRole) return false;
  return hasPermission(userRole as Role, permission);
}
