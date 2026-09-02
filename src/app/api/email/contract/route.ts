import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getResend, FROM } from "@/lib/resend";
import { fmt } from "@/lib/pricing";
import type { Contract } from "@/types/pricing";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contractId } = await request.json();
  if (!contractId) return NextResponse.json({ error: "Contract ID required" }, { status: 400 });

  const [{ data: contract }, { data: profile }] = await Promise.all([
    supabase.from("contracts").select("*").eq("id", contractId).eq("user_id", user.id).single(),
    supabase.from("profiles").select("business_name, contact_name, phone, website").eq("id", user.id).single(),
  ]);

  if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  if (!contract.share_token) return NextResponse.json({ error: "Contract has no share link" }, { status: 400 });

  const c = contract as Contract;
  const biz = profile as { business_name: string | null; contact_name: string | null; phone: string | null; website: string | null } | null;

  const businessName = biz?.business_name || biz?.contact_name || user.email;
  const signLink = `${process.env.NEXT_PUBLIC_SITE_URL}/c/${c.share_token}`;

  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to: c.client_email,
    subject: `Contract from ${businessName}${c.contract_number ? ` — ${c.contract_number}` : ""}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #2c2c2c;">
        <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.4; margin-bottom: 24px;">${businessName}</p>
        <h1 style="font-size: 28px; font-weight: 300; font-style: italic; margin-bottom: 6px; line-height: 1.2;">
          Your photography contract is ready
        </h1>
        <p style="font-size: 12px; opacity: 0.4; margin-bottom: 32px;">${[c.contract_number, c.package_name].filter(Boolean).join("  ·  ") || "&nbsp;"}</p>

        <p style="font-size: 14px; line-height: 1.7; opacity: 0.8; margin-bottom: 28px;">
          Please review and sign your contract for ${fmt(c.price)}${c.session_date ? ` — session on ${new Date(c.session_date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}` : ""}. No printing or scanning needed, just sign right in your browser.
        </p>

        <a href="${signLink}" style="display: inline-block; background: #111111; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; font-family: 'DM Sans', sans-serif;">
          Review &amp; Sign
        </a>

        <hr style="margin: 36px 0 20px; border: none; border-top: 1px solid #eeeeee;" />
        <p style="font-size: 11px; opacity: 0.3; line-height: 1.6;">${businessName}${biz?.phone ? ` · ${biz.phone}` : ""}${biz?.website ? ` · ${biz.website}` : ""}</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
