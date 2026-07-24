import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Calendar, Users, Star, Shield, Sparkles, Headphones, ArrowRight, BedDouble } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ApartmentCard, type ApartmentCardData } from "@/components/ApartmentCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero.jpg";
import { todayISO } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cozy Tower — Premium apartments in Douala" },
      { name: "description", content: "Find your perfect short-stay apartment in Douala. Curated luxury, instant booking, mobile money supported." },
      { property: "og:title", content: "Cozy Tower — Premium apartments in Douala" },
      { property: "og:description", content: "Find your perfect stay in Douala. Curated, secure, and effortless." },
    ],
  }),
  component: HomePage,
});

type Review = { id: string; rating: number; comment: string; author_name: string | null };

function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<ApartmentCardData[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hero, setHero] = useState<{ url: string; caption: string | null } | null>(null);

  // search form
  const [roomType, setRoomType] = useState("");
  const [checkIn, setCheckIn] = useState(todayISO(1));
  const [checkOut, setCheckOut] = useState(todayISO(3));
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    (async () => {
      const { data: apts } = await supabase
        .from("apartments")
        .select("id, slug, title, neighborhood, price_per_night, rating, review_count, is_available, bedrooms, apartment_images(url, is_cover, sort_order)")
        .eq("is_featured", true)
        .limit(6);
      if (apts) {
        setFeatured(
          apts.map((a) => {
            const imgs = (a.apartment_images ?? []).slice().sort((x, y) => Number(y.is_cover) - Number(x.is_cover) || x.sort_order - y.sort_order);
            return {
              id: a.id, slug: a.slug, title: a.title, neighborhood: a.neighborhood,
              price_per_night: a.price_per_night, rating: Number(a.rating), review_count: a.review_count,
              is_available: a.is_available, bedrooms: a.bedrooms,
              cover_url: imgs[0]?.url ?? "",
            };
          })
        );
      }

      const { data: rvs } = await supabase
        .from("reviews").select("id, rating, comment, author_name")
        .is("apartment_id", null).limit(6);
      if (rvs) setReviews(rvs);

      const { data: site } = await supabase
        .from("site_images").select("url, caption").eq("key", "landing_hero").maybeSingle();
      if (site) setHero({ url: site.url, caption: site.caption });
    })();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/apartments",
      search: { q: roomType, checkIn, checkOut, guests } as any,
    });
  };

  const heroUrl = hero?.url?.startsWith("/src/") ? heroImg : (hero?.url || heroImg);

  return (
    <PageShell transparentNav>
      {/* HERO */}
      <section className="relative min-h-[88vh] md:min-h-[92vh] flex items-end md:items-center pb-32 md:pb-0">
        <img src={heroUrl} alt="Modern apartment building in Douala at night" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero-overlay)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, oklch(0.13 0.04 265 / 0.40) 0%, oklch(0.13 0.04 265 / 0.10) 30%, oklch(0.13 0.04 265 / 0.85) 100%)" }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-white/90 text-xs font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Curated luxury stays in Douala
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight">
              Find your perfect <br className="hidden md:block" />
              <span className="text-accent">stay</span> in Douala.
            </h1>
            <p className="mt-5 text-lg text-white/80 max-w-xl">
              A single premium residence in Deido, Bonatéki — with room packages from cozy studios to spacious 3-bedroom family suites. Book in minutes, settle in within hours.
            </p>
          </div>

          {/* Glassmorphism search bar */}
          <form
            onSubmit={handleSearch}
            className="mt-10 glass-strong rounded-2xl p-2 md:p-3 shadow-elegant grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr_0.9fr_auto] gap-2 md:gap-1.5"
          >
            <Field icon={<BedDouble className="h-4 w-4" />} label="Room package">
              <select
                value={roomType} onChange={(e) => setRoomType(e.target.value)}
                className="w-full bg-transparent text-foreground text-sm font-medium focus:outline-none"
              >
                <option value="">Any package</option>
                <option value="Studio">Studio</option>
                <option value="1-Bedroom">1-Bedroom</option>
                <option value="2-Bedroom">2-Bedroom</option>
                <option value="3-Bedroom">3-Bedroom</option>
              </select>
            </Field>
            <Field icon={<Calendar className="h-4 w-4" />} label="Check-in">
              <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-transparent text-foreground text-sm font-medium focus:outline-none" />
            </Field>
            <Field icon={<Calendar className="h-4 w-4" />} label="Check-out">
              <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-transparent text-foreground text-sm font-medium focus:outline-none" />
            </Field>
            <Field icon={<Users className="h-4 w-4" />} label="Guests">
              <input type="number" min={1} max={12} value={guests} onChange={(e) => setGuests(+e.target.value)}
                className="w-full bg-transparent text-foreground text-sm font-medium focus:outline-none" />
            </Field>
            <Button type="submit" size="lg" className="gradient-cta text-secondary-foreground shadow-glow-green hover:opacity-95 h-full md:h-auto px-6">
              <Search className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Search</span>
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap gap-6 text-white/80 text-sm">
            <Stat value="500+" label="Verified stays" />
            <Stat value="4.9" label="Average rating" />
            <Stat value="24/7" label="Local support" />
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-semibold text-secondary uppercase tracking-wider">Featured</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold">Handpicked for you</h2>
          </div>
          <Link to="/apartments" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-secondary transition-base">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((a) => <ApartmentCard key={a.id} apt={a} />)}
        </div>
      </section>

      {/* WHY */}
      <section className="bg-surface border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "Verified hosts", desc: "Every apartment is personally inspected. No surprises." },
            { icon: Sparkles, title: "Premium standard", desc: "Designer interiors, fast wifi, full kitchens, AC." },
            { icon: Headphones, title: "24/7 local support", desc: "A real human responds in minutes, not hours." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl p-6 bg-card shadow-soft hover-lift">
              <div className="h-12 w-12 rounded-xl gradient-cta grid place-items-center text-secondary-foreground mb-4">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold text-secondary uppercase tracking-wider">Loved by guests</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">Real stays, real reviews</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl bg-card p-6 shadow-soft border border-border">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-accent text-accent" />)}
              </div>
              <p className="text-foreground/90 leading-relaxed">"{r.comment}"</p>
              <p className="mt-4 text-sm text-muted-foreground font-medium">— {r.author_name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-10 md:p-16 text-white text-center">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to feel at home in Douala?</h2>
            <p className="mt-4 text-white/80 max-w-xl mx-auto">Join thousands of travellers who trust Cozy Tower for their stays.</p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link to="/apartments">
                <Button size="lg" className="gradient-cta text-secondary-foreground shadow-glow-green hover:opacity-95">
                  Browse apartments
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                  Create an account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/70 hover:bg-white transition-base cursor-text">
      <span className="text-secondary">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
        {children}
      </span>
    </label>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/60 uppercase tracking-wider">{label}</div>
    </div>
  );
}
