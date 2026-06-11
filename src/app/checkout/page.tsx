"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";

type CheckoutResp = {
  payment_id: string;
  user_id: string;
  amount: number;
  qr_code: string | null;
  qr_code_base64: string | null;
  ticket_url: string | null;
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const resumoItens = [
  "Acesso vitalício ao gerador",
  "Templates premium em breve",
  "Atualizações gratuitas pra sempre",
  "Sem limite de impressões",
];

export default function CheckoutPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirma, setEmailConfirma] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pix, setPix] = useState<CheckoutResp | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [statusPagamento, setStatusPagamento] = useState<string>("pending");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const price = Number(process.env.NEXT_PUBLIC_LIFETIME_PRICE_BRL || "19.9");

  const pararPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const iniciarPolling = useCallback(
    (paymentId: string, emailCliente: string) => {
      pararPolling();
      pollingRef.current = setInterval(async () => {
        try {
          const response = await fetch(
            `/api/checkout/status?id=${encodeURIComponent(paymentId)}`,
          );
          const data = await response.json();
          setStatusPagamento(data.status ?? "pending");
          if (data.approved) {
            pararPolling();
            setTimeout(() => {
              router.push(
                `/login?cadastrado=1&email=${encodeURIComponent(emailCliente)}`,
              );
            }, 1500);
          }
        } catch {
          // Proximo tick tenta de novo.
        }
      }, 5000);
    },
    [router, pararPolling],
  );

  useEffect(() => () => pararPolling(), [pararPolling]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);

    if (!nome.trim() || !email.trim() || !senha) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (email !== emailConfirma) {
      setErro("Os emails nao conferem.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao criar pagamento.");
      }
      setPix(data);
      setStatusPagamento("pending");
      iniciarPolling(data.payment_id, email);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function copiarCodigo() {
    if (!pix?.qr_code) return;
    try {
      await navigator.clipboard.writeText(pix.qr_code);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Ignora falhas de clipboard.
    }
  }

  const aprovado = statusPagamento === "approved";

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[#FF5028]/10 bg-white">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-[#16120E]">
            <Icon name="printer" className="size-6 text-[#FF5028]" />
            <span className="text-xl tracking-tight">Imprimax</span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-[#16120E]/70 hover:text-[#FF5028]"
          >
            Ja tenho conta
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            {!pix ? (
              <Card className="p-6">
                <h1 className="text-2xl font-extrabold text-[#16120E] md:text-3xl">
                  Garantir meu acesso vitalício
                </h1>
                <p className="mt-1 text-sm text-[#16120E]/70">
                  Preencha seus dados pra liberar o Imprimax assim que o PIX cair.
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#16120E]/75">
                      Nome completo
                    </label>
                    <Input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#16120E]/75">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="voce@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#16120E]/75">
                      Confirmar email
                    </label>
                    <Input
                      type="email"
                      value={emailConfirma}
                      onChange={(e) => setEmailConfirma(e.target.value)}
                      placeholder="voce@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#16120E]/75">
                      Senha (mínimo 6 caracteres)
                    </label>
                    <Input
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Crie sua senha"
                      required
                      minLength={6}
                    />
                  </div>

                  {erro && (
                    <p className="text-xs font-medium text-red-600">{erro}</p>
                  )}

                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? (
                      "Gerando PIX..."
                    ) : (
                      <>
                        {`Pagar ${formatBRL(price)} via PIX`}
                        <Icon name="arrow-right" className="size-4" />
                      </>
                    )}
                  </Button>

                  <p className="flex items-center justify-center gap-1.5 text-center text-xs text-[#16120E]/60">
                    <Icon name="lock" className="size-3.5" />
                    Pagamento seguro processado pelo Mercado Pago
                  </p>
                </form>
              </Card>
            ) : (
              <Card className="p-6">
                {aprovado ? (
                  <div className="space-y-3 text-center">
                    <Icon name="success" className="mx-auto size-12 text-emerald-700" />
                    <h2 className="text-2xl font-extrabold text-emerald-700">
                      Pagamento confirmado!
                    </h2>
                    <p className="text-sm text-[#16120E]/70">
                      Redirecionando pro login... Use o email e a senha que voce cadastrou.
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-extrabold text-[#16120E]">
                      Pague com PIX pra liberar
                    </h2>
                    <p className="mt-1 text-sm text-[#16120E]/70">
                      Aponte a câmera do seu app do banco pro QR code ou copie o código abaixo.
                    </p>

                    {pix.qr_code_base64 ? (
                      <div className="mt-4 flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`data:image/png;base64,${pix.qr_code_base64}`}
                          alt="QR Code PIX"
                          className="h-56 w-56 rounded-xl border border-[#FF5028]/10 bg-white p-2"
                        />
                      </div>
                    ) : null}

                    {pix.qr_code ? (
                      <div className="mt-4 space-y-2">
                        <label className="text-xs font-semibold uppercase text-[#16120E]/70">
                          PIX copia e cola
                        </label>
                        <textarea
                          readOnly
                          value={pix.qr_code}
                          rows={3}
                          className="w-full rounded-xl border border-[#FF5028]/20 bg-white p-3 text-xs"
                          onClick={(e) =>
                            (e.target as HTMLTextAreaElement).select()
                          }
                        />
                        <button
                          type="button"
                          onClick={copiarCodigo}
                          className="imprimax-btn w-full justify-center gap-2"
                        >
                          {copiado ? (
                            <>
                              <Icon name="copy-check" className="size-4" />
                              Copiado!
                            </>
                          ) : (
                            "Copiar codigo PIX"
                          )}
                        </button>
                      </div>
                    ) : null}

                    <div className="mt-4 rounded-xl bg-[#F7F7F7] p-3 text-center text-sm">
                      <p className="flex items-center justify-center gap-1.5 font-semibold text-[#FF5028]">
                        <Icon name="clock" className="size-4" />
                        Aguardando pagamento...
                      </p>
                      <p className="mt-1 text-xs text-[#16120E]/60">
                        Esta tela atualiza sozinha quando o PIX cair (uns 30s).
                      </p>
                    </div>

                    {pix.ticket_url ? (
                      <a
                        href={pix.ticket_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 block text-center text-xs text-[#FF5028] underline-offset-2 hover:underline"
                      >
                        Ver detalhes no Mercado Pago
                      </a>
                    ) : null}
                  </>
                )}
              </Card>
            )}
          </div>

          <Card className="h-fit p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FF5028]">
              Resumo do pedido
            </h3>
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-gradient-to-br from-[#FF5028]/10 to-[#C83A18]/10 p-4">
              <Icon name="printer" className="size-8 shrink-0 text-[#FF5028]" />
              <div className="flex-1">
                <p className="text-sm font-bold text-[#16120E]">
                  Imprimax — Acesso Vitalício
                </p>
                <p className="text-xs text-[#16120E]/70">
                  Pagamento único. Sem mensalidade.
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-[#16120E]/80">
              {resumoItens.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Icon name="check" className="size-4 text-[#FF5028]" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-[#FF5028]/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#16120E]/70">Total</span>
                <span className="text-2xl font-extrabold text-[#FF5028]">
                  {formatBRL(price)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
