export function canAccessOrg(userOrgIds: string[], orgId: string): boolean {
  return userOrgIds.includes(orgId);
}

export function getOrgIsolationError(userOrgIds: string[], orgId: string): string {
  if (!canAccessOrg(userOrgIds, orgId)) {
    return "Access denied: org mismatch.";
  }

  return "";
}
