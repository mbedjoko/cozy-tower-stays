import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, User as UserIcon, LogOut, Shield } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function Navbar({ transparent = false }: { transparent?: boolean }) {
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const linkCls = transparent
    ? "text-white/90 hover:text-white"
    : "text-foreground/80 hover:text-foreground";

  return (
    <header
      className={`${
        transparent
          ? "absolute top-0 left-0 right-0 z-30 bg-transparent"
          : "sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo light={transparent} />

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/apartments" className={`${linkCls} transition-base`}>Apartments</Link>
          <Link to="/about" className={`${linkCls} transition-base`}>About</Link>
          <Link to="/contact" className={`${linkCls} transition-base`}>Contact</Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className={transparent ? "text-white hover:bg-white/10" : ""}>
                    <Shield className="h-4 w-4 mr-1" /> Admin
                  </Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className={transparent ? "text-white hover:bg-white/10" : ""}>
                  <UserIcon className="h-4 w-4 mr-1" /> Account
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut} className={transparent ? "text-white hover:bg-white/10" : ""}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className={transparent ? "text-white hover:bg-white/10" : ""}>Sign in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="gradient-cta text-secondary-foreground shadow-glow-green hover:opacity-95">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className={`md:hidden p-2 rounded-lg ${transparent ? "text-white" : "text-foreground"}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-surface border-t border-border shadow-soft">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link to="/apartments" onClick={() => setOpen(false)} className="text-foreground py-2">Apartments</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="text-foreground py-2">About</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="text-foreground py-2">Contact</Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="text-foreground py-2">My account</Link>
                {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="text-foreground py-2">Admin</Link>}
                <Button variant="outline" onClick={() => { signOut(); setOpen(false); }}>Sign out</Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="flex-1"><Button variant="outline" className="w-full">Sign in</Button></Link>
                <Link to="/signup" className="flex-1"><Button className="w-full gradient-cta text-secondary-foreground">Get started</Button></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
