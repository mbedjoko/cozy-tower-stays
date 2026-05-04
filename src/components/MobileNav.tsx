import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Heart, User } from "lucide-react";

export function MobileNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const items = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/apartments", icon: Search, label: "Search" },
    { to: "/dashboard", icon: Heart, label: "Saved" },
    { to: "/dashboard", icon: User, label: "Me" },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass-strong border-t border-border">
      <div className="grid grid-cols-4">
        {items.map((it) => {
          const active = path === it.to || (it.to !== "/" && path.startsWith(it.to));
          return (
            <Link
              key={it.label}
              to={it.to}
              className={`flex flex-col items-center justify-center py-2.5 text-xs font-medium transition-base ${
                active ? "text-secondary" : "text-muted-foreground"
              }`}
            >
              <it.icon className="h-5 w-5 mb-0.5" />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
