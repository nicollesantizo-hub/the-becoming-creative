import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { PostForm } from "./post-form";

const ADMIN_EMAIL = "aida@aidavisuals.com";

export default async function NewPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) redirect("/");

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <div
        className="px-8 py-6 flex items-center gap-4 border-b"
        style={{ borderColor: "var(--border)", backgroundColor: "white" }}
      >
        <Link
          href="/admin"
          className="text-xs uppercase tracking-widest opacity-40 hover:opacity-70 transition-opacity"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
        >
          ← Admin
        </Link>
        <span className="opacity-20" style={{ color: "var(--charcoal)" }}>·</span>
        <p
          className="text-xs uppercase tracking-widest opacity-40"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
        >
          New post
        </p>
      </div>
      <div className="px-8 py-10 max-w-2xl">
        <PostForm />
      </div>
    </main>
  );
}
