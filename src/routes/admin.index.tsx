import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, CalendarCheck, DollarSign, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatXAF } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const [stats, setStats] = useState({ apartments: 0, bookings: 0, users: 0, revenue: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [chart, setChart] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    (async () => {
      const [apt, bk, pf] = await Promise.all([
        supabase.from("apartments").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("total_price, created_at, status"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);

      const allBks = bk.data ?? [];
      const revenue = allBks.filter(b => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + (b.total_price ?? 0), 0);
      setStats({
        apartments: apt.count ?? 0,
        bookings: allBks.length,
        users: pf.count ?? 0,
        revenue,
      });

      // last 6 months bucket
      const months = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(); d.setMonth(d.getMonth() - (5 - i)); d.setDate(1);
        return { d, label: d.toLocaleString("en", { month: "short" }), value: 0 };
      });
      allBks.forEach(b => {
        const d = new Date(b.created_at as any);
        const m = months.find(m => m.d.getMonth() === d.getMonth() && m.d.getFullYear() === d.getFullYear());
        if (m) m.value += b.total_price ?? 0;
      });
      setChart(months);

      const { data: rec } = await supabase
        .from("bookings")
        .select("id, total_price, status, check_in, guest_name, apartments(title)")
        .order("created_at", { ascending: false }).limit(5);
      setRecentBookings(rec ?? []);
    })();
  }, []);

  const max = Math.max(1, ...chart.map(c => c.value));

  return (
    <div>
      <h1 className="text-3xl font-bold">Overview</h1>
      <p className="text-muted-foreground mt-1">Welcome back, admin.</p>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Building2} label="Apartments" value={String(stats.apartments)} tone="primary" />
        <Stat icon={CalendarCheck} label="Bookings" value={String(stats.bookings)} tone="green" />
        <Stat icon={Users} label="Users" value={String(stats.users)} tone="orange" />
        <Stat icon={DollarSign} label="Revenue" value={formatXAF(stats.revenue)} tone="primary" />
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-soft p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Revenue (last 6 months)</h2>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </div>
          <div className="flex items-end gap-3 h-48">
            {chart.map((c) => (
              <div key={c.label} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-lg gradient-cta transition-all" style={{ height: `${(c.value / max) * 100}%`, minHeight: 4 }} />
                <span className="text-xs text-muted-foreground">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-soft p-6">
          <h2 className="font-semibold mb-4">Recent bookings</h2>
          <div className="space-y-3 text-sm">
            {recentBookings.length === 0 && <p className="text-muted-foreground">No bookings yet.</p>}
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 pb-3 border-b border-border last:border-0">
                <div>
                  <div className="font-medium">{b.apartments?.title}</div>
                  <div className="text-xs text-muted-foreground">{b.guest_name ?? "—"} · {b.check_in}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatXAF(b.total_price)}</div>
                  <div className="text-xs capitalize text-muted-foreground">{b.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "primary" | "green" | "orange" }) {
  const cls = tone === "green" ? "gradient-cta text-secondary-foreground" : tone === "orange" ? "gradient-warm text-accent-foreground" : "gradient-primary text-white";
  return (
    <div className="rounded-2xl bg-card border border-border shadow-soft p-5">
      <div className={`h-10 w-10 rounded-xl ${cls} grid place-items-center mb-3`}><Icon className="h-5 w-5" /></div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}
