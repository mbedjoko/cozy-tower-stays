import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Cozy Tower" },
      { name: "description", content: "Get in touch with the Cozy Tower concierge team in Douala." },
      { property: "og:title", content: "Contact Cozy Tower" },
      { property: "og:description", content: "Reach out to our local Douala concierge team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-10">
        <div>
          <p className="text-sm font-semibold text-secondary uppercase tracking-wider">Contact</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold">We're here, in Douala.</h1>
          <p className="mt-4 text-foreground/80">Reach out — we usually reply within an hour.</p>
          <div className="mt-8 space-y-4 text-sm">
            <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-secondary" /> hello@cozytower.cm</div>
            <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-secondary" /> +237 6 99 00 00 00</div>
            <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-secondary" /> Akwa, Douala, Cameroon</div>
          </div>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); toast.success("Thanks! We'll be in touch shortly."); setForm({ name: "", email: "", message: "" }); }}
          className="rounded-2xl bg-card border border-border shadow-soft p-6 space-y-4"
        >
          <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></Field>
          <Field label="Email"><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></Field>
          <Field label="Message"><textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input" /></Field>
          <Button type="submit" size="lg" className="w-full gradient-cta text-secondary-foreground shadow-glow-green">Send message</Button>
        </form>
      </div>
      <style>{`.input{width:100%;border:1px solid var(--color-input);background:var(--color-background);border-radius:10px;padding:0.6rem 0.75rem;font-size:0.875rem}.input:focus{outline:none;box-shadow:0 0 0 3px var(--ring)}`}</style>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</span>{children}</label>;
}
