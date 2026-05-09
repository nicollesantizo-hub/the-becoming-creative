import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { PricingNav } from "@/components/pricing/pricing-nav";

export const metadata = {
  title: "Price My Work — The Becoming Creative",
  description: "Photography pricing and quoting tool for working photographers.",
};

export default async function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <PricingNav profile={profile} />
      <main className="md:pl-52 pt-14 md:pt-0 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
