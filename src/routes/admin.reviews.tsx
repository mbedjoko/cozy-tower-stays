import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

type Review = { id: string; author_name: string | null; rating: number; comment: string; apartment_id: string | null; created_at: string };
type Apt = { id: string; title: string };

function AdminReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [apartments, setApartments] = useState<Apt[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [apartmentId, setApartmentId] = useState("");
  const [source, setSource] = useState("");

  const load = async () => {
    setLoading(true);
    const [{ data: rvs }, { data: apts }] = await Promise.all([
      supabase.from("reviews").select("id, author_name, rating, comment, apartment_id, created_at").order("created_at", { ascending: false }),
      supabase.from("apartments").select("id, title").order("title"),
    ]);
    setReviews(rvs ?? []);
    setApartments(apts ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const comment_final = source ? `${comment}\n\n— originally posted on ${source}` : comment;
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      author_name: authorName || null,
      rating,
      comment: comment_final,
      apartment_id: apartmentId || null,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Review added");
    setAuthorName(""); setRating(5); setComment(""); setApartmentId(""); setSource("");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Reviews</h1>
      <p className="text-muted-foreground mt-1">
        Manually add real guest feedback you've collected from Instagram, TikTok, WhatsApp, or elsewhere. Leave "Room package" empty to show it site-wide on the homepage.
      </p>

      <section className="mt-8 rounded-2xl bg-card border border-border shadow-soft p-5 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Add a real review</h2>
        <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
          <Field label="Guest name">
            <input required value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="input" placeholder="e.g. Aurelie N." />
          </Field>
          <Field label="Rating">
            <select value={rating} onChange={(e) => setRating(+e.target.value)} className="input">
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
            </select>
          </Field>
          <Field label="Room package (optional — leave blank for homepage)">
            <select value={apartmentId} onChange={(e) => setApartmentId(e.target.value)} className="input">
              <option value="">General / homepage</option>
              {apartments.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </Field>
          <Field label="Where you got this from (optional)">
            <input value={source} onChange={(e) => setSource(e.target.value)} className="input" placeholder="e.g. Instagram DM, TikTok comment" />
          </Field>
          <div className="md:col-span-2">
            <Field label="What they said">
              <textarea required rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className="input" placeholder="Paste or quote the real guest feedback" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={submitting} className="gradient-cta text-secondary-foreground">
              {submitting ? "Adding…" : "Add review"}
            </Button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-3">All reviews ({reviews.length})</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl bg-card border border-border p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex gap-0.5 mb-1.5">
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />)}
                  </div>
                  <p className="text-sm text-foreground/90 whitespace-pre-line">{r.comment}</p>
                  <p className="mt-2 text-xs text-muted-foreground font-medium">
                    — {r.author_name ?? "Anonymous"} · {r.apartment_id ? apartments.find(a => a.id === r.apartment_id)?.title ?? "Unknown package" : "General / homepage"}
                  </p>
                </div>
                <button onClick={() => remove(r.id)} className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-base" aria-label="Delete review">
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</span>{children}</label>;
}
