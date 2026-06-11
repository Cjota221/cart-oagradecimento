"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from("imprimax_profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile?.is_admin !== true) {
        await supabase.auth.signOut();
        setMessage("Este login nao tem permissao de administrador.");
        return;
      }

      router.push("/admin/templates");
      router.refresh();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Falha ao entrar no admin.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <Card className="w-full p-6">
        <Link href="/" className="mb-4 inline-flex">
          <img
            src="/brand/logo/logo%20principal.png"
            alt="Imprimax"
            className="h-[58px] w-auto"
          />
        </Link>

        <div className="mb-5">
          <p className="font-mono-ix text-xs font-medium uppercase text-[#9A948D]">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-[#16120E]">
            Entrar no painel
          </h1>
          <p className="mt-1 text-sm text-[#16120E]/70">
            Area reservada para gerenciar templates e usuarios.
          </p>
        </div>

        {message && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            <Icon name="x" className="size-4 shrink-0" />
            {message}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#16120E]/75">
              E-mail admin
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#16120E]/75">
              Senha
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar como admin"}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs">
          <Link
            href="/login"
            className="font-semibold text-[#FF5028] underline-offset-2 hover:underline"
          >
            Login de cliente
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-semibold text-[#FF5028] underline-offset-2 hover:underline"
          >
            Voltar ao site
            <Icon name="arrow-right" className="size-3.5" />
          </Link>
        </div>
      </Card>
    </main>
  );
}
