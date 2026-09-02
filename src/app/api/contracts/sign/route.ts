import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const { token, signatureImage, typedName } = await request.json();

  if (!token || !signatureImage || !typedName?.trim()) {
    return NextResponse.json({ error: "Missing signature, typed name, or token" }, { status: 400 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const signerIp = forwardedFor ? forwardedFor.split(",")[0].trim() : null;

  const supabase = createAdminClient();

  // Single atomic update — only succeeds if the contract exists and isn't already
  // signed, so two near-simultaneous submits for the same token can't both land.
  const { data, error } = await supabase
    .from("contracts")
    .update({
      status: "signed",
      signature_image: signatureImage,
      signer_typed_name: typedName.trim(),
      signed_at: new Date().toISOString(),
      signer_ip: signerIp,
    })
    .eq("share_token", token)
    .neq("status", "signed")
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Unable to sign this contract — it may not exist or may already be signed." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
