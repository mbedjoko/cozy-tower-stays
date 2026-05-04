import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, ShieldOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

type Profile = { id: string; display_name: string | null; phone: string | null; created_at: string; isAdmin: boolean };

function AdminUsers() {
  const [items, setItems] = useState<Profile[]>([]);
  const load = async () => {
    const { data: profiles } = await supabase.from("profiles").select("id, display_name, phone, created_at").order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("user_id, role").eq("role", "admin");
    const adminSet = new Set((roles ?? []).map(r => r.user_id));
    setItems((profiles ?? []).map(p => ({ ...p, isAdmin: adminSet.has(p.id) })));
  };
  useEffect(() => { load(); }, []);

  const toggleAdmin = async (uid: string, makeAdmin: boolean) => {
    if (makeAdmin) {
      const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: "admin" });
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "admin");
      if (error) return toast.error(error.message);
    }
    toast.success("Role updated"); load();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Users</h1>
      <p className="text-muted-foreground mt-1">Manage platform members and admin access.</p>

      <div className="mt-6 rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Role</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No users yet.</td></tr>}
            {items.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{p.display_name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.phone ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {p.isAdmin
                    ? <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">Admin</span>
                    : <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold">User</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => toggleAdmin(p.id, !p.isAdmin)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-muted transition-base">
                    {p.isAdmin ? <><ShieldOff className="h-3.5 w-3.5" /> Revoke admin</> : <><Shield className="h-3.5 w-3.5" /> Make admin</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
