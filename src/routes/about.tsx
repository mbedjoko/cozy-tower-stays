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

const MOMENTS = [
  { img: livingWood, alt: "Wood-panelled living room" },
  { img: livingTeal, alt: "Teal living room with backlit ceiling" },
  { img: livingGold, alt: "Living room with gold-lit ceiling" },
  { img: livingPurple, alt: "Media room with purple ambient lighting" },
];

const VALUES = [
  { icon: KeyRound, title: "One set of keys", desc: "We furnish, clean and manage every room ourselves — nothing is sub-let or listed by a third party." },
  { icon: Smartphone, title: "Pay how Douala pays", desc: "Mobile Money, Orange Money, or card — booking works the way people actually pay here." },
  { icon: ShieldCheck, title: "Built for the grid we have", desc: "Backup power and a water reserve on every floor, so an outage doesn't interrupt your stay." },
];

type SocialPost = { id: string; platform: string; url: string };

// Temporary hardcoded posts — remove once the social_posts table migration has
// been run and these are managed from /admin/social instead.
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
      {/* HERO — real building, real story */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -right-24 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-14 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <Reveal className="order-2 md:order-1">
            <p className="text-sm font-semibold text-secondary uppercase tracking-wider">Our story</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-display font-semibold tracking-tight leading-[1.1]">
              One blue tower in Deido. Every room, ours.
            </h1>
            <p className="mt-6 text-lg text-foreground/80 leading-relaxed">
              Cozy Tower opened its doors in 2025 in Deido, Douala — right across the street from Hôtel Alvi, so it's easy to find even on a first visit. It's a single residence, not a marketplace: every room package pictured on this site is inside this one building, furnished and looked after by the same small team.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-foreground/70">
              <MapPin className="h-4 w-4 text-secondary shrink-0" />
              Douala – Deido, entrée en face de l'hôtel Alvi
            </div>
          </Reveal>
          <Reveal delay={150} className="order-1 md:order-2">
            <img
              src={exteriorImg}
              alt="Cozy Tower building exterior in Deido, Douala"
              className="w-full aspect-[4/5] object-cover rounded-3xl shadow-elegant transition-transform duration-700 hover:scale-[1.02]"
            />
          </Reveal>
        </div>
      </section>

      {/* ROOM TIERS — tells the "what it's actually like" story */}
      <section className="bg-surface border-y border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold text-secondary uppercase tracking-wider">Inside the building</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-display font-semibold">Four room packages, one address</h2>
            <p className="mt-3 text-foreground/70">Same wifi, same security, same team — the difference is space and finish.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROOM_TIERS.map((tier, i) => (
              <Reveal key={tier.name} delay={i * 100}>
                <div className="rounded-2xl overflow-hidden bg-card shadow-soft hover-lift h-full">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={tier.img} alt={tier.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <div className="flex gap-0.5 mb-1.5">
                      {Array.from({ length: tier.stars }).map((_, s) => <Star key={s} className="h-3.5 w-3.5 fill-accent text-accent" />)}
                    </div>
                    <h3 className="font-semibold">{tier.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-snug">{tier.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MOMENTS — the variety inside a single building */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-sm font-semibold text-secondary uppercase tracking-wider">No two rooms alike</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-display font-semibold">Every unit has its own mood</h2>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {MOMENTS.map((m, i) => (
            <Reveal key={m.alt} delay={i * 100}>
              <img src={m.img} alt={m.alt} className="w-full aspect-[3/4] object-cover rounded-2xl shadow-soft hover-lift" />
            </Reveal>
          ))}
        </div>
      </section>

      {/* WHY IT WORKS */}
      <section className="bg-surface border-y border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold text-secondary uppercase tracking-wider">Why it works</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-display font-semibold">Built around how Douala actually lives</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 100}>
                <div className="rounded-2xl p-6 bg-card shadow-soft hover-lift h-full">
                  <div className="h-12 w-12 rounded-xl gradient-cta grid place-items-center text-secondary-foreground mb-4">
                    <v.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FLYERS */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <Reveal>
          <FlyerGallery fallback={FALLBACK_FLYERS} />
        </Reveal>
      </div>

      {/* FACEBOOK TIMELINE */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <Reveal>
          <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-6 text-center">From our Facebook page</p>
          <FacebookReviews tab="timeline" />
        </Reveal>
      </div>

      {/* FEATURED CLIPS */}
      {(facebookClips.length > 0 || instagramPosts.length > 0 || tiktokPosts.length > 0) && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <Reveal>
            <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-6 text-center">Featured clips</p>
            <div className="flex flex-wrap justify-center gap-6">
              {facebookClips.map((p) => (
                <div key={p.id} className="rounded-2xl overflow-hidden shadow-soft bg-card" style={{ width: TIKTOK_EMBED_WIDTH }}>
                  <FacebookPostEmbed url={p.url} />
                </div>
              ))}
              {instagramPosts.map((p) => (
                <div key={p.id} className="rounded-2xl overflow-hidden shadow-soft bg-card" style={{ width: TIKTOK_EMBED_WIDTH }}>
                  <InstagramEmbed url={p.url} />
                </div>
              ))}
              {tiktokPosts.map((p) => (
                <div key={p.id} className="rounded-2xl overflow-hidden shadow-soft bg-card" style={{ width: TIKTOK_EMBED_WIDTH }}>
                  <TikTokEmbed url={p.url} />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      )}

      {/* FEATURED POSTS */}
      {facebookTextPosts.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <Reveal>
            <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-6 text-center">Featured posts</p>
            <div className="flex flex-wrap justify-center gap-6">
              {facebookTextPosts.map((p) => (
                <div key={p.id} className="rounded-2xl overflow-hidden shadow-soft bg-card">
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
