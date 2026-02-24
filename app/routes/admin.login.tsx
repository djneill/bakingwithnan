import { Form, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/admin.login";
import { createMagicLink } from "~/lib/auth.server";
import { sendMagicLinkEmail } from "~/lib/resend.server";

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.cloudflare;
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    return { error: "Please enter your email address." };
  }

  // Always show success — don't reveal whether the email exists
  const result = await createMagicLink(env.bakingwithnan_db, email);

  if (result) {
    const baseUrl = new URL(request.url).origin;
    try {
      await sendMagicLinkEmail({
        apiKey: env.RESEND_API_KEY,
        to: email,
        token: result.token,
        baseUrl,
      });
    } catch (err) {
      console.error("Failed to send magic link email:", err);
    }
  }

  return { success: true };
}

export default function AdminLogin({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-amber-200 rounded-sm shadow-lg p-8 w-full max-w-sm">
        <h1
          className="text-2xl font-bold text-amber-900 text-center mb-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Baking with Nan
        </h1>
        <p className="text-center text-amber-700 text-sm mb-6">Admin access</p>

        {actionData?.success ? (
          <div className="text-center text-amber-800 text-sm">
            <p className="text-2xl mb-3">📬</p>
            <p>Check your email for a login link.</p>
            <p className="text-amber-500 text-xs mt-2">
              It expires in 15 minutes.
            </p>
          </div>
        ) : (
          <Form method="post" className="flex flex-col gap-4">
            {actionData?.error && (
              <p className="text-red-600 text-sm text-center">
                {actionData.error}
              </p>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-amber-800 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full border border-amber-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-800 hover:bg-amber-900 text-white text-sm py-2 px-4 rounded-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Sending…" : "Send login link"}
            </button>
          </Form>
        )}
      </div>
    </main>
  );
}
