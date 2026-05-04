import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, MapPin, Users, BedDouble, Bath, Maximize, Wifi, Snowflake, Car, Tv, ChefHat, Briefcase, Waves, Heart } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatXAF, nightsBetween, todayISO } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/apartments/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${decodeURIComponent(params.slug).replace(/-/g, " ")} — Cozy Tower` },
      { name: "description", content: "Premium apartment stay in Douala. Book instantly on Cozy Tower." },
      { property: "og:title", content: `${decodeURIComponent(params.slug).replace(/-/g, " ")} — Cozy Tower` },
      { property: "og:description", content: "Premium apartment stay in Douala." },
    ],
  }),
  component: DetailPage,
});

const AMENITY_ICONS: Record<string, any> = {
  "Wifi": Wifi, "Air conditioning": Snowflake, "Parking": Car, "TV": Tv,
  "Kitchen": ChefHat, "Workspace": Briefcase, "Pool": Waves,
};

type Apt = {
  id: string; slug: string; title: string; description: string; neighborhood: string; address: string | null;
  price_per_night: number; bedrooms: number; bathrooms: number; max_guests: number; area_sqm: number | null;
  amenities: string[]; rating: number; review_count: number; latitude: number | null; longitude: number | null;
  apartment_images: { url: string; is_cover: boolean; sort_order: number }[];
};

function DetailPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apt, setApt] = useState<Apt | null>(null);
  const [active, setActive] = useState(0);
  const [checkIn, setCheckIn] = useState(todayISO(2));
  const [checkOut, setCheckOut] = useState(todayISO(5));
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("apartments")
        .select("*, apartment_images(url, is_cover, sort_order)")
        .eq("slug", slug).maybeSingle();
      if (data) {
        const sorted = [...data.apartment_images].sort((x, y) => Number(y.is_cover) - Number(x.is_cover) || x.sort_order - y.sort_order);
        setApt({ ...(data as any), apartment_images: sorted });
      }
    })();
  }, [slug]);

  if (!apt) {
    return (
      <PageShell>
        <div className="mx-auto max-w-7xl px-4 py-20"><div className="h-96 rounded-2xl bg-muted animate-pulse" /></div>
      </PageShell>
    );
  }

  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = apt.price_per_night * nights;
  const serviceFee = Math.round(subtotal * 0.07);
  const total = subtotal + serviceFee;

  const reserve = () => {
    if (!user) {
      toast.info("Please sign in to continue your booking");
      navigate({ to: "/login", search: { redirect: `/apartments/${slug}` } as any });
      return;
    }
    navigate({
      to: "/booking",
      search: { apt: apt.id, checkIn, checkOut, guests } as any,
    });
  };

  const mapEmbed = apt.latitude && apt.longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${apt.longitude - 0.01}%2C${apt.latitude - 0.008}%2C${apt.longitude + 0.01}%2C${apt.latitude + 0.008}&layer=mapnik&marker=${apt.latitude}%2C${apt.longitude}`
    : null;

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">{apt.title}</h1>
            <div className="mt-1.5 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" /><span className="text-foreground font-semibold">{apt.rating}</span> ({apt.review_count} reviews)</span>
              <span>·</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {apt.neighborhood}, Douala</span>
            </div>
          </div>
          <Button variant="outline" size="sm"><Heart className="h-4 w-4 mr-1.5" /> Save</Button>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[280px] md:h-[480px]">
          <img src={apt.apartment_images[active]?.url} alt={apt.title}
            className="col-span-4 md:col-span-2 row-span-2 h-full w-full object-cover" />
          {apt.apartment_images.slice(0, 4).map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`hidden md:block overflow-hidden ${i === active ? "ring-4 ring-secondary" : ""}`}>
              <img src={img.url} alt="" className="h-full w-full object-cover hover:scale-105 transition-base" />
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="mt-10 grid lg:grid-cols-[1fr_380px] gap-10">
          <div>
            <div className="flex flex-wrap gap-6 pb-6 border-b border-border">
              <Spec icon={Users} label={`Up to ${apt.max_guests} guests`} />
              <Spec icon={BedDouble} label={`${apt.bedrooms} bedroom${apt.bedrooms > 1 ? "s" : ""}`} />
              <Spec icon={Bath} label={`${apt.bathrooms} bath${apt.bathrooms > 1 ? "s" : ""}`} />
              {apt.area_sqm && <Spec icon={Maximize} label={`${apt.area_sqm} m²`} />}
            </div>

            <section className="py-8 border-b border-border">
              <h2 className="text-xl font-semibold mb-3">About this place</h2>
              <p className="text-foreground/80 leading-relaxed">{apt.description}</p>
            </section>

            <section className="py-8 border-b border-border">
              <h2 className="text-xl font-semibold mb-4">What this place offers</h2>
              <div className="grid grid-cols-2 gap-3">
                {apt.amenities.map((a) => {
                  const Icon = AMENITY_ICONS[a] ?? Wifi;
                  return (
                    <div key={a} className="flex items-center gap-3 py-2">
                      <Icon className="h-5 w-5 text-secondary" />
                      <span className="text-sm">{a}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="py-8">
              <h2 className="text-xl font-semibold mb-4">Where you'll be</h2>
              <div className="rounded-2xl overflow-hidden border border-border h-[320px] bg-muted">
                {mapEmbed ? (
                  <iframe title="map" src={mapEmbed} className="w-full h-full" />
                ) : (
                  <div className="h-full grid place-items-center text-muted-foreground text-sm">{apt.address ?? `${apt.neighborhood}, Douala`}</div>
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{apt.address ?? `${apt.neighborhood}, Douala, Cameroon`}</p>
            </section>
          </div>

          {/* Booking card */}
          <aside>
            <div className="lg:sticky lg:top-24 rounded-2xl bg-card border border-border shadow-elegant p-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-bold">{formatXAF(apt.price_per_night)}</span>
                  <span className="text-muted-foreground"> / night</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-semibold">{apt.rating}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-border overflow-hidden">
                <DateInput label="Check-in" value={checkIn} onChange={setCheckIn} />
                <DateInput label="Check-out" value={checkOut} onChange={setCheckOut} />
                <div className="col-span-2 px-3 py-2 border-t border-border">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Guests</label>
                  <select value={guests} onChange={(e) => setGuests(+e.target.value)}
                    className="w-full bg-transparent text-sm font-medium focus:outline-none mt-0.5">
                    {Array.from({ length: apt.max_guests }).map((_, i) => (
                      <option key={i} value={i + 1}>{i + 1} guest{i > 0 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button onClick={reserve} size="lg" className="w-full mt-4 gradient-cta text-secondary-foreground shadow-glow-green hover:opacity-95">
                Reserve
              </Button>

              <div className="mt-5 space-y-2 text-sm">
                <Row label={`${formatXAF(apt.price_per_night)} × ${nights} nights`} value={formatXAF(subtotal)} />
                <Row label="Service fee" value={formatXAF(serviceFee)} />
                <div className="border-t border-border pt-3 flex justify-between font-bold">
                  <span>Total</span><span>{formatXAF(total)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Sticky mobile booking */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-20 glass-strong border-t border-border px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold">{formatXAF(apt.price_per_night)}<span className="text-xs font-normal text-muted-foreground"> / night</span></div>
          <div className="text-xs text-muted-foreground">{nights} nights · {formatXAF(total)}</div>
        </div>
        <Button onClick={reserve} className="gradient-cta text-secondary-foreground shadow-glow-green">Reserve</Button>
      </div>
    </PageShell>
  );
}

function Spec({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-5 w-5 text-secondary" /> <span className="font-medium">{label}</span>
    </div>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="px-3 py-2 cursor-pointer">
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm font-medium focus:outline-none mt-0.5" />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-foreground/80"><span>{label}</span><span>{value}</span></div>;
}
