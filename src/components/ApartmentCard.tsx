import { Link } from "@tanstack/react-router";
import { Star, BedDouble, Bath } from "lucide-react";
import { formatXAF } from "@/lib/format";

export type ApartmentCardData = {
  id: string;
  slug: string;
  title: string;
  neighborhood: string;
  price_per_night: number;
  rating: number;
  review_count: number;
  is_available: boolean;
  cover_url: string;
  bedrooms: number;
  bathrooms: number;
};

export function ApartmentCard({ apt }: { apt: ApartmentCardData }) {
  return (
    <Link
      to="/apartments/$slug"
      params={{ slug: apt.slug }}
      className="group block hover-lift rounded-2xl overflow-hidden bg-card shadow-soft"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={apt.cover_url}
          alt={apt.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
              apt.is_available
                ? "bg-secondary/90 text-secondary-foreground"
                : "bg-muted/90 text-muted-foreground"
            }`}
          >
            {apt.is_available ? "Available" : "Booked"}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 glass-strong text-foreground rounded-full px-3 py-1.5 text-sm font-bold">
          {formatXAF(apt.price_per_night)}<span className="text-xs font-normal text-muted-foreground"> / night</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base leading-tight">{apt.title}</h3>
          <div className="flex items-center gap-1 text-sm shrink-0">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-semibold">{apt.rating}</span>
            <span className="text-muted-foreground">({apt.review_count})</span>
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {apt.bedrooms} bed{apt.bedrooms > 1 ? "s" : ""}</span>
          <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {apt.bathrooms} bath{apt.bathrooms > 1 ? "s" : ""}</span>
        </div>
      </div>
    </Link>
  );
}
