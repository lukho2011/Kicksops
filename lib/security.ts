// Pure, dependency-free authorization helpers. Safe to import from client
// components, server components, and the node --test runner (no next/* or
// supabase imports here).

export type Role = "customer" | "employee" | "organizer";

export const ROLES: Role[] = ["customer", "employee", "organizer"];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as string[]).includes(value);
}

// Where each role lands after signing in.
export const ROLE_HOME: Record<Role, string> = {
  customer: "/shop",
  employee: "/work",
  organizer: "/admin",
};

export function roleHome(role: Role): string {
  return ROLE_HOME[role];
}

// Employees and organizers are "staff": they run operations. Customers are not.
export function isStaff(role: Role): boolean {
  return role === "employee" || role === "organizer";
}

export function canViewAllOrders(role: Role): boolean {
  return isStaff(role);
}

export function canAdvanceStations(role: Role): boolean {
  return isStaff(role);
}

export function canManageServices(role: Role): boolean {
  return role === "organizer";
}

export function canManageAccounts(role: Role): boolean {
  return role === "organizer";
}

export function canBookOrders(role: Role): boolean {
  return role === "customer";
}

// A user may always delete their own account; only organizers may delete others.
export function canDeleteAccount(actorRole: Role, isSelf: boolean): boolean {
  return isSelf || actorRole === "organizer";
}

// Which roles are allowed to reach a role-group route. Used by the per-portal
// server layouts and mirrored by the optimistic redirect in proxy.ts.
export function canEnterPortal(role: Role, portal: Role | "staff"): boolean {
  if (portal === "staff") return isStaff(role);
  if (portal === "employee") return isStaff(role);
  return role === portal;
}

export function canAccessOrg(userOrgIds: string[], orgId: string): boolean {
  return userOrgIds.includes(orgId);
}

export function getOrgIsolationError(userOrgIds: string[], orgId: string): string {
  if (!canAccessOrg(userOrgIds, orgId)) {
    return "Access denied: org mismatch.";
  }

  return "";
}
