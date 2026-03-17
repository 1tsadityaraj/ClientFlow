import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export function isEmailEnabled() {
  return !!(
    process.env.RESEND_API_KEY &&
    !process.env.RESEND_API_KEY.includes("placeholder")
  );
}

export async function sendInviteEmail({ to, inviterName, orgName, role, token }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteLink = `${baseUrl}/invite/${token}`;

  if (!isEmailEnabled()) {
    console.log("-----------------------------------------");
    console.log("📧 [DEV EMAIL] To:", to);
    console.log("📡 [DEV EMAIL] Subject: Invite to join", orgName);
    console.log("🔗 [DEV EMAIL] Link:", inviteLink);
    console.log("-----------------------------------------");
    return { success: true, devMode: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "ClientFlow <onboarding@resend.dev>",
      to: [to],
      subject: `You've been invited to join ${orgName} on ClientFlow`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#0a0a0f;font-family:'Helvetica Neue',Arial,sans-serif;">
          <div style="max-width:560px;margin:40px auto;padding:0 20px;">
            
            <!-- Header -->
            <div style="text-align:center;margin-bottom:32px;">
              <div style="display:inline-flex;align-items:center;gap:8px;">
                <div style="width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#22d3a0);border-radius:8px;display:inline-block;"></div>
                <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">ClientFlow</span>
              </div>
            </div>

            <!-- Card -->
            <div style="background:#111118;border:1px solid #1e1e2e;border-radius:16px;padding:40px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#e8e8f0;letter-spacing:-0.03em;">
                You've been invited
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#6b6b8a;line-height:1.6;">
                <strong style="color:#9090b0;">${inviterName}</strong> has invited you to join 
                <strong style="color:#9090b0;">${orgName}</strong> as a 
                <strong style="color:#7c6af7;">${role}</strong>.
              </p>

              <!-- CTA Button -->
              <a href="${inviteLink}" 
                 style="display:block;text-align:center;background:#7c6af7;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:0.01em;margin-bottom:24px;">
                Accept Invitation →
              </a>

              <!-- Link fallback -->
              <p style="margin:0;font-size:12px;color:#6b6b8a;text-align:center;">
                Or copy this link:<br/>
                <span style="color:#7c6af7;word-break:break-all;">${inviteLink}</span>
              </p>
            </div>

            <!-- Footer -->
            <p style="text-align:center;font-size:12px;color:#6b6b8a;margin-top:24px;">
              This invite expires in 48 hours. If you didn't expect this email, you can ignore it.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
You've been invited to join ${orgName} on ClientFlow.

${inviterName} has invited you as a ${role}.

Accept your invitation here:
${inviteLink}

This invite expires in 48 hours.
      `.trim(),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data.id };
  } catch (err) {
    console.error("Email send failed:", err);
    return { success: false, error: err.message };
  }
}

export async function sendWelcomeEmail({ to, name, orgName, plan }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!isEmailEnabled()) {
    console.log("-----------------------------------------");
    console.log("📧 [DEV EMAIL] To:", to);
    console.log("📡 [DEV EMAIL] Subject: Welcome to ClientFlow", name);
    console.log("-----------------------------------------");
    return { success: true, devMode: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "ClientFlow <onboarding@resend.dev>",
      to: [to],
      subject: `Welcome to ClientFlow, ${name}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#0a0a0f;font-family:'Helvetica Neue',Arial,sans-serif;">
          <div style="max-width:560px;margin:40px auto;padding:0 20px;">
            <div style="text-align:center;margin-bottom:32px;">
              <span style="font-size:24px;font-weight:800;color:#ffffff;">ClientFlow</span>
            </div>
            <div style="background:#111118;border:1px solid #1e1e2e;border-radius:16px;padding:40px;">
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#e8e8f0;">Welcome aboard, ${name}!</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#6b6b8a;line-height:1.6;">
                We're excited to have you and <strong>${orgName}</strong> on the <strong>${plan}</strong> plan.
              </p>
              
              <div style="margin-bottom:24px;padding:20px;background:#181825;border-radius:12px;">
                <p style="margin:0 0 12px;font-weight:700;color:#ffffff;font-size:14px;">Quick Start Steps:</p>
                <ol style="margin:0;padding-left:20px;color:#6b6b8a;font-size:14px;line-height:1.8;">
                  <li>Create your first project</li>
                  <li>Invite your team members</li>
                  <li>Share files with your clients</li>
                </ol>
              </div>

              <a href="${baseUrl}/dashboard" 
                 style="display:block;text-align:center;background:#7c6af7;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:700;font-size:15px;">
                Go to Dashboard
              </a>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data.id };
  } catch (err) {
    console.error("Welcome email failed:", err);
    return { success: false, error: err.message };
  }
}
