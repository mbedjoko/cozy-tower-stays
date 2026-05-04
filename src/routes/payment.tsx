import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Smartphone, Lock, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatXAF, nightsBetween } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/payment")({
  validateSearch: (s: Record<string, unknown>) => ({
    apt: (s.apt as string) || "",
    checkIn: (s.checkIn as string) || "",
    checkOut: (s.checkOut as string) || "",
    guests: Number(s.guests) || 2,
    name: (s.name as string) || "",
    email: (s.email as string) || "",
    phone: (s.phone as string) || "",
    total: Number(s.total) || 0,
  }),
  head: () => ({ meta: [{ title: "Payment — Cozy Tower" }] }),
  component: PaymentPage,
});

function PaymentPage() {
  const search = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<"card" | "momo">("card");
  const [card, setCard] = useState({ number: "", exp: "", cvc: "" });
  const [momoNumber, setMomoNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pay = async () => {
    if (!user) { navigate({ to: "/login" }); return; }
    setSubmitting(true);
    const nights = nightsBetween(search.checkIn, search.checkOut);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      apartment_id: search.apt,
      check_in: search.checkIn,
      check_out: search.checkOut,
      guests: search.guests,
      nights,
      total_price: search.total,
      status: "confirmed",
      guest_name: search.name,
      guest_email: search.email,
      guest_phone: search.phone || null,
      payment_method: method,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Booking confirmed! Welcome to Cozy Tower.");
    navigate({ to: "/dashboard" });
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary uppercase tracking-wider">
            <Lock className="h-3.5 w-3.5" /> Secure checkout
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold">Complete your payment</h1>
          <p className="mt-2 text-muted-foreground">Total due: <span className="font-bold text-foreground">{formatXAF(search.total)}</span></p>
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-soft p-6 md:p-8">
          {/* Method tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted">
            {[
              { id: "card", label: "Card", Icon: CreditCard },
              { id: "momo", label: "Mobile Money", Icon: Smartphone },
            ].map((m) => (
              <button key={m.id} onClick={() => setMethod(m.id as any)}
                className={`py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-base ${
                  method === m.id ? "bg-card shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                <m.Icon className="h-4 w-4" /> {m.label}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {method === "card" ? (
              <>
                <Input label="Card number" placeholder="1234 5678 9012 3456" value={card.number} onChange={(v) => setCard({ ...card, number: v })} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Expiry" placeholder="MM / YY" value={card.exp} onChange={(v) => setCard({ ...card, exp: v })} />
                  <Input label="CVC" placeholder="123" value={card.cvc} onChange={(v) => setCard({ ...card, cvc: v })} />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {["MTN MoMo", "Orange Money"].map((p) => (
                    <button key={p} className="py-2.5 rounded-lg border border-border text-sm font-medium hover:border-secondary transition-base">{p}</button>
                  ))}
                </div>
                <Input label="Mobile number" placeholder="+237 6XX XXX XXX" value={momoNumber} onChange={setMomoNumber} />
                <p className="text-xs text-muted-foreground">You'll receive a payment prompt on your phone.</p>
              </>
            )}
          </div>

          <Button onClick={pay} disabled={submitting} size="lg" className="w-full mt-7 gradient-cta text-secondary-foreground shadow-glow-green hover:opacity-95">
            {submitting ? "Processing…" : `Pay now ${formatXAF(search.total)}`}
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-secondary" /> 256-bit SSL encryption · You won't be charged until your booking is confirmed.
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Input({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </label>
  );
}
