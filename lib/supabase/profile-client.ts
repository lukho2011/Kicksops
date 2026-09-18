import type { Role } from "../security";
import { createClient } from "./client";

export type ClientProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: Role;
  isActive: boolean;
};

// Client-side lookup of the signed-in user's profile (RLS returns only their
// own row). Used by client components that need the current user's id, e.g. to
// prevent an organizer from deleting or demoting their own account.
export async function getCurrentProfileClient(): Promise<ClientProfile | null> {
  const client = createClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await client
    .from("profiles")
    .select("id, email, full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email ?? user.email ?? null,
    fullName: data.full_name,
    role: data.role as Role,
    isActive: data.is_active,
  };
}
