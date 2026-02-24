import { redirect } from "react-router";

// How long a magic link token is valid (15 minutes)
const MAGIC_LINK_EXPIRY_MINUTES = 15;

// How long a session lasts (30 days)
const SESSION_EXPIRY_DAYS = 30;

// Session cookie name
export const SESSION_COOKIE = "nan_session";

// ---- Token generation ----

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function expiresAt(minutes: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

// ---- Magic link ----

export async function createMagicLink(
  db: D1Database,
  email: string,
): Promise<{ token: string; adminId: number } | null> {
  // Check the email exists in admins
  const admin = await db
    .prepare("SELECT id FROM admins WHERE email = ?")
    .bind(email)
    .first<{ id: number }>();

  if (!admin) return null;

  const token = generateToken();
  const expires = expiresAt(MAGIC_LINK_EXPIRY_MINUTES);

  await db
    .prepare(
      "INSERT INTO magic_links (admin_id, token, expires_at) VALUES (?, ?, ?)",
    )
    .bind(admin.id, token, expires)
    .run();

  return { token, adminId: admin.id };
}

export async function verifyMagicLink(
  db: D1Database,
  token: string,
): Promise<number | null> {
  const link = await db
    .prepare(
      `SELECT id, admin_id, expires_at, used
       FROM magic_links
       WHERE token = ?`,
    )
    .bind(token)
    .first<{
      id: number;
      admin_id: number;
      expires_at: string;
      used: number;
    }>();

  if (!link) return null;
  if (link.used) return null;
  if (new Date(link.expires_at) < new Date()) return null;

  // Mark token as used
  await db
    .prepare("UPDATE magic_links SET used = 1 WHERE id = ?")
    .bind(link.id)
    .run();

  return link.admin_id;
}

// ---- Sessions ----

export async function createSession(
  db: D1Database,
  adminId: number,
): Promise<string> {
  const token = generateToken();
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_EXPIRY_DAYS);

  await db
    .prepare(
      "INSERT INTO sessions (admin_id, session_token, expires_at) VALUES (?, ?, ?)",
    )
    .bind(adminId, token, expires.toISOString())
    .run();

  return token;
}

export async function getSessionAdmin(
  db: D1Database,
  sessionToken: string,
): Promise<number | null> {
  const session = await db
    .prepare(
      `SELECT admin_id, expires_at
       FROM sessions
       WHERE session_token = ?`,
    )
    .bind(sessionToken)
    .first<{ admin_id: number; expires_at: string }>();

  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;

  return session.admin_id;
}

export function makeSessionCookie(token: string, expires: Date): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires.toUTCString()}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

// ---- Route guard ----

export async function requireAdmin(
  db: D1Database,
  request: Request,
): Promise<number> {
  const cookie = request.headers.get("Cookie") ?? "";
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  const token = match?.[1];

  if (!token) throw redirect("/admin/login");

  const adminId = await getSessionAdmin(db, token);
  if (!adminId) throw redirect("/admin/login");

  return adminId;
}
