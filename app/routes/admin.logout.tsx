import { redirect } from "react-router";
import type { Route } from "./+types/admin.logout";
import { SESSION_COOKIE, clearSessionCookie } from "~/lib/auth.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.cloudflare;

  // Extract session token from cookie
  const cookie = request.headers.get("Cookie") ?? "";
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  const token = match?.[1];

  // Delete session from D1 if it exists
  if (token) {
    await env.bakingwithnan_db
      .prepare("DELETE FROM sessions WHERE session_token = ?")
      .bind(token)
      .run();
  }

  throw redirect("/admin/login", {
    headers: { "Set-Cookie": clearSessionCookie() },
  });
}

export default function Logout() {
  return null;
}
