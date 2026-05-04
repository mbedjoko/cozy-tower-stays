import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Cozy Tower" },
      { name: "description", content: "Cozy Tower is a curated platform for premium short-stay apartments in Douala, Cameroon." },
      { property: "og:title", content: "About Cozy Tower" },
      { property: "og:description", content: "Curated, premium short-stay apartments in Douala." },
    ],
  }),
  component: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <p className="text-sm font-semibold text-secondary uppercase tracking-wider">Our story</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">A new standard for stays in Douala.</h1>
        <p className="mt-6 text-lg text-foreground/80 leading-relaxed">
          Cozy Tower curates the very best short-stay apartments across Douala — from minimalist Akwa lofts to family-sized Bonamoussadi homes. Every space is hand-inspected, every host is vetted.
        </p>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          We built Cozy Tower because the city deserved a booking experience as polished as its apartments. Premium, local, effortless.
        </p>
      </div>
    </PageShell>
  ),
});
