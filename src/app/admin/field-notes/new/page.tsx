import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { PostForm } from "./post-form";

export default async function NewPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== "aida@aidavisuals.com") redirect("/");

  return (
    <main className="min-h-screen px-8 py-16 max-w-2xl mx-auto" style={{ backgroundColor: "var(--cream)" }}>
      <p
        className="text-xs uppercase tracking-widest opacity-40 mb-4"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        Admin · Field Notes
      </p>
      <h1
        className="text-3xl font-light italic mb-10"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
      >
        New post
      </h1>
      <PostForm />
    </main>
  );
}
