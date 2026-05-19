import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { resend, FROM, ADMIN_EMAIL } from "@/lib/resend";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const name = user.email?.split("@")[0] ?? "friend";

  await Promise.all([
    // Welcome email to new user
    resend.emails.send({
      from: FROM,
      to: user.email!,
      subject: "You made it.",
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #2c2c2c;">
          <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.4; margin-bottom: 32px;">The Becoming Creative</p>
          <h1 style="font-size: 32px; font-weight: 300; font-style: italic; line-height: 1.3; margin-bottom: 24px;">Hey, ${name}. I see you.</h1>
          <p style="font-size: 15px; line-height: 1.8; opacity: 0.7; margin-bottom: 16px;">Whatever brought you here — a search, a feeling, a moment of wondering if you're doing this right — I'm glad it led you here.</p>
          <p style="font-size: 15px; line-height: 1.8; opacity: 0.7; margin-bottom: 16px;">This space was made for the in-between. For creatives who are still figuring it out — and building something beautiful in the process.</p>
          <p style="font-size: 15px; line-height: 1.8; opacity: 0.7; margin-bottom: 40px;">You belong here. Take your time.</p>
          <a href="https://thebecomingcreative.com/field-notes" style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #555555; text-decoration: none;">Read Field Notes →</a>
          <hr style="margin: 48px 0; border: none; border-top: 1px solid #e0e0e0;" />
          <p style="font-size: 11px; opacity: 0.3; line-height: 1.6;">The Becoming Creative · thebecomingcreative.com</p>
        </div>
      `,
    }),

    // Notification to Aida
    resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `New member: ${user.email}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #2c2c2c;">
          <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.4; margin-bottom: 24px;">The Becoming Creative</p>
          <h1 style="font-size: 24px; font-weight: 300; font-style: italic; margin-bottom: 16px;">New member joined.</h1>
          <p style="font-size: 15px; line-height: 1.8; opacity: 0.7;"><strong>${user.email}</strong> just signed up.</p>
        </div>
      `,
    }),
  ]);

  return NextResponse.json({ ok: true });
}
