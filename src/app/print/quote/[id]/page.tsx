import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { Quote, SessionType } from "@/types/pricing";
import { buildProposal } from "@/lib/proposal-data";
import { ProposalDocument } from "@/components/pricing/proposal-document";
import { PrintTrigger } from "./print-trigger";

export default async function QuotePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const [{ data: quote }, { data: profile }] = await Promise.all([
    supabase.from("quotes").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase
      .from("profiles")
      .select("business_name, contact_name, phone, website, tier, logo_url, payment_terms")
      .eq("id", user.id)
      .single(),
  ]);

  if (!quote) redirect("/studio/quotes");
  const q = quote as Quote;

  let sessionType: SessionType | null = null;
  if (q.session_type_id) {
    const { data: st } = await supabase
      .from("session_types")
      .select("*")
      .eq("id", q.session_type_id)
      .single();
    sessionType = st as SessionType | null;
  }

  const proposal = buildProposal(q, profile, sessionType);
  if (!proposal.business.name) proposal.business.name = user.email ?? "";
  const pdfTitle = q.client_name ? `Proposal — ${q.client_name}` : q.quote_name || "Proposal";

  return (
    <>
      <PrintTrigger title={pdfTitle} />
      <ProposalDocument data={proposal} mode="print" />
    </>
  );
}
