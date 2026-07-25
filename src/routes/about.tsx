import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, MapPin, Smartphone, ShieldCheck, KeyRound } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { FacebookReviews } from "@/components/FacebookReviews";
import { InstagramEmbed } from "@/components/InstagramEmbed";
import { TikTokEmbed, TIKTOK_EMBED_WIDTH } from "@/components/TikTokEmbed";
import { FacebookPostEmbed, isFacebookVideoUrl } from "@/components/FacebookPostEmbed";
import { FlyerGallery } from "@/components/FlyerGallery";
import { supabase } from "@/integrations/supabase/client";

import exteriorImg from "@/assets/story/exterior.jpg";
import roomPremium from "@/assets/story/room-premium.jpg";
import roomConfort from "@/assets/story/room-confort.jpg";
import roomStandard from "@/assets/story/room-standard.jpg";
import roomStudio from "@/assets/story/room-studio.jpg";
import livingPurple from "@/assets/story/living-purple.jpg";
import livingWood from "@/assets/story/living-wood.jpg";
import livingGold from "@/assets/story/living-gold.jpg";
import livingTeal from "@/assets/story/living-teal.jpg";
import flyer1 from "@/assets/Cozytower flyer/1.jpg";
import flyer2 from "@/assets/Cozytower flyer/2.jpg";
import flyer3 from "@/assets/Cozytower flyer/3.jpg";
import flyer4 from "@/assets/Cozytower flyer/4.jpg";
import flyer5 from "@/assets/Cozytower flyer/5.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Cozy Tower" },
      { name: "description", content: "Cozy Tower is one boutique residence in Deido, Douala, opposite Hôtel Alvi — not a marketplace. Here's what that means for a stay." },
      { property: "og:title", content: "About Cozy Tower" },
      { property: "og:description", content: "One residence in Deido, Douala, run in-house since 2025." },
    ],
  }),
  component: AboutPage,
});

const ROOM_TIERS = [
  { name: "Studio Moderne", stars: 2, img: roomStudio, desc: "Compact, sleek, and easy on the budget — ideal for a simple, chic stay." },
  { name: "Appartement Standard", stars: 3, img: roomStandard, desc: "Modern comfort at an accessible price." },
  { name: "Appartement Confort+", stars: 4, img: roomConfort, desc: "The balance of style and budget, under a warm wood-panelled ceiling." },
  { name: "Appartement Premium", stars: 5, img: roomPremium, desc: "Space and elegance for an exceptional stay." },
];

const FALLBACK_FLYERS = [
  { id: "flyer-1", url: flyer1, alt: "Cozy Tower flyer — all room packages" },
  { id: "flyer-2", url: flyer2, alt: "Cozy Tower flyer — Studio Moderne" },
  { id: "flyer-3", url: flyer3, alt: "Cozy Tower flyer — Appartement Confort+" },
  { id: "flyer-4", url: flyer4, alt: "Cozy Tower flyer — Appartement Premium" },
  { id: "flyer-5", url: flyer5, alt: "Cozy Tower flyer — Appartement Standard" },
];

// Masonry moments: varied aspect ratios / column spans for editorial feel.
const MOMENTS = [
  { img: livingWood, alt: "Wood-panelled living room", cls: "md:col-span-2 md:row-span-2 aspect-[4/5]" },
  { img: livingTeal, alt: "Teal living room with backlit ceiling", cls: "aspect-square" },
  { img: livingGold, alt: "Living room with gold-lit ceiling", cls: "aspect-square" },
  { img: livingPurple, alt: "Media room with purple ambient lighting", cls: "md:col-span-2 aspect-[16/10]" },
];

const VALUES = [
  { icon: KeyRound, title: "One set of keys", desc: "We furnish, clean and manage every room ourselves — nothing is sub-let or listed by a third party." },
  { icon: Smartphone, title: "Pay how Douala pays", desc: "Mobile Money, Orange Money, or card — booking works the way people actually pay here." },
  { icon: ShieldCheck, title: "Built for the grid we have", desc: "Backup power and a water reserve on every floor, so an outage doesn't interrupt your stay." },
];

type SocialPost = { id: string; platform: string; url: string };

const FALLBACK_POSTS: SocialPost[] = [
  {
    id: "fallback-fb-2",
    platform: "facebook",
    url: "https://www.facebook.com/permalink.php?story_fbid=pfbid02yzWC7SNREQXaDocMGUH3P9WDYuUUBfvW1hxtwjvwJfZakTFdkSHVoAD8uuFTZfQPl&id=61577243422593",
  },
  {
    id: "fallback-fb-3",
    platform: "facebook",
    url: "https://www.facebook.com/permalink.php?story_fbid=pfbid0DaTVRNDn83wSq5a6XFKsrVsbaZwwbkvcjn1mC9LEMxk994V2suDGr9LGMJbfXdMjl&id=61577243422593",
  },
  { id: "fallback-tt-1", platform: "tiktok", url: "https://www.tiktok.com/@the.cozy.tower/video/7538005610063875384" },
  { id: "fallback-tt-2", platform: "tiktok", url: "https://www.tiktok.com/@the.cozy.tower/photo/7568257895771442444" },
  { id: "fallback-tt-3", platform: "tiktok", url: "https://www.tiktok.com/@the.cozy.tower/photo/7512417407986715910" },
  { id: "fallback-tt-4", platform: "tiktok", url: "https://www.tiktok.com/@the.cozy.tower/photo/7512121574015651078" },
];

function SectionDivider() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="h-1.5 w-1.5 rounded-full bg-secondary/60" />
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-[0.2em]">
      <span className="h-px w-6 bg-secondary/60" />
      {children}
    </span>
  );
}

function AboutPage() {
  const [posts, setPosts] = useState<SocialPost[]>(FALLBACK_POSTS);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("social_posts").select("id, platform, url").order("sort_order");
      if (data && data.length > 0) setPosts([...FALLBACK_POSTS, ...data]);
    })();
  }, []);

  const facebookPosts = posts.filter((p) => p.platform === "facebook");
  const facebookClips = facebookPosts.filter((p) => isFacebookVideoUrl(p.url));
  const facebookTextPosts = facebookPosts.filter((p) => !isFacebookVideoUrl(p.url));
  const instagramPosts = posts.filter((p) => p.platform === "instagram");
  const tiktokPosts = posts.filter((p) => p.platform === "tiktok");

  return (
    <PageShell>
      {/* HERO — editorial, asymmetric */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -right-24 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-12 gap-8 md:gap-12 items-center">
          <Reveal className="order-2 md:order-1 md:col-span-6 lg:col-span-5">
            <Eyebrow>Our story · Est. 2025</Eyebrow>
            <h1 className="mt-5 font-display font-semibold tracking-tight text-foreground leading-[0.98] text-[2.75rem] sm:text-6xl md:text-[4.25rem]">
              One blue tower in <span className="italic text-secondary">Deido.</span>
              <span className="block mt-1">Every room, ours.</span>
            </h1>
            <div className="mt-8 flex items-start gap-4">
              <div className="mt-2 h-10 w-1 rounded-full bg-gradient-to-b from-secondary to-accent shrink-0" />
              <p className="text-lg text-foreground/80 leading-relaxed">
                Cozy Tower opened its doors in 2025 in Deido, Douala — right across the street from Hôtel Alvi, so it's easy to find even on a first visit. It's a single residence, not a marketplace: every room package pictured on this site is inside this one building, furnished and looked after by the same small team.
              </p>
            </div>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-4 py-2 text-sm font-medium text-foreground/80 shadow-soft">
              <MapPin className="h-4 w-4 text-secondary shrink-0" />
              Douala – Deido, entrée en face de l'hôtel Alvi
            </div>
          </Reveal>

          <Reveal delay={150} className="order-1 md:order-2 md:col-span-6 lg:col-span-7">
            <div className="relative">
              <div className="absolute -inset-4 md:-inset-6 rounded-[2rem] bg-gradient-to-br from-secondary/25 via-accent/10 to-transparent blur-2xl" />
              <div className="relative rounded-[1.75rem] overflow-hidden shadow-elegant ring-1 ring-black/5">
                <img
                  src={exteriorImg}
                  alt="Cozy Tower building exterior in Deido, Douala"
                  className="w-full aspect-[4/5] md:aspect-[5/6] object-cover transition-transform duration-[1200ms] hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                <div className="absolute left-4 right-4 bottom-4 md:left-6 md:right-6 md:bottom-6">
                  <div className="glass-strong rounded-2xl px-4 py-3 md:px-5 md:py-4 shadow-soft flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl gradient-cta grid place-items-center text-secondary-foreground shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">The building</p>
                      <p className="text-sm font-semibold text-foreground truncate">Deido · Bonatéki, face à l'hôtel Alvi</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* small floating tile */}
              <div className="hidden md:flex absolute -left-6 top-10 items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-elegant ring-1 ring-border">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />)}
                </div>
                <span className="text-xs font-semibold text-foreground/80">Run in-house since 2025</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SectionDivider />

      {/* ROOM TIERS — editorial cards with ribbon */}
      <section className="bg-surface border-y border-border relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background/60 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <Eyebrow>Inside the building</Eyebrow>
            <h2 className="mt-4 text-3xl md:text-5xl font-display font-semibold leading-[1.05]">Four room packages, <span className="italic text-secondary">one address</span></h2>
            <p className="mt-4 text-foreground/70">Same wifi, same security, same team — the difference is space and finish.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {ROOM_TIERS.map((tier, i) => (
              <Reveal key={tier.name} delay={i * 100}>
                <article className="group relative h-full rounded-3xl overflow-hidden bg-card shadow-soft ring-1 ring-border/70 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-elegant hover:ring-secondary/40">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={tier.img}
                      alt={tier.name}
                      className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent opacity-90" />
                    {/* Ribbon badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/95 backdrop-blur px-2.5 py-1 shadow-soft">
                      {Array.from({ length: tier.stars }).map((_, s) => (
                        <Star key={s} className="h-3 w-3 fill-accent text-accent" />
                      ))}
                    </div>
                    {/* Tier index */}
                    <div className="absolute top-3 right-3 h-8 w-8 grid place-items-center rounded-full glass-strong text-[11px] font-bold text-foreground shadow-soft">
                      0{i + 1}
                    </div>
                    {/* Title over image */}
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h3 className="font-display text-lg md:text-xl font-semibold text-white leading-tight drop-shadow-sm">
                        {tier.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">{tier.desc}</p>
                    <div className="mt-4 h-px bg-gradient-to-r from-border via-border to-transparent" />
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="uppercase tracking-widest font-semibold text-secondary">Package {i + 1} / 4</span>
                      <span className="text-muted-foreground">In-house</span>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MOMENTS — masonry, editorial */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <Eyebrow>No two rooms alike</Eyebrow>
            <h2 className="mt-4 text-3xl md:text-5xl font-display font-semibold leading-[1.05]">
              Every unit has its <span className="italic text-secondary">own mood</span>
            </h2>
          </div>
          <p className="text-foreground/70 max-w-sm md:text-right">
            A curated look inside — wood, teal, gold, purple. Same building, four different evenings.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[minmax(140px,auto)]">
          {MOMENTS.map((m, i) => (
            <Reveal key={m.alt} delay={i * 90} className={m.cls}>
              <figure className="group relative h-full w-full overflow-hidden rounded-2xl md:rounded-3xl shadow-soft ring-1 ring-border/60 hover:shadow-elegant transition-all duration-500">
                <img
                  src={m.img}
                  alt={m.alt}
                  className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <figcaption className="absolute left-3 bottom-3 text-[11px] uppercase tracking-widest font-semibold text-white/95 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-500">
                  {m.alt}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* WHY IT WORKS — richer two-column feature list */}
      <section className="bg-surface border-y border-border relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <Reveal className="lg:col-span-4 lg:sticky lg:top-24">
            <Eyebrow>Why it works</Eyebrow>
            <h2 className="mt-4 text-3xl md:text-5xl font-display font-semibold leading-[1.05]">
              Built around how <span className="italic text-secondary">Douala</span> actually lives
            </h2>
            <p className="mt-5 text-foreground/70 leading-relaxed">
              Three small choices that change the whole stay — the reason guests come back for a second night without renegotiating anything.
            </p>
          </Reveal>

          <div className="lg:col-span-8 space-y-5">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 100}>
                <article className="group relative rounded-3xl bg-card ring-1 ring-border/70 shadow-soft hover:shadow-elegant transition-all duration-500 hover:-translate-y-0.5 p-6 md:p-7">
                  <div className="flex items-start gap-5">
                    <div className="relative shrink-0">
                      <div className="h-14 w-14 rounded-2xl gradient-cta grid place-items-center text-secondary-foreground shadow-glow-orange">
                        <v.icon className="h-6 w-6" />
                      </div>
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-card ring-1 ring-border grid place-items-center text-[10px] font-bold text-foreground/70">
                        {i + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight">{v.title}</h3>
                        <span className="hidden sm:block text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                          0{i + 1} / 03
                        </span>
                      </div>
                      <p className="mt-3 text-foreground/75 leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FLYERS */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <Reveal>
          <FlyerGallery fallback={FALLBACK_FLYERS} />
        </Reveal>
      </div>

      <SectionDivider />

      {/* FACEBOOK TIMELINE */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <Reveal className="text-center mb-8">
          <Eyebrow>From our Facebook page</Eyebrow>
        </Reveal>
        <Reveal>
          <FacebookReviews tab="timeline" />
        </Reveal>
      </div>

      {/* FEATURED CLIPS */}
      {(facebookClips.length > 0 || instagramPosts.length > 0 || tiktokPosts.length > 0) && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <Reveal className="text-center mb-8">
            <Eyebrow>Featured clips</Eyebrow>
          </Reveal>
          <Reveal>
            <div className="flex flex-wrap justify-center gap-6">
              {facebookClips.map((p) => (
                <div key={p.id} className="rounded-2xl overflow-hidden shadow-soft bg-card ring-1 ring-border/60" style={{ width: TIKTOK_EMBED_WIDTH }}>
                  <FacebookPostEmbed url={p.url} />
                </div>
              ))}
              {instagramPosts.map((p) => (
                <div key={p.id} className="rounded-2xl overflow-hidden shadow-soft bg-card ring-1 ring-border/60" style={{ width: TIKTOK_EMBED_WIDTH }}>
                  <InstagramEmbed url={p.url} />
                </div>
              ))}
              {tiktokPosts.map((p) => (
                <div key={p.id} className="rounded-2xl overflow-hidden shadow-soft bg-card ring-1 ring-border/60" style={{ width: TIKTOK_EMBED_WIDTH }}>
                  <TikTokEmbed url={p.url} />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      )}

      {/* FEATURED POSTS */}
      {facebookTextPosts.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20 md:pb-28">
          <Reveal className="text-center mb-8">
            <Eyebrow>Featured posts</Eyebrow>
          </Reveal>
          <Reveal>
            <div className="flex flex-wrap justify-center gap-6">
              {facebookTextPosts.map((p) => (
                <div key={p.id} className="rounded-2xl overflow-hidden shadow-soft bg-card ring-1 ring-border/60">
                  <FacebookPostEmbed url={p.url} />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      )}
    </PageShell>
  );
}
