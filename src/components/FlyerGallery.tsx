import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Flyer = { id: string; url: string; alt: string | null };

export function FlyerGallery({ fallback = [] }: { fallback?: Flyer[] }) {
  const [flyers, setFlyers] = useState<Flyer[]>(fallback);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("flyers").select("id, url, alt").order("sort_order");
      if (data && data.length > 0) setFlyers([...fallback, ...data]);
    })();
  }, []);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") setActive((i) => (i === null ? i : (i + 1) % flyers.length));
      if (e.key === "ArrowLeft") setActive((i) => (i === null ? i : (i - 1 + flyers.length) % flyers.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, flyers.length]);

  if (flyers.length === 0) return null;

  return (
    <>
      <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-6 text-center">Flyers</p>
      <div className="flex flex-wrap justify-center gap-4">
        {flyers.map((f, i) => (
          <button
            key={f.id}
            onClick={() => setActive(i)}
            className="group relative aspect-[4/5] w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] lg:w-[calc(20%-0.9rem)] rounded-2xl overflow-hidden bg-muted shadow-soft hover-lift focus-ring"
          >
            <img src={f.url} alt={f.alt ?? "Flyer"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-base" />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 bg-primary/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActive(null)}
        >
          <button
            onClick={() => setActive(null)}
            aria-label="Close"
            className="absolute top-5 right-5 h-10 w-10 rounded-full glass text-white grid place-items-center hover:bg-white/20 transition-base"
          >
            <X className="h-5 w-5" />
          </button>

          {flyers.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActive((i) => (i === null ? i : (i - 1 + flyers.length) % flyers.length)); }}
                aria-label="Previous"
                className="absolute left-3 md:left-6 h-11 w-11 rounded-full glass text-white grid place-items-center hover:bg-white/20 transition-base"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActive((i) => (i === null ? i : (i + 1) % flyers.length)); }}
                aria-label="Next"
                className="absolute right-3 md:right-6 h-11 w-11 rounded-full glass text-white grid place-items-center hover:bg-white/20 transition-base"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <img
            src={flyers[active].url}
            alt={flyers[active].alt ?? "Flyer"}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-elegant object-contain"
          />
        </div>
      )}
    </>
  );
}
