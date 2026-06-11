import Link from "next/link";
import Icon from "@/components/ui/Icon";

const trustItems = ["Acesso imediato", "Pagamento unico", "Sem limite de impressoes"];

const steps = [
  {
    icon: "upload" as const,
    title: "Envie a arte",
    text: "Use PNG ou JPG da frente e do verso. Nao precisa editar planilha.",
  },
  {
    icon: "ruler" as const,
    title: "Informe o tamanho",
    text: "Digite largura e altura em cm. O Imprimax calcula linhas e colunas.",
  },
  {
    icon: "printer" as const,
    title: "Imprima alinhado",
    text: "Gere frente e verso prontos para A4, retrato ou paisagem.",
  },
];

const outcomes = [
  "Cartoes de agradecimento",
  "Tags para produtos",
  "Etiquetas para embalagem",
  "Brindes e papelaria de venda",
  "Materiais para lojistas",
  "Impressos sob demanda",
];

const objections = [
  {
    q: "Vou precisar contratar designer?",
    a: "Nao. Voce usa a arte que ja tem e o sistema monta a folha para impressao.",
  },
  {
    q: "Funciona para frente e verso?",
    a: "Sim. O verso e espelhado na posicao correta para bater com a frente.",
  },
  {
    q: "E se eu mudar o tamanho da arte?",
    a: "Digite a nova medida em cm e o Imprimax recalcula a grade na hora.",
  },
  {
    q: "O acesso vence?",
    a: "Nao. O pagamento e unico e o acesso e vitalicio.",
  },
];

function CtaButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/checkout"
      className={`group sales-cta-glow inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF5028] px-6 py-3.5 text-sm font-bold text-white shadow-[0_18px_40px_rgba(255,80,40,0.28)] transition hover:-translate-y-0.5 hover:bg-[#C83A18] ${className}`}
    >
      Comprar acesso por R$19,90
      <Icon name="arrow-right" className="size-4 transition group-hover:translate-x-1" />
    </Link>
  );
}

function ProductMockup() {
  return (
    <div className="sales-float relative mx-auto w-full max-w-[520px]">
      <div className="sales-pulse-badge absolute -left-3 top-24 z-20 hidden rounded-lg border border-[#FF5028]/20 bg-white px-4 py-3 shadow-2xl md:block">
        <p className="text-[11px] font-bold uppercase text-[#16120E]/45">sem calculo</p>
        <p className="mt-1 font-jakarta text-xl font-extrabold text-[#FF5028]">automatico</p>
      </div>
      <div className="absolute -right-3 top-8 z-20 hidden rounded-lg bg-[#16120E] px-4 py-3 text-white shadow-2xl md:block">
        <p className="text-[11px] font-semibold uppercase text-white/60">resultado</p>
        <p className="mt-1 font-jakarta text-2xl font-extrabold">3 x 4 = 12</p>
        <p className="text-xs text-white/70">cartoes por folha</p>
      </div>

      <div className="sales-mockup-shell relative overflow-hidden rounded-lg border border-[#16120E]/10 bg-white shadow-[0_24px_80px_rgba(22,18,14,0.14)]">
        <div className="sales-sheen pointer-events-none absolute inset-0 z-20" />
        <div className="flex items-center justify-between border-b border-[#16120E]/10 bg-[#F7F7F7] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-[#FF5028]" />
            <span className="size-3 rounded-full bg-[#16120E]" />
            <span className="size-3 rounded-full bg-[#FFD2C7]" />
          </div>
          <span className="font-mono-ix text-[11px] font-medium text-[#16120E]/55">
            imprimax.app/print
          </span>
        </div>

        <div className="grid gap-0 md:grid-cols-[190px_1fr]">
          <div className="border-b border-[#16120E]/10 bg-[#16120E] p-4 text-white md:border-b-0 md:border-r">
            <div className="flex items-center gap-2">
              <img
                src="/brand/logo/logo%20principal.png"
                alt="Imprimax"
                className="h-9 w-auto rounded bg-white px-2 py-1"
              />
            </div>

            <div className="mt-6 space-y-3">
              {[
                ["largura", "6.0 cm"],
                ["altura", "5.4 cm"],
                ["papel", "A4"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-white/45">{label}</p>
                  <p className="mt-1 font-mono-ix text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="sales-progress h-full rounded-full bg-[#FF5028]" />
            </div>
            <p className="mt-2 text-[11px] text-white/55">grade calculada automaticamente</p>
          </div>

          <div className="bg-white p-5">
            <div className="mx-auto aspect-[210/297] max-h-[360px] rounded-md border border-[#16120E]/10 bg-[#F7F7F7] p-3 shadow-inner">
              <div className="grid h-full grid-cols-3 grid-rows-4 gap-2">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="sales-card-pop sales-card-shine rounded-md border border-[#FF5028]/20 bg-white p-1"
                    style={{ animationDelay: `${index * 55}ms` }}
                  >
                    <div className="h-full rounded bg-gradient-to-br from-[#FF5028] to-[#C83A18]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {["Frente", "Verso", "Arte ok"].map((item) => (
                <div key={item} className="rounded-lg bg-[#FFF1EE] px-2 py-2 text-xs font-bold text-[#FF5028]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[#F7F7F7] text-[#16120E]">
      <header className="sticky top-0 z-50 border-b border-[#16120E]/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <img
              src="/brand/logo/logo%20principal.png"
              alt="Imprimax"
              className="h-9 w-auto"
            />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-[#16120E]/65 md:flex">
            <a href="#como-funciona" className="hover:text-[#FF5028]">Como funciona</a>
            <a href="#economia" className="hover:text-[#FF5028]">Economia</a>
            <a href="#duvidas" className="hover:text-[#FF5028]">Duvidas</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/app" className="hidden rounded-lg px-4 py-2 text-sm font-bold text-[#16120E]/70 hover:text-[#FF5028] sm:block">
              Testar gratis
            </Link>
            <CtaButton className="hidden px-4 py-2.5 sm:inline-flex" />
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[#16120E]/10 bg-[#F7F7F7]">
          <div className="sales-grid-bg absolute inset-0 opacity-70" />
          <div className="relative mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-7xl items-center gap-10 px-4 py-10 md:grid-cols-[1fr_0.92fr] md:px-6 md:py-14">
            <div className="sales-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FF5028]/20 bg-white px-3 py-1.5 text-xs font-bold uppercase text-[#FF5028] shadow-sm">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF5028] opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#FF5028]" />
                </span>
                Acesso vitalicio liberado na hora
              </div>

              <h1 className="mt-6 max-w-3xl font-jakarta text-5xl font-extrabold leading-[0.95] tracking-normal text-[#16120E] md:text-7xl">
                Imprima cartoes profissionais em casa sem designer, sem grafica e sem planilha.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#16120E]/72 md:text-xl">
                Suba sua arte, informe o tamanho em cm e o Imprimax monta a folha A4 com frente e verso alinhados automaticamente.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <CtaButton className="w-full text-base sm:w-auto sm:px-8 sm:py-4" />
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#16120E]/15 bg-white px-6 py-3.5 text-sm font-bold text-[#16120E] transition hover:border-[#FF5028]/40 hover:text-[#FF5028]"
                >
                  Testar o gerador
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {trustItems.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[#16120E]/70 shadow-sm">
                    <Icon name="check" className="size-4 text-[#FF5028]" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="sales-stat-strip mt-8 grid max-w-xl grid-cols-3 divide-x divide-[#16120E]/10 rounded-lg border border-[#16120E]/10 bg-white shadow-sm">
                {[
                  ["12", "por folha"],
                  ["300", "DPI"],
                  ["R$19,90", "uma vez"],
                ].map(([value, label]) => (
                  <div key={label} className="sales-stat-cell p-4">
                    <p className="font-jakarta text-2xl font-extrabold text-[#FF5028]">{value}</p>
                    <p className="text-xs font-semibold uppercase text-[#16120E]/45">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <ProductMockup />
          </div>
        </section>

        <section className="overflow-hidden border-b border-[#16120E]/10 bg-[#16120E] py-4 text-white">
          <div className="sales-marquee flex min-w-max gap-8 whitespace-nowrap text-sm font-bold uppercase tracking-wide text-white/75">
            {Array.from({ length: 2 }).map((_, group) => (
              <div key={group} className="flex gap-8">
                {outcomes.map((item) => (
                  <span key={`${group}-${item}`} className="inline-flex items-center gap-2">
                    <Icon name="sparkle" className="size-4 text-[#FF5028]" />
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section id="economia" className="bg-white py-16 md:py-24">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 md:grid-cols-[0.9fr_1.1fr] md:px-6">
            <div>
              <p className="text-sm font-bold uppercase text-[#FF5028]">O problema</p>
              <h2 className="mt-3 font-jakarta text-4xl font-extrabold tracking-normal md:text-5xl">
                Cada ajuste pequeno vira custo, atraso e retrabalho.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#16120E]/70">
                O Imprimax troca tentativa e erro por um fluxo direto: tamanho em cm, grade pronta e impressao alinhada.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                ["Designer para montar folha", "Voce monta em segundos"],
                ["Planilha para calcular medidas", "O sistema calcula a grade"],
                ["Teste manual de frente e verso", "Verso ja sai posicionado"],
                ["Pagar de novo a cada arte", "Acesso vitalicio por R$19,90"],
              ].map(([before, after]) => (
                <div key={before} className="sales-compare-row grid gap-3 rounded-lg border border-[#16120E]/10 bg-[#F7F7F7] p-4 md:grid-cols-2">
                  <div className="rounded-lg bg-white p-4 text-sm font-semibold text-[#16120E]/55 line-through">
                    {before}
                  </div>
                  <div className="rounded-lg bg-[#16120E] p-4 text-sm font-bold text-white">
                    <Icon name="check" className="mr-2 inline size-4 text-[#FF5028]" />
                    {after}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="bg-[#F7F7F7] py-16 md:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase text-[#FF5028]">Como funciona</p>
              <h2 className="mt-3 font-jakarta text-4xl font-extrabold tracking-normal md:text-5xl">
                Da arte solta para a folha pronta em 3 passos.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="sales-lift rounded-lg border border-[#16120E]/10 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-lg bg-[#FFF1EE] text-[#FF5028]">
                      <Icon name={step.icon} className="size-6" />
                    </span>
                    <span className="font-mono-ix text-xs font-bold text-[#16120E]/35">0{index + 1}</span>
                  </div>
                  <h3 className="mt-6 font-jakarta text-xl font-extrabold">{step.title}</h3>
                  <p className="mt-3 leading-7 text-[#16120E]/68">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 md:grid-cols-[1fr_0.9fr] md:px-6">
            <div className="sales-offer-panel relative overflow-hidden rounded-lg bg-[#16120E] p-8 text-white md:p-10">
              <div className="sales-scan pointer-events-none absolute inset-x-0 top-0 h-px bg-white/60" />
              <p className="text-sm font-bold uppercase text-[#FF5028]">Oferta simples</p>
              <h2 className="mt-3 font-jakarta text-4xl font-extrabold tracking-normal md:text-5xl">
                R$19,90 uma vez. Use sempre que precisar imprimir.
              </h2>
              <p className="mt-5 leading-8 text-white/72">
                Ideal para quem vende produto fisico, embala pedidos e precisa imprimir material bonito sem depender de terceiros.
              </p>
              <CtaButton className="mt-8 bg-white text-[#FF5028] hover:bg-[#FFF1EE]" />
            </div>

            <div className="grid content-center gap-3">
              {outcomes.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-[#FF5028]/10 bg-[#FFF1EE] p-4 font-bold text-[#16120E]">
                  <Icon name="check" className="size-5 text-[#FF5028]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="duvidas" className="bg-[#F7F7F7] py-16 md:py-24">
          <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase text-[#FF5028]">Duvidas comuns</p>
              <h2 className="mt-3 font-jakarta text-4xl font-extrabold tracking-normal">
                Antes de comprar, aqui vai o essencial.
              </h2>
            </div>
            <div className="mt-10 space-y-3">
              {objections.map((item) => (
                <details key={item.q} className="group rounded-lg border border-[#16120E]/10 bg-white p-5 shadow-sm">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-jakarta text-lg font-bold">
                    {item.q}
                    <Icon name="x" className="size-5 text-[#FF5028] transition group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 leading-7 text-[#16120E]/70">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="comprar" className="bg-[#FF5028] py-16 text-center text-white md:py-24">
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <p className="text-sm font-bold uppercase text-white/70">Acesso vitalicio</p>
            <h2 className="mt-3 font-jakarta text-5xl font-extrabold leading-none tracking-normal md:text-6xl">
              Comece a imprimir hoje.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/82">
              Pague uma vez, libere o gerador e monte suas folhas A4 sem calculo manual.
            </p>
            <Link
              href="/checkout"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-extrabold text-[#FF5028] shadow-2xl transition hover:-translate-y-0.5 hover:bg-[#FFF1EE]"
            >
              Comprar por R$19,90
              <Icon name="arrow-right" className="size-5" />
            </Link>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#16120E]/10 bg-white/95 p-3 shadow-[0_-16px_40px_rgba(22,18,14,0.12)] backdrop-blur md:hidden">
        <CtaButton className="w-full" />
      </div>
    </div>
  );
}
