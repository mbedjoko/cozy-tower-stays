import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { Chatbot } from "./Chatbot";

export function PageShell({
  children,
  transparentNav = false,
  hideFooter = false,
}: {
  children: ReactNode;
  transparentNav?: boolean;
  hideFooter?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar transparent={transparentNav} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      {!hideFooter && <Footer />}
      <MobileNav />
      <Chatbot />
    </div>
  );
}
