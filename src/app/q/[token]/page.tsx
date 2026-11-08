import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import type { Quote, SessionType } from "@/types/pricing";
import { buildProposal } from "@/lib/proposal-data";
import { ProposalDocument } from "@/components/pricing/proposal-document";

export const dynamic = "force-dynamic";

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  // Service-role read, scoped to this one token — quotes never need an anon-readable policy.
  const supabase = createAdminClient();

  const { data: quoteData } = await supabase
    .from("quotes")
    .select("*")
    .eq("share_token", token)
    .single();

  if (!quoteData) notFound();
  const q = quoteData as Quote;

  const [{ data: profileData }, sessionResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("business_name, contact_name, phone, website, logo_url, payment_terms, tier")
      .eq("id", q.user_id!)
      .single(),
    q.session_type_id
      ? supabase.from("session_types").select("*").eq("id", q.session_type_id).single()
      : Promise.resolve({ data: null }),
  ]);

  const proposal = buildProposal(q, profileData, sessionResult.data as SessionType | null);

  return <ProposalDocument data={proposal} mode="share" />;
}
