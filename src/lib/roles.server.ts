import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_ROLE, ROLES, ROLE_COOKIE, type Role } from "./roles";

export async function getRole(): Promise<Role> {
  const store = await cookies();
  const value = store.get(ROLE_COOKIE)?.value;
  if (value && (ROLES as string[]).includes(value)) return value as Role;
  return DEFAULT_ROLE;
}
