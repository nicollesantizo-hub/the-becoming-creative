import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { resend, FROM, ADMIN_EMAIL } from "@/lib/resend";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postTitle, postSlug, commentBody, commenterEmail } = await request.json();

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New response on "${postTitle}"`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #2c2c2c;">
        <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.4; margin-bottom: 24px;">The Becoming Creative</p>
        <h1 style="font-size: 24px; font-weight: 300; font-style: italic; margin-bottom: 8px;">New response on Field Notes.</h1>
        <p style="font-size: 13px; opacity: 0.4; margin-bottom: 24px;">${postTitle}</p>
        <blockquote style="border-left: 3px solid #8B6F5E; padding-left: 16px; margin: 0 0 24px; font-style: italic; opacity: 0.7;">
          <p style="font-size: 15px; line-height: 1.8;">${commentBody}</p>
        </blockquote>
        <p style="font-size: 13px; opacity: 0.5; margin-bottom: 32px;">From: ${commenterEmail}</p>
        <a href="https://thebecomingcreative.com/field-notes/${postSlug}" style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #8B6F5E; text-decoration: none;">View post →</a>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
