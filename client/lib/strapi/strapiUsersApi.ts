import type { UserRow } from "@/components/user/types";
import { getStrapiToken, getStrapiUrl } from "./config";

type StrapiUserRow = {
  id?: number;
  documentId?: string;
  username?: string;
  email?: string;
  createdAt?: string;
  role?: { id?: number; name?: string };
};

function authHeaders(): HeadersInit {
  return { Authorization: `Bearer ${getStrapiToken()}` };
}

const roleIdCache = new Map<string, number>();

export async function getSchoolRoleId(name: "admin" | "faculty"): Promise<number> {
  const key = name.toLowerCase();
  if (roleIdCache.has(key)) return roleIdCache.get(key)!;

  const base = getStrapiUrl();
  const res = await fetch(`${base}/api/users-permissions/roles`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Strapi roles ${res.status}`);
  }
  const json = (await res.json()) as { roles?: { id?: number; name?: string }[] };
  const roles = json.roles ?? [];
  const match = roles.find((r) => r.name?.toLowerCase() === key);
  if (!match?.id) {
    throw new Error(`Strapi role "${name}" not found — run Strapi bootstrap (npm run develop once)`);
  }
  roleIdCache.set(key, match.id);
  return match.id;
}

export async function adminListUsers(): Promise<UserRow[]> {
  const base = getStrapiUrl();
  const url = `${base}/api/users?populate=role&pagination[pageSize]=100&sort=createdAt:desc`;
  const res = await fetch(url, { headers: { ...authHeaders(), "Content-Type": "application/json" }, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Strapi list users ${res.status}`);
  }
  const json = (await res.json()) as StrapiUserRow[] | { data?: StrapiUserRow[] };
  const rows = Array.isArray(json) ? json : json.data ?? [];
  return rows.map((u) => ({
    username: String(u.username ?? ""),
    email: String(u.email ?? ""),
    createdAt: String(u.createdAt ?? ""),
    role: u.role?.name?.toLowerCase() === "admin" ? "admin" : "faculty",
  }));
}

export async function adminFindUserByUsername(username: string): Promise<StrapiUserRow | null> {
  const base = getStrapiUrl();
  const q = `filters[username][$eq]=${encodeURIComponent(username)}&pagination[pageSize]=1`;
  const res = await fetch(`${base}/api/users?${q}`, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) return null;
  const json = (await res.json()) as StrapiUserRow[] | { data?: StrapiUserRow[] };
  const rows = Array.isArray(json) ? json : json.data ?? ([] as StrapiUserRow[]);
  return rows[0] ?? null;
}

export async function adminDeleteUserById(id: number): Promise<void> {
  const base = getStrapiUrl();
  const res = await fetch(`${base}/api/users/${encodeURIComponent(String(id))}`, {
    method: "DELETE",
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(text || `Delete user ${res.status}`);
  }
}

export async function adminCreateUser(data: {
  username: string;
  email: string;
  password: string;
  app_role: "admin" | "faculty";
}): Promise<void> {
  const base = getStrapiUrl();
  const roleId = await getSchoolRoleId(data.app_role);
  const res = await fetch(`${base}/api/users`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      username: data.username,
      email: data.email.toLowerCase(),
      password: data.password,
      role: roleId,
      confirmed: true,
    }),
  });
  if (!res.ok && res.status !== 201) {
    const text = await res.text();
    throw new Error(text || `Create user ${res.status}`);
  }
}

export async function adminUpdateUserPassword(userId: number, password: string): Promise<void> {
  const base = getStrapiUrl();
  const res = await fetch(`${base}/api/users/${encodeURIComponent(String(userId))}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Update user ${res.status}`);
  }
}
