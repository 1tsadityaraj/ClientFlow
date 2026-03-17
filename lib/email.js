import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;
const isPlaceholder = resendKey?.includes("placeholder") || !resendKey;

const resend = !isPlaceholder ? new Resend(resendKey) : null;

const INVITE_FROM = "ClientFlow <onboarding@resend.dev>";

/**
 * Send an invite email with link to accept.
 * @param {{ to: string, inviterName: string, orgName: string, role: string, token: string }} opts
 * @returns {{ success: boolean, error?: string, devMode?: boolean }}
 */
export async function sendInviteEmail({ to, inviterName, orgName, role, token }) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const inviteUrl = `${baseUrl}/invite/${token}`;

  if (!resend) {
    console.log("-----------------------------------------");
    console.log("📧 [DEV EMAIL] To:", to);
    console.log("📡 [DEV EMAIL] Subject: Invite to join", orgName);
    console.log("🔗 [DEV EMAIL] Link:", inviteUrl);
    console.log("-----------------------------------------");
    return { success: true, devMode: true };
  }

  const subject = `You've been invited to join ${orgName} on ClientFlow`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #18181b; color: #e4e4e7; padding: 24px;">
  <div style="max-width: 480px; margin: 0 auto;">
    <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">
      <strong style="color: #e4e4e7;">${inviterName}</strong> has invited you to join <strong style="color: #e4e4e7;">${orgName}</strong> on ClientFlow.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">
      You'll join as <strong style="color: #e4e4e7;">${role}</strong>.
    </p>
    <p style="margin: 24px 0;">
      <a href="${inviteUrl}" style="display: inline-block; background-color: #6366f1; color: #fff; text-decoration: none; font-weight: 500; font-size: 14px; padding: 12px 24px; border-radius: 9999px;">
        Accept invite
      </a>
    </p>
    <p style="font-size: 12px; color: #71717a;">
      Or copy this link: <a href="${inviteUrl}" style="color: #818cf8;">${inviteUrl}</a>
    </p>
    <p style="font-size: 12px; color: #71717a; margin-top: 24px;">
      This invite expires in 48 hours. If you didn't expect this email, you can ignore it.
    </p>
  </div>
</body>
</html>
`.trim();

  const text = [
    `${inviterName} has invited you to join ${orgName} on ClientFlow.`,
    `You'll join as ${role}.`,
    "",
    `Accept invite: ${inviteUrl}`,
    "",
    "This invite expires in 48 hours. If you didn't expect this email, you can ignore it.",
  ].join("\n");

  try {
    const { data, error } = await resend.emails.send({
      from: INVITE_FROM,
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err?.message ?? "Failed to send email",
    };
  }
}
