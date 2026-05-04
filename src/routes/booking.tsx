import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatXAF, nightsBetween, todayISO } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/booking")({
  validateSearch: (s: Record<string, unknown>) => ({
    apt: (s.apt as string) || "",
    checkIn: (s.checkIn as string) || todayISO(1),
    checkOut: (s.checkOut as string) || todayISO(3),
    guests: Number(s.guests) || 2,
  }),
  head: () => ({ meta: [{ title: "Complete your booking — Cozy Tower" }] }),
  component: BookingPage,
});

function BookingPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [apt, setApt] = useState<{ id: string; title: string; price_per_night: number; cover_url: string; neighborhood: string } | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [checkIn, setCheckIn] = useState(search.checkIn);
  const [checkOut, setCheckOut] = useState(search.checkOut);
  const [guests, setGuests] = useState(search.guests);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => { if (!loading && !user) navigate({ to: "/login", search: { redirect: "/booking" } as any }); }, [loading, user, navigate]);

  useEffect(() => {
    if (!search.apt) return;
    (async () => {
      const { data } = await supabase
        .from("apartments")
        .select("id, title, price_per_night, neighborhood, apartment_images(url, is_cover, sort_order)")
        .eq("id", search.apt).maybeSingle();
      if (data) {
        const imgs = [...data.apartment_images].sort((x, y) => Number(y.is_cover) - Number(x.is_cover) || x.sort_order - y.sort_order);
        setApt({ id: data.id, title: data.title, price_per_night: data.price_per_night, neighborhood: data.neighborhood, cover_url: imgs[0]?.url ?? "" });
      }
    })();
  }, [search.apt]);

  if (!apt) {
    return <PageShell><div className="mx-auto max-w-3xl px-4 py-20"><div className="h-96 rounded-2xl bg-muted animate-pulse" /></div></PageShell>;
  }

  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = apt.price_per_night * nights;
  const fee = Math.round(subtotal * 0.07);
  const total = subtotal + fee;

  const goPay = () => {
    if (!name || !email) { toast.error("Please fill in your name and email"); return; }
    navigate({
      to: "/payment",
      search: { apt: apt.id, checkIn, checkOut, guests, name, email, phone, total } as any,
    });
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Stepper step={step} />

        <div className="mt-8 grid md:grid-cols-[1fr_300px] gap-8">
          <div className="rounded-2xl bg-card border border-border shadow-soft p-6">
            {step === 1 && (
              <>
                <h2 className="text-xl font-bold mb-5">Your trip</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Check-in"><input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="input" /></Field>
                  <Field label="Check-out"><input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="input" /></Field>
                  <Field label="Guests"><input type="number" min={1} max={12} value={guests} onChange={(e) => setGuests(+e.target.value)} className="input" /></Field>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setStep(2)} className="gradient-cta text-secondary-foreground">Next <ArrowRight className="h-4 w-4 ml-1" /></Button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="text-xl font-bold mb-5">Your information</h2>
                <div className="space-y-3">
                  <Field label="Full name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="input" /></Field>
                  <Field label="Email"><input type="email" value={email || user?.email || ""} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="input" /></Field>
                  <Field label="Phone (optional)"><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+237…" className="input" /></Field>
                </div>
                <div className="mt-6 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                  <Button onClick={() => setStep(3)} className="gradient-cta text-secondary-foreground">Review <ArrowRight className="h-4 w-4 ml-1" /></Button>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="text-xl font-bold mb-5">Confirm details</h2>
                <dl className="space-y-2 text-sm">
                  <SumRow k="Guest" v={name || "—"} />
                  <SumRow k="Email" v={email || user?.email || "—"} />
                  <SumRow k="Phone" v={phone || "—"} />
                  <SumRow k="Dates" v={`${checkIn} → ${checkOut}`} />
                  <SumRow k="Guests" v={String(guests)} />
                </dl>
                <div className="mt-6 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                  <Button onClick={goPay} size="lg" className="gradient-cta text-secondary-foreground shadow-glow-green">Continue to payment</Button>
                </div>
              </>
            )}
          </div>

          {/* Summary */}
          <aside>
            <div className="rounded-2xl bg-card border border-border shadow-soft p-5">
              <div className="flex gap-3">
                <img src={apt.cover_url} alt="" className="h-16 w-16 rounded-xl object-cover" />
                <div>
                  <div className="font-semibold leading-tight">{apt.title}</div>
                  <div className="text-xs text-muted-foreground">{apt.neighborhood}, Douala</div>
                </div>
              </div>
              <div className="mt-5 space-y-2 text-sm border-t border-border pt-4">
                <Row k={`${formatXAF(apt.price_per_night)} × ${nights} nights`} v={formatXAF(subtotal)} />
                <Row k="Service fee" v={formatXAF(fee)} />
                <div className="border-t border-border pt-3 flex justify-between font-bold">
                  <span>Total</span><span>{formatXAF(total)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`.input{width:100%;border:1px solid var(--color-input);background:var(--color-background);border-radius:10px;padding:0.6rem 0.75rem;font-size:0.875rem}.input:focus{outline:none;box-shadow:0 0 0 3px var(--ring)}`}</style>
    </PageShell>
  );
}

function Stepper({ step }: { step: number }) {
  const steps = ["Trip", "Info", "Review"];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const n = i + 1; const done = n < step; const active = n === step;
        return (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-bold transition-base ${
              done ? "bg-secondary text-secondary-foreground" : active ? "gradient-primary text-white" : "bg-muted text-muted-foreground"
            }`}>
              {done ? <Check className="h-4 w-4" /> : n}
            </div>
            <span className={`text-sm font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-border mx-1" />}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</span>
      {children}
    </label>
  );
}
function Row({ k, v }: { k: string; v: string }) { return <div className="flex justify-between text-foreground/80"><span>{k}</span><span>{v}</span></div>; }
function SumRow({ k, v }: { k: string; v: string }) { return <div className="flex justify-between border-b border-border pb-2"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>; }
