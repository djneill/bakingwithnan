import { redirect } from "react-router";
import type { Route } from "./+types/admin.verify";
import {
  verifyMagicLink,
  createSession,
  makeSessionCookie,
} from "~/lib/auth.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.cloudflare;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return redirect("/admin/login?error=missing-token");
  }

  const adminId = await verifyMagicLink(env.bakingwithnan_db, token);

  if (!adminId) {
    return redirect("/admin/login?error=invalid-token");
  }

  const sessionToken = await createSession(env.bakingwithnan_db, adminId);

  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  return redirect("/admin", {
    headers: {
      "Set-Cookie": makeSessionCookie(sessionToken, expires),
    },
  });
}

// This route only runs the loader — no UI needed
export default function AdminVerify() {
  return null;
}
