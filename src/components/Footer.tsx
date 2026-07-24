import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { Logo } from "./Logo";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 5.82c-.9-.83-1.47-1.99-1.47-3.32H12.7v13.44a2.6 2.6 0 1 1-1.84-2.49v-2.62a5.22 5.22 0 1 0 4.34 5.15V9.4a6.62 6.62 0 0 0 3.84 1.23V8.14a3.94 3.94 0 0 1-2.44-2.32Z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { name: "Facebook", href: "https://www.facebook.com/people/The-Cozy-Tower/61577243422593/", Icon: Facebook },
  { name: "Instagram", href: "https://www.instagram.com/the_cozy_tower", Icon: Instagram },
  { name: "TikTok", href: "https://www.tiktok.com/@the.cozy.tower", Icon: TikTokIcon },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/cozy-tower-ba399b369/", Icon: Linkedin },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-3 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            One boutique residence in Deido, Bonatéki. Not a marketplace — booked, furnished and run directly by us.
          </p>
          <div className="mt-4 flex items-center gap-3">
            {SOCIAL_LINKS.map(({ name, href, Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="grid h-9 w-9 place-items-center rounded-full bg-muted text-foreground hover:bg-secondary hover:text-secondary-foreground transition-base"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/apartments" className="hover:text-foreground transition-base">Room packages</Link></li>
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
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Cozy Tower · Deido, Bonatéki, Douala.
      </div>
    </footer>
  );
}
