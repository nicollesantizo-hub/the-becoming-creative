import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, contact_name, phone, website")
    .eq("id", user.id)
    .single();

  return (
    <div className="px-5 md:px-10 py-10 max-w-lg">
      <p
        className="text-xs uppercase tracking-widest opacity-40 mb-4"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        Settings
      </p>
      <h1
        className="text-3xl md:text-4xl font-light italic mb-2"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
      >
        Your business.
      </h1>
      <p
        className="text-sm opacity-50 mb-10 leading-relaxed"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
      >
        This info appears on your PDF quotes.
      </p>
      <SettingsForm
        userId={user.id}
        email={user.email ?? ""}
        initialValues={{
          business_name: profile?.business_name ?? "",
          contact_name: profile?.contact_name ?? "",
          phone: profile?.phone ?? "",
          website: profile?.website ?? "",
        }}
      />

      {user.email === "aida@aidavisuals.com" && (
        <div className="mt-12 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
          <Link
            href="/admin"
            className="text-xs uppercase tracking-widest opacity-30 hover:opacity-60 transition-opacity"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            Admin →
          </Link>
        </div>
      )}
    </div>
  );
}
