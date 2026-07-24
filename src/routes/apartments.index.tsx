import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ApartmentCard, type ApartmentCardData } from "@/components/ApartmentCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/apartments/")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: (s.q as string) || "",
    checkIn: (s.checkIn as string) || "",
    checkOut: (s.checkOut as string) || "",
    guests: Number(s.guests) || 0,
  }),
  head: () => ({
    meta: [
      { title: "Room packages — Cozy Tower" },
      { name: "description", content: "Browse every room package at our single premium property in Deido, Bonatéki, Douala — from studios to 3-bedroom family suites." },
      { property: "og:title", content: "Room packages — Cozy Tower" },
      { property: "og:description", content: "All room packages at Cozy Tower, Deido — Bonatéki, Douala." },
    ],
  }),
  component: ListingPage,
});

const ALL_AMENITIES = ["Wifi", "Air conditioning", "Kitchen", "Workspace", "Pool", "Parking", "Washer", "TV", "Gym", "Garden"];

function ListingPage() {
  const search = Route.useSearch();
  const [items, setItems] = useState<ApartmentCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const [maxPrice, setMaxPrice] = useState(150000);
  const [minRooms, setMinRooms] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [roomType, setRoomType] = useState(search.q || "");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("apartments")
        .select("id, slug, title, neighborhood, price_per_night, rating, review_count, is_available, bedrooms, amenities, apartment_images(url, is_cover, sort_order)")
        .order("price_per_night", { ascending: true });
      if (data) {
        setItems(
          data.map((a) => {
            const imgs = (a.apartment_images ?? []).slice().sort((x, y) => Number(y.is_cover) - Number(x.is_cover) || x.sort_order - y.sort_order);
            return {
              id: a.id, slug: a.slug, title: a.title, neighborhood: a.neighborhood,
              price_per_night: a.price_per_night, rating: Number(a.rating), review_count: a.review_count,
              is_available: a.is_available, bedrooms: a.bedrooms,
              cover_url: imgs[0]?.url ?? "",
              amenities: a.amenities,
            } as ApartmentCardData & { amenities: string[] };
          })
        );
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return (items as (ApartmentCardData & { amenities: string[] })[]).filter((a) => {
      if (a.price_per_night > maxPrice) return false;
      if (a.bedrooms < minRooms) return false;
      if (roomType && !a.title.toLowerCase().includes(roomType.toLowerCase())) return false;
      if (picked.length && !picked.every((p) => a.amenities.includes(p))) return false;
      return true;
    });
  }, [items, maxPrice, minRooms, picked, roomType]);

  const togglePick = (a: string) => setPicked((p) => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">{filtered.length} stays in Douala</p>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold">Browse apartments</h1>
          </div>
          <Button variant="outline" size="sm" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4 mr-1" /> Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Filters sidebar */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="sticky top-20 rounded-2xl bg-card p-5 shadow-soft border border-border space-y-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Filter className="h-4 w-4 text-secondary" /> Filters
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Neighborhood</label>
                <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Akwa, Bonapriso…"
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Max price: <span className="text-foreground">{maxPrice.toLocaleString()} XAF</span>
                </label>
                <input type="range" min={10000} max={150000} step={5000}
                  value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)}
                  className="w-full mt-2 accent-secondary" />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bedrooms</label>
                <div className="mt-2 flex gap-1.5">
                  {[0, 1, 2, 3].map((n) => (
                    <button key={n} onClick={() => setMinRooms(n)}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-base ${
                        minRooms === n ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/70"
                      }`}>
                      {n === 0 ? "Any" : `${n}+`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amenities</label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ALL_AMENITIES.map((a) => (
                    <button key={a} onClick={() => togglePick(a)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-base ${
                        picked.includes(a) ? "bg-secondary text-secondary-foreground shadow-soft" : "bg-muted text-foreground hover:bg-muted/70"
                      }`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setMaxPrice(100000); setMinRooms(0); setPicked([]); setNeighborhood(""); }}
                className="w-full text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Clear all filters
              </button>
            </div>
          </aside>

          <div>
            {loading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                No apartments match your filters.
                <div className="mt-4">
                  <Link to="/apartments" className="text-secondary font-medium">Reset and try again →</Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((a) => <ApartmentCard key={a.id} apt={a} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
