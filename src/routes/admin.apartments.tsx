import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatXAF } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/apartments")({
  component: AdminApartments,
});

function AdminApartments() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("apartments")
      .select("id, title, slug, neighborhood, price_per_night, bedrooms, is_available, is_featured, rating, review_count")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const removeApt = async (id: string) => {
    if (!confirm("Delete this apartment?")) return;
    const { error } = await supabase.from("apartments").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Apartments</h1>
          <p className="text-muted-foreground mt-1">Manage your listings.</p>
        </div>
        <Button onClick={() => setEditing({})} className="gradient-cta text-secondary-foreground"><Plus className="h-4 w-4 mr-1" /> New</Button>
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {items.map((a) => (
              <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{a.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.neighborhood}</td>
                <td className="px-4 py-3">{formatXAF(a.price_per_night)}</td>
                <td className="px-4 py-3">{a.rating} ({a.review_count})</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${a.is_available ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"}`}>
                    {a.is_available ? "Live" : "Hidden"}
                  </span>
                  {a.is_featured && <span className="ml-2 px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground text-xs">Featured</span>}
                </td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button onClick={() => setEditing(a)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => removeApt(a.id)} className="p-2 rounded-lg hover:bg-muted text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <ApartmentEditor apt={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function ApartmentEditor({ apt, onClose, onSaved }: { apt: any; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    title: apt.title ?? "",
    slug: apt.slug ?? "",
    description: apt.description ?? "",
    neighborhood: apt.neighborhood ?? "",
    price_per_night: apt.price_per_night ?? 30000,
    bedrooms: apt.bedrooms ?? 1,
    bathrooms: apt.bathrooms ?? 1,
    max_guests: apt.max_guests ?? 2,
    is_available: apt.is_available ?? true,
    is_featured: apt.is_featured ?? false,
    amenities: (apt.amenities ?? ["Wifi", "Air conditioning"]).join(", "),
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const payload: any = { ...f, amenities: f.amenities.split(",").map((s: string) => s.trim()).filter(Boolean) };
    const res = apt.id
      ? await supabase.from("apartments").update(payload).eq("id", apt.id)
      : await supabase.from("apartments").insert(payload);
    setSaving(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Saved");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-elegant max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{apt.id ? "Edit apartment" : "New apartment"}</h2>
        <div className="space-y-3">
          <Field label="Title"><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className="input" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Slug"><input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} className="input" /></Field>
            <Field label="Neighborhood"><input value={f.neighborhood} onChange={(e) => setF({ ...f, neighborhood: e.target.value })} className="input" /></Field>
          </div>
          <Field label="Description"><textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="input" /></Field>
          <div className="grid grid-cols-4 gap-3">
            <Field label="Price/night"><input type="number" value={f.price_per_night} onChange={(e) => setF({ ...f, price_per_night: +e.target.value })} className="input" /></Field>
            <Field label="Beds"><input type="number" value={f.bedrooms} onChange={(e) => setF({ ...f, bedrooms: +e.target.value })} className="input" /></Field>
            <Field label="Baths"><input type="number" value={f.bathrooms} onChange={(e) => setF({ ...f, bathrooms: +e.target.value })} className="input" /></Field>
            <Field label="Max guests"><input type="number" value={f.max_guests} onChange={(e) => setF({ ...f, max_guests: +e.target.value })} className="input" /></Field>
          </div>
          <Field label="Amenities (comma-separated)"><input value={f.amenities} onChange={(e) => setF({ ...f, amenities: e.target.value })} className="input" /></Field>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.is_available} onChange={(e) => setF({ ...f, is_available: e.target.checked })} /> Available</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.is_featured} onChange={(e) => setF({ ...f, is_featured: e.target.checked })} /> Featured</label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="gradient-cta text-secondary-foreground">{saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>
      <style>{`.input{width:100%;border:1px solid var(--color-input);background:var(--color-background);border-radius:10px;padding:0.6rem 0.75rem;font-size:0.875rem}.input:focus{outline:none;box-shadow:0 0 0 3px var(--ring)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</span>{children}</label>;
}
