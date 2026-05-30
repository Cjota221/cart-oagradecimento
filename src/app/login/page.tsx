"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          await supabase.from("imprimax_profiles").upsert({
            id: data.user.id,
            email,
            name,
            has_access: false,
          });
        }

        setMessage("Cadastro criado. Verifique seu e-mail para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Falha na autenticação.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-10">
      <Card className="w-full p-6">
        <h1 className="text-2xl font-extrabold text-[#1a0533]">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
        <p className="mt-1 text-sm text-[#1a0533]/70">Acesse seu painel Imprimax e desbloqueie templates premium.</p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#1a0533]/75">Nome</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required={mode === "signup"} />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1a0533]/75">E-mail</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1a0533]/75">Senha</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {message && <p className="text-xs font-medium text-[#e91e8c]">{message}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Aguarde..." : mode === "login" ? "Entrar no painel" : "Cadastrar"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-3 text-xs font-semibold text-[#6c2eb9] underline-offset-2 hover:underline"
        >
          {mode === "login" ? "Ainda não tenho conta" : "Já tenho conta"}
        </button>
      </Card>
    </main>
  );
}
