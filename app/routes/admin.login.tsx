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
    <main className="min-h-screen bg-[#1c1b1a] flex items-center justify-center p-4">
      <div className="bg-[#2a241b] border-2 border-[#3a2818] rounded-sm shadow-lg p-8 w-full max-w-sm">
        <h1
          className="text-2xl font-bold text-[#f5f5f5] text-center mb-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Baking with Nan
        </h1>
        <p className="text-center text-[#9f6b43] text-sm mb-6">Admin access</p>

        {actionData?.success ? (
          <div className="text-center text-[#dedede] text-sm">
            <p className="text-2xl mb-3">📬</p>
            <p>Check your email for a login link.</p>
            <p className="text-[#a3978c] text-xs mt-2">
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
                className="block text-sm text-[#dedede] mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full border border-[#3a2818] bg-[#1c1b1a] text-[#dedede] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#9f6b43]"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#3a2818] hover:bg-[#5c4d3c] text-[#f5f5f5] text-sm py-2 px-4 rounded-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Sending…" : "Send login link"}
            </button>
          </Form>
        )}
      </div>
    </main>
  );
}
