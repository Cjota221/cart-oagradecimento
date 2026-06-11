import Link from "next/link";
import Icon from "@/components/ui/Icon";

const beneficios = [
  "Grade automática por cm",
  "Impressão frente e verso alinhada",
  "Funciona sem internet após carregar",
  "Artes prontas incluídas em breve",
  "Atualização gratuita para sempre",
  "Sem limite de impressões",
];

const publicos = [
  { icon: "briefcase" as const, titulo: "Revendedoras", frase: "Cartões de agradecimento que vendem o próximo pedido." },
  { icon: "settings" as const, titulo: "Artesãs", frase: "Tags personalizadas pros seus produtos com identidade própria." },
  { icon: "store" as const, titulo: "Lojistas", frase: "Etiquetas, cartões e materiais sem pagar designer todo mês." },
  { icon: "package" as const, titulo: "Papelarias", frase: "Imprima sob demanda para os seus clientes finais." },
];

const passos = [
  { icon: "upload" as const, titulo: "Suba sua arte", desc: "Faça upload do JPG ou PNG da sua arte de frente e verso." },
  { icon: "settings" as const, titulo: "Configure o tamanho", desc: "Informe as dimensões em cm e o sistema monta o grid automaticamente." },
  { icon: "printer" as const, titulo: "Mande imprimir", desc: "Clique em imprimir e saia direto na sua impressora caseira." },
];

const provas = [
  { numero: "2.400+", legenda: "artes impressas" },
  { numero: "98%", legenda: "satisfação dos clientes" },
  { icon: "sparkle" as const, legenda: "acesso imediato após pagar" },
];

const faqs = [
  {
    q: "Precisa instalar alguma coisa?",
    a: "Não. Funciona direto no navegador, sem download, sem extensão.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim, mas recomendamos usar no computador para a hora de imprimir, porque a impressora costuma estar conectada lá.",
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
      <header className="sticky top-0 z-50 border-b border-[#1847CC]/10 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-[#16120E]">
            <Icon name="printer" className="size-6 text-[#1847CC]" />
            <span className="text-xl tracking-tight">Imprimax</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="hidden text-sm font-semibold text-[#16120E]/70 hover:text-[#1847CC] sm:block"
            >
              Testar grátis
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-[#1847CC]/30 px-4 py-2 text-sm font-semibold text-[#16120E] transition hover:border-[#1847CC] hover:text-[#1847CC]"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1847CC]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#1847CC]">
                <Icon name="sparkle" className="size-3.5" />
                Pagamento único · acesso vitalício
              </span>
              <h1
                className="mt-4 text-4xl font-extrabold leading-tight text-[#16120E] md:text-5xl"
                style={{
                  fontFamily: "var(--font-jakarta), sans-serif",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
              >
                Imprima seus cartões, tags e etiquetas em casa, sem designer, sem gráfica.
              </h1>
              <p className="mt-4 text-lg text-[#16120E]/75">
                Faça o upload da sua arte, configure o tamanho e mande imprimir. Pronto.
              </p>
              <div className="mt-8 space-y-4">
                <Link
                  href="/checkout"
                  className="ix-btn-accent w-full gap-2 px-6 py-4 text-base shadow-soft sm:w-auto sm:px-10 sm:text-lg"
                >
                  Quero meu acesso por R$19,90
                  <Icon name="arrow-right" className="size-5" />
                </Link>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[#16120E]/70">
                  {["Acesso vitalício", "Sem mensalidade", "Funciona no celular"].map((item) => (
                    <span key={item} className="inline-flex items-center gap-1.5">
                      <Icon name="check" className="size-4 text-[#1847CC]" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#1847CC]/20 to-[#F55028]/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white bg-white shadow-2xl">
                <div className="flex items-center gap-1.5 border-b border-[#16120E]/10 bg-[#FEFCF9] px-4 py-3">
                  <span className="size-3 rounded-full bg-[#FFF1EE]" />
                  <span className="size-3 rounded-full bg-[#F55028]" />
                  <span className="size-3 rounded-full bg-[#1847CC]" />
                  <span className="ml-3 text-xs font-semibold text-[#16120E]/60">
                    imprimax.netlify.app
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 p-5">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] rounded-lg bg-gradient-to-br from-[#1847CC]/15 to-[#F55028]/15 ring-1 ring-[#1847CC]/20"
                    />
                  ))}
                </div>
                <div className="border-t border-[#16120E]/10 bg-white px-5 py-3 text-xs text-[#16120E]/70">
                  3 x 4 = 12 cartões por folha (A4)
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#1847CC]/10 bg-white/60">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 md:grid-cols-3 md:px-6">
            {provas.map((p) => (
              <div
                key={p.legenda}
                className="rounded-2xl border border-[#1847CC]/10 bg-white p-6 text-center shadow-sm"
              >
                {"numero" in p ? (
                  <p className="text-3xl font-extrabold text-[#1847CC] md:text-4xl">{p.numero}</p>
                ) : (
                  <Icon name={p.icon} className="mx-auto size-10 text-[#1847CC]" />
                )}
                <p className="mt-2 text-sm font-medium text-[#16120E]/75">{p.legenda}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#F55028]">
              Como funciona
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-[#16120E] md:text-4xl">
              3 passos do upload à impressora
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {passos.map((p, i) => (
              <div
                key={p.titulo}
                className="rounded-2xl border border-[#1847CC]/10 bg-white p-6 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1847CC]/15 to-[#F55028]/15">
                    <Icon name={p.icon} className="size-6 text-[#1847CC]" />
                  </div>
                  <span className="text-xs font-bold text-[#1847CC]">PASSO {i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#16120E]">{p.titulo}</h3>
                <p className="mt-2 text-sm text-[#16120E]/70">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/60 py-16 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#F55028]">
                Pra quem é
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-[#16120E] md:text-4xl">
                Feito pra quem vive de imprimir as próprias artes
              </h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {publicos.map((p) => (
                <div
                  key={p.titulo}
                  className="rounded-2xl border border-[#1847CC]/10 bg-white p-6 text-center shadow-sm"
                >
                  <Icon name={p.icon} className="mx-auto size-10 text-[#1847CC]" />
                  <h3 className="mt-3 text-base font-bold text-[#16120E]">{p.titulo}</h3>
                  <p className="mt-2 text-sm text-[#16120E]/70">{p.frase}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <div className="grid items-start gap-10 md:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#F55028]">
                O que você acessa
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-[#16120E] md:text-4xl">
                Tudo isso. Para sempre.
              </h2>
              <p className="mt-4 text-base text-[#16120E]/70">
                Pagamento único de R$19,90. Sem mensalidade, sem renovação. Funciona enquanto a internet existir.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-1">
              {beneficios.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 rounded-xl border border-[#1847CC]/10 bg-white p-4 shadow-sm"
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1847CC] to-[#F55028] text-white">
                    <Icon name="check" className="size-4" />
                  </span>
                  <span className="text-sm font-medium text-[#16120E]">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-white/60 py-16 md:py-20">
          <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#F55028]">
                Perguntas frequentes
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-[#16120E] md:text-4xl">
                Tirando as suas dúvidas
              </h2>
            </div>
            <div className="mt-10 space-y-3">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-[#1847CC]/10 bg-white p-5 shadow-sm transition open:shadow-soft"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-bold text-[#16120E]">
                    {f.q}
                    <Icon name="x" className="size-5 text-[#1847CC] transition group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 text-sm text-[#16120E]/75">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section
          id="comprar"
          className="bg-gradient-to-br from-[#1847CC] to-[#F55028] py-16 text-center text-white md:py-24"
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
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-extrabold text-[#1847CC] shadow-2xl transition hover:scale-[1.02] md:text-lg"
            >
              Garantir meu acesso agora
              <Icon name="arrow-right" className="size-5" />
            </Link>
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-white/80">
              <Icon name="lock" className="size-4" />
              Pagamento seguro via Mercado Pago
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1847CC]/10 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-[#16120E]/70 md:flex-row md:px-6">
          <p>© {new Date().getFullYear()} Imprimax · Todos os direitos reservados</p>
          <div className="flex items-center gap-4">
            <Link href="/termos" className="hover:text-[#1847CC]">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="hover:text-[#1847CC]">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
