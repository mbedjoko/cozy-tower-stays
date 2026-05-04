import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Premium short-stay apartments in Douala. Curated, secure, and effortless.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/apartments" className="hover:text-foreground transition-base">Apartments</Link></li>
            <li><Link to="/about" className="hover:text-foreground transition-base">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground transition-base">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Account</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/login" className="hover:text-foreground transition-base">Sign in</Link></li>
            <li><Link to="/signup" className="hover:text-foreground transition-base">Create account</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground transition-base">My bookings</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Terms</li>
            <li>Privacy</li>
            <li>Cookies</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Cozy Tower · Made with care in Douala.
      </div>
    </footer>
  );
}
