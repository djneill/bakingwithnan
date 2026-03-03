import { Resend } from "resend";

export async function sendMagicLinkEmail({
  apiKey,
  to,
  token,
  baseUrl,
}: {
  apiKey: string;
  to: string;
  token: string;
  baseUrl: string;
}): Promise<void> {
  const resend = new Resend(apiKey);
  const magicLink = `${baseUrl}/admin/verify?token=${token}`;

  await resend.emails.send({
    from: "Baking with Nan <noreply@djneill.dev>",
    to,
    subject: "Your login link for Baking with Nan",
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #5c3d2e;">Baking with Nan 🧁</h2>
        <p>Click the link below to log in. This link expires in 15 minutes and can only be used once.</p>
        <a href="${magicLink}" style="display:inline-block; padding: 12px 24px; background:#c0392b; color:#fff; text-decoration:none; border-radius:4px;">
          Log me in
        </a>
        <p style="color:#999; font-size:12px; margin-top:24px;">
          If you didn't request this, you can safely ignore it.
        </p>
      </div>
    `,
  });
}
