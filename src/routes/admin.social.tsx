import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { extractFacebookUrl } from "@/components/FacebookPostEmbed";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/social")({
  component: AdminSocial,
});

type SocialPost = { id: string; platform: string; url: string; sort_order: number };
type Platform = "facebook" | "instagram" | "tiktok";

const PLACEHOLDERS: Record<Platform, string> = {
  facebook: "Reel, video, or post link — or paste the full embed code, the link is extracted automatically",
  instagram: "https://www.instagram.com/p/...",
  tiktok: "https://www.tiktok.com/@.../video/...",
};

function AdminSocial() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [platform, setPlatform] = useState<Platform>("facebook");
  const [url, setUrl] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("social_posts").select("id, platform, url, sort_order").order("sort_order");
    setPosts(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const cleanUrl = platform === "facebook" ? extractFacebookUrl(url) : url.trim();
    const { error } = await (supabase as any).from("social_posts").insert({
      platform, url: cleanUrl, sort_order: posts.length,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Post added");
    setUrl("");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this post?")) return;
    const { error } = await (supabase as any).from("social_posts").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removed"); load(); }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Facebook, Instagram &amp; TikTok posts</h1>
      <p className="text-muted-foreground mt-1">
        Paste the link of a specific Facebook video/reel, Instagram post, or TikTok video you want featured on the About page. For Facebook you can paste the raw embed code Facebook gives you — the link gets extracted automatically. There's no automatic feed — add new links here whenever you want to update what's shown.
      </p>

      <section className="mt-8 rounded-2xl bg-card border border-border shadow-soft p-5 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Add a post</h2>
        <form onSubmit={submit} className="grid md:grid-cols-[160px_1fr_auto] gap-3 items-end">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Platform</span>
            <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className="input">
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Post URL (or embed code)</span>
            <input
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input"
              placeholder={PLACEHOLDERS[platform]}
            />
          </label>
          <Button type="submit" disabled={submitting} className="gradient-cta text-secondary-foreground">
            {submitting ? "Adding…" : "Add"}
          </Button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-3">Featured posts ({posts.length})</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts featured yet — nothing will show on the About page's clips section until you add one.</p>
        ) : (
          <div className="space-y-2">
            {posts.map((p) => (
              <div key={p.id} className="rounded-xl bg-card border border-border p-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">{p.platform}</span>
                  <p className="text-sm text-foreground/90 truncate">{p.url}</p>
                </div>
                <button onClick={() => remove(p.id)} className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-base" aria-label="Remove post">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{`.input{width:100%;border:1px solid var(--color-input);background:var(--color-background);border-radius:10px;padding:0.6rem 0.75rem;font-size:0.875rem}.input:focus{outline:none;box-shadow:0 0 0 3px var(--ring)}`}</style>
    </div>
  );
}
