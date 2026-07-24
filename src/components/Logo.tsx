import { Link } from "@tanstack/react-router";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span
        className={`font-display text-xl leading-none tracking-tight ${light ? "text-white" : "text-foreground"}`}
      >
        Cozy Tower
      </span>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent translate-y-px" />
      <span className={`text-[11px] font-medium uppercase tracking-[0.18em] ${light ? "text-white/70" : "text-muted-foreground"}`}>
        Deido
      </span>
    </Link>
  );
}
