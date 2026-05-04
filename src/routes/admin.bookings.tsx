import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatXAF } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookings,
});

function AdminBookings() {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("id, check_in, check_out, nights, total_price, status, guest_name, guest_email, payment_method, apartments(title, neighborhood)")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); load(); }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Bookings</h1>
      <p className="text-muted-foreground mt-1">All reservations across the platform.</p>

      <div className="mt-6 rounded-2xl bg-card border border-border shadow-soft overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Apartment</th>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No bookings yet.</td></tr>}
            {items.map((b) => (
              <tr key={b.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{b.apartments?.title}</div>
                  <div className="text-xs text-muted-foreground">{b.apartments?.neighborhood}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{b.guest_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{b.guest_email}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{b.check_in} → {b.check_out}<br /><span className="text-xs">{b.nights} nights</span></td>
                <td className="px-4 py-3 font-semibold">{formatXAF(b.total_price)}</td>
                <td className="px-4 py-3 text-muted-foreground capitalize">{b.payment_method ?? "—"}</td>
                <td className="px-4 py-3">
                  <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)}
                    className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
