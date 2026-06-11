"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import { getSupabaseBrowserClient } from "@/lib/supabase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justSignedUp = searchParams.get("cadastrado") === "1";
  const emailParam = searchParams.get("email") ?? "";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    justSignedUp
      ? "Pagamento confirmado! Faça login com o email e senha que cadastrou."
      : null,
  );
  const [messageType, setMessageType] = useState<"success" | "error">(
    justSignedUp ? "success" : "error",
  );

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

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

        setMessageType("success");
        setMessage("Cadastro criado. Verifique seu e-mail para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Falha na autenticação.";
      setMessageType("error");
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-10">
      <Card className="w-full p-6">
        <Link
          href="/"
          className="mb-4 inline-flex"
        >
          <img
            src="/brand/logo/logo%20principal.png"
            alt="Imprimax"
            className="h-[58px] w-auto"
          />
        </Link>
        <h1 className="text-2xl font-extrabold text-[#16120E]">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="mt-1 text-sm text-[#16120E]/70">
          {mode === "login"
            ? "Acesse seu painel Imprimax."
            : "Crie sua conta gratuita. Pra desbloquear templates premium, compre seu acesso."}
        </p>

        {message && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
              messageType === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            <Icon name={messageType === "success" ? "success" : "x"} className="size-4 shrink-0" />
            {message}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#16120E]/75">
                Nome
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={mode === "signup"}
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#16120E]/75">
              E-mail
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Aguarde..."
              : mode === "login"
                ? "Entrar no painel"
                : "Cadastrar"}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-semibold text-[#FF5028] underline-offset-2 hover:underline"
          >
            {mode === "login" ? "Ainda não tenho conta" : "Já tenho conta"}
          </button>
          {mode === "login" && (
            <Link
              href="/checkout"
              className="inline-flex items-center gap-1 font-semibold text-[#FF5028] underline-offset-2 hover:underline"
            >
              Comprar acesso
              <Icon name="arrow-right" className="size-3.5" />
            </Link>
          )}
        </div>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
