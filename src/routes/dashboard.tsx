import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Heart, MessageSquare, User, Home } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatXAF } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "My account — Cozy Tower" }] }),
  component: DashboardPage,
});

type Tab = "bookings" | "favorites" | "messages" | "profile";

type Booking = {
  id: string; check_in: string; check_out: string; nights: number; total_price: number;
  status: string; guests: number;
  apartments: { title: string; neighborhood: string; slug: string; apartment_images: { url: string; is_cover: boolean; sort_order: number }[] } | null;
};

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ display_name: string; phone: string; avatar_url: string }>({ display_name: "", phone: "", avatar_url: "" });

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: bks } = await supabase
        .from("bookings")
        .select("id, check_in, check_out, nights, total_price, status, guests, apartments(title, neighborhood, slug, apartment_images(url, is_cover, sort_order))")
        .eq("user_id", user.id).order("created_at", { ascending: false });
      if (bks) setBookings(bks as any);

      const { data: favs } = await supabase
        .from("favorites")
        .select("id, apartments(id, slug, title, neighborhood, price_per_night, rating, review_count, is_available, bedrooms, apartment_images(url, is_cover, sort_order))")
        .eq("user_id", user.id);
      if (favs) setFavorites(favs);

      const { data: pf } = await supabase.from("profiles").select("display_name, phone, avatar_url").eq("id", user.id).maybeSingle();
      if (pf) setProfile({ display_name: pf.display_name ?? "", phone: pf.phone ?? "", avatar_url: pf.avatar_url ?? "" });
    })();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update(profile).eq("id", user.id);
    if (error) toast.error(error.message); else toast.success("Profile updated");
  };

  if (!user) return <PageShell><div className="h-96" /></PageShell>;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "bookings", label: "My bookings", icon: Calendar },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          <aside>
            <div className="rounded-2xl bg-card border border-border shadow-soft p-2">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-base ${
                    tab === t.id ? "gradient-cta text-secondary-foreground shadow-soft" : "text-foreground hover:bg-muted"
                  }`}>
                  <t.icon className="h-4 w-4" /> {t.label}
                </button>
              ))}
            </div>
          </aside>

          <div>
            {tab === "bookings" && (
              <>
                <h1 className="text-2xl md:text-3xl font-bold mb-6">My bookings</h1>
                {bookings.length === 0 ? (
                  <Empty icon={Home} title="No bookings yet" cta="Browse apartments" to="/apartments" />
                ) : (
                  <div className="space-y-4">
                    {bookings.map((b) => {
                      const imgs = (b.apartments?.apartment_images ?? []).slice().sort((x, y) => Number(y.is_cover) - Number(x.is_cover) || x.sort_order - y.sort_order);
                      const cover = imgs[0]?.url;
                      return (
                        <Link key={b.id} to="/apartments/$slug" params={{ slug: b.apartments?.slug ?? "" }}
                          className="flex gap-4 rounded-2xl bg-card border border-border shadow-soft p-3 hover-lift">
                          <img src={cover} alt="" className="h-28 w-28 md:h-32 md:w-32 rounded-xl object-cover" />
                          <div className="flex-1 min-w-0 py-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold">{b.apartments?.title}</h3>
                                <p className="text-sm text-muted-foreground">{b.apartments?.neighborhood}, Douala</p>
                              </div>
                              <Badge status={b.status} />
                            </div>
                            <div className="mt-3 text-sm text-foreground/80">
                              {b.check_in} → {b.check_out} · {b.nights} nights · {b.guests} guest{b.guests > 1 ? "s" : ""}
                            </div>
                            <div className="mt-1.5 font-bold">{formatXAF(b.total_price)}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {tab === "favorites" && (
              <>
                <h1 className="text-2xl md:text-3xl font-bold mb-6">Favorites</h1>
                {favorites.length === 0 ? (
                  <Empty icon={Heart} title="No favorites yet" cta="Discover apartments" to="/apartments" />
                ) : (
                  <div className="grid md:grid-cols-2 gap-5">
                    {favorites.map((f) => (
                      <Link key={f.id} to="/apartments/$slug" params={{ slug: f.apartments.slug }}
                        className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden hover-lift">
                        <img src={f.apartments.apartment_images?.[0]?.url} alt="" className="h-40 w-full object-cover" />
                        <div className="p-4">
                          <h3 className="font-semibold">{f.apartments.title}</h3>
                          <p className="text-sm text-muted-foreground">{f.apartments.neighborhood}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === "messages" && (
              <>
                <h1 className="text-2xl md:text-3xl font-bold mb-6">Messages</h1>
                <Empty icon={MessageSquare} title="No messages yet" cta="Browse apartments" to="/apartments" />
              </>
            )}

            {tab === "profile" && (
              <>
                <h1 className="text-2xl md:text-3xl font-bold mb-6">Profile</h1>
                <div className="rounded-2xl bg-card border border-border shadow-soft p-6 max-w-lg space-y-4">
                  <Field label="Display name"><input value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} className="input" /></Field>
                  <Field label="Phone"><input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="input" /></Field>
                  <Field label="Email"><input value={user.email ?? ""} disabled className="input opacity-60" /></Field>
                  <Button onClick={saveProfile} className="gradient-cta text-secondary-foreground">Save changes</Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`.input{width:100%;border:1px solid var(--color-input);background:var(--color-background);border-radius:10px;padding:0.6rem 0.75rem;font-size:0.875rem}.input:focus{outline:none;box-shadow:0 0 0 3px var(--ring)}`}</style>
    </PageShell>
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-secondary/15 text-secondary",
    pending: "bg-accent/15 text-accent-foreground",
    cancelled: "bg-destructive/15 text-destructive",
    completed: "bg-muted text-muted-foreground",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] ?? "bg-muted"}`}>{status}</span>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</span>{children}</label>;
}

function Empty({ icon: Icon, title, cta, to }: { icon: any; title: string; cta: string; to: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border shadow-soft p-12 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-muted grid place-items-center mb-4"><Icon className="h-7 w-7 text-muted-foreground" /></div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <Link to={to} className="mt-4 inline-block"><Button className="gradient-cta text-secondary-foreground">{cta}</Button></Link>
    </div>
  );
}
