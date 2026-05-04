import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: (s.redirect as string) || "/dashboard" }),
  head: () => ({ meta: [{ title: "Sign in — Cozy Tower" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useAuth();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success("Welcome back!");
    navigate({ to: search.redirect });
  };

  return (
    <PageShell hideFooter>
      <div className="min-h-[80vh] grid place-items-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6"><Logo /></div>
          <div className="rounded-2xl bg-card border border-border shadow-elegant p-8">
            <h1 className="text-2xl font-bold text-center">Welcome back</h1>
            <p className="text-center text-sm text-muted-foreground mt-1">Sign in to continue your stay</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <Field label="Email"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@email.com" /></Field>
              <Field label="Password"><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" /></Field>
              <Button type="submit" disabled={loading} size="lg" className="w-full gradient-cta text-secondary-foreground shadow-glow-green">
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account? <Link to="/signup" className="text-secondary font-semibold">Create one</Link>
            </p>
          </div>
        </div>
      </div>
      <style>{`.input{width:100%;border:1px solid var(--color-input);background:var(--color-background);border-radius:10px;padding:0.6rem 0.75rem;font-size:0.875rem}.input:focus{outline:none;box-shadow:0 0 0 3px var(--ring)}`}</style>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</span>{children}</label>;
}
