import Link from "next/link";

const beneficios = [
  "Grade automática por cm",
  "Impressão frente e verso alinhada",
  "Funciona sem internet (após carregar)",
  "Artes prontas incluídas (em breve)",
  "Atualização gratuita para sempre",
  "Sem limite de impressões",
];

const publicos = [
  { emoji: "💼", titulo: "Revendedoras", frase: "Cartões de agradecimento que vendem o próximo pedido." },
  { emoji: "🧵", titulo: "Artesãs", frase: "Tags personalizadas pros seus produtos com identidade própria." },
  { emoji: "🛍️", titulo: "Lojistas", frase: "Etiquetas, cartões e materiais sem pagar designer todo mês." },
  { emoji: "📚", titulo: "Papelarias", frase: "Imprima sob demanda para os seus clientes finais." },
];

const passos = [
  { emoji: "📤", titulo: "Suba sua arte", desc: "Faça upload do JPG ou PNG da sua arte de frente e verso." },
  { emoji: "⚙️", titulo: "Configure o tamanho", desc: "Informe as dimensões em cm e o sistema monta o grid automaticamente." },
  { emoji: "🖨️", titulo: "Mande imprimir", desc: "Clique em imprimir e saia direto na sua impressora caseira." },
];

const provas = [
  { numero: "2.400+", legenda: "artes impressas" },
  { numero: "98%", legenda: "satisfação dos clientes" },
  { numero: "⚡", legenda: "acesso imediato após pagar" },
];

const faqs = [
  {
    q: "Precisa instalar alguma coisa?",
    a: "Não. Funciona direto no navegador, sem download, sem extensão.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim, mas recomendamos usar no computador para a hora de imprimir — a impressora costuma estar conectada lá.",
  },
  {
    q: "E se eu tiver dúvidas?",
    a: "Suporte via WhatsApp incluído no acesso. Respondemos em até 24h em dias úteis.",
  },
  {
    q: "O pagamento é seguro?",
    a: "Sim, processado pelo Mercado Pago. Você paga via PIX e libera o acesso na hora.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* HEADER FIXO */}
      <header className="sticky top-0 z-50 border-b border-[#6c2eb9]/10 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-[#1a0533]">
            <span className="text-2xl">🖨️</span>
            <span className="text-xl tracking-tight">Imprimax</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="hidden text-sm font-semibold text-[#1a0533]/70 hover:text-[#6c2eb9] sm:block"
            >
              Testar grátis
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-[#6c2eb9]/30 px-4 py-2 text-sm font-semibold text-[#1a0533] transition hover:border-[#6c2eb9] hover:text-[#6c2eb9]"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-[#6c2eb9]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#6c2eb9]">
                ✨ Pagamento único · acesso vitalício
              </span>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight text-[#1a0533] md:text-5xl">
                Imprima seus cartões, tags e etiquetas em casa — sem designer, sem gráfica.
              </h1>
              <p className="mt-4 text-lg text-[#1a0533]/75">
                Faça o upload da sua arte, configure o tamanho e mande imprimir. Pronto.
              </p>
              <div className="mt-8 space-y-4">
                <Link
                  href="/checkout"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#6c2eb9] to-[#e91e8c] px-6 py-4 text-base font-bold text-white shadow-soft transition hover:brightness-110 sm:w-auto sm:px-10 sm:text-lg"
                >
                  Quero meu acesso por R$19,90 →
                </Link>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[#1a0533]/70">
                  <span>✓ Acesso vitalício</span>
                  <span>✓ Sem mensalidade</span>
                  <span>✓ Funciona no celular</span>
                </div>
              </div>
            </div>

            {/* Mockup do app */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#6c2eb9]/20 to-[#e91e8c]/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white bg-white shadow-2xl">
                <div className="flex items-center gap-1.5 border-b border-[#1a0533]/10 bg-[#f5f0ff] px-4 py-3">
                  <span className="size-3 rounded-full bg-[#ff6eb4]" />
                  <span className="size-3 rounded-full bg-[#e91e8c]" />
                  <span className="size-3 rounded-full bg-[#6c2eb9]" />
                  <span className="ml-3 text-xs font-semibold text-[#1a0533]/60">
                    imprimax.netlify.app
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 p-5">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] rounded-lg bg-gradient-to-br from-[#6c2eb9]/15 to-[#e91e8c]/15 ring-1 ring-[#6c2eb9]/20"
                    />
                  ))}
                </div>
                <div className="border-t border-[#1a0533]/10 bg-white px-5 py-3 text-xs text-[#1a0533]/70">
                  3 × 4 = 12 cartões por folha (A4)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROVA SOCIAL */}
        <section className="border-y border-[#6c2eb9]/10 bg-white/60">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 md:grid-cols-3 md:px-6">
            {provas.map((p) => (
              <div
                key={p.legenda}
                className="rounded-2xl border border-[#6c2eb9]/10 bg-white p-6 text-center shadow-sm"
              >
                <p className="text-3xl font-extrabold text-[#6c2eb9] md:text-4xl">{p.numero}</p>
                <p className="mt-2 text-sm font-medium text-[#1a0533]/75">{p.legenda}</p>
              </div>
            ))}
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#e91e8c]">
              Como funciona
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-[#1a0533] md:text-4xl">
              3 passos do upload à impressora
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {passos.map((p, i) => (
              <div
                key={p.titulo}
                className="rounded-2xl border border-[#6c2eb9]/10 bg-white p-6 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6c2eb9]/15 to-[#e91e8c]/15 text-2xl">
                    {p.emoji}
                  </div>
                  <span className="text-xs font-bold text-[#6c2eb9]">PASSO {i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#1a0533]">{p.titulo}</h3>
                <p className="mt-2 text-sm text-[#1a0533]/70">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PARA QUEM É */}
        <section className="bg-white/60 py-16 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#e91e8c]">
                Pra quem é
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-[#1a0533] md:text-4xl">
                Feito pra quem vive de imprimir as próprias artes
              </h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {publicos.map((p) => (
                <div
                  key={p.titulo}
                  className="rounded-2xl border border-[#6c2eb9]/10 bg-white p-6 text-center shadow-sm"
                >
                  <div className="text-4xl">{p.emoji}</div>
                  <h3 className="mt-3 text-base font-bold text-[#1a0533]">{p.titulo}</h3>
                  <p className="mt-2 text-sm text-[#1a0533]/70">{p.frase}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFÍCIOS */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <div className="grid items-start gap-10 md:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#e91e8c]">
                O que você acessa
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-[#1a0533] md:text-4xl">
                Tudo isso. Para sempre.
              </h2>
              <p className="mt-4 text-base text-[#1a0533]/70">
                Pagamento único de R$19,90. Sem mensalidade, sem renovação. Funciona enquanto a internet existir.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-1">
              {beneficios.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 rounded-xl border border-[#6c2eb9]/10 bg-white p-4 shadow-sm"
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6c2eb9] to-[#e91e8c] text-xs font-bold text-white">
                    ✓
                  </span>
                  <span className="text-sm font-medium text-[#1a0533]">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white/60 py-16 md:py-20">
          <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#e91e8c]">
                Perguntas frequentes
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-[#1a0533] md:text-4xl">
                Tirando as suas dúvidas
              </h2>
            </div>
            <div className="mt-10 space-y-3">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-[#6c2eb9]/10 bg-white p-5 shadow-sm transition open:shadow-soft"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-bold text-[#1a0533]">
                    {f.q}
                    <span className="text-[#6c2eb9] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-[#1a0533]/75">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section
          id="comprar"
          className="bg-gradient-to-br from-[#6c2eb9] to-[#e91e8c] py-16 text-center text-white md:py-24"
        >
          <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
            <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-bold uppercase tracking-widest">
              Acesso vitalício
            </span>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
              R$19,90 uma vez. <br className="hidden sm:block" />
              Para sempre.
            </h2>
            <p className="mt-4 text-white/90 md:text-lg">
              Pague uma vez e acesse o Imprimax sem prazo de validade.
            </p>
            <Link
              href="/checkout"
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-base font-extrabold text-[#6c2eb9] shadow-2xl transition hover:scale-[1.02] md:text-lg"
            >
              Garantir meu acesso agora →
            </Link>
            <p className="mt-4 text-sm text-white/80">🔒 Pagamento seguro via Mercado Pago</p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#6c2eb9]/10 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-[#1a0533]/70 md:flex-row md:px-6">
          <p>© {new Date().getFullYear()} Imprimax · Todos os direitos reservados</p>
          <div className="flex items-center gap-4">
            <Link href="/termos" className="hover:text-[#6c2eb9]">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="hover:text-[#6c2eb9]">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
