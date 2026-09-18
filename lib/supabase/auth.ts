import { redirect } from "next/navigation";

import { roleHome, type Role } from "../security";
import { createServerSupabaseClient } from "./server";

export type { Role };

export type Profile = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: Role;
  orgId: string | null;
  isActive: boolean;
};

function describeError(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const details = error as { code?: string; message: string };
    return details.code ? `${details.code}: ${details.message}` : details.message;
  }
  return String(error);
}

// The authenticated auth.users row (validated against the auth server), or null.
export async function getSessionUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// The signed-in user's profile (role, org, active flag), or null when signed out.
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, org_id, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase profile lookup failed (${describeError(error)})`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email ?? user.email ?? null,
    fullName: data.full_name,
    role: data.role as Role,
    orgId: data.org_id,
    isActive: data.is_active,
  };
}

// Redirects to /login when signed out; otherwise returns the profile.
export async function requireUser(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }
  if (!profile.isActive) {
    redirect("/login?error=inactive");
  }
  return profile;
}

// Redirects signed-out users to /login and wrong-role users to their own home.
export async function requireRole(roles: Role[]): Promise<Profile> {
  const profile = await requireUser();
  if (!roles.includes(profile.role)) {
    redirect(roleHome(profile.role));
  }
  return profile;
}
