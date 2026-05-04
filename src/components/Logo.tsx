import { Link } from "@tanstack/react-router";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <span
        className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-white font-bold shadow-soft group-hover:scale-105 transition-base"
        aria-hidden
      >
        CT
      </span>
      <span className={`font-bold text-lg tracking-tight ${light ? "text-white" : "text-foreground"}`}>
        Cozy<span className="text-secondary">Tower</span>
      </span>
    </Link>
  );
}
