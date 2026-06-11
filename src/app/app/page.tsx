import Link from "next/link";
import CardGenerator from "@/components/CardGenerator";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

export default function AppPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="no-print border-b border-white/20 bg-[#1847CC] text-white">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6">
          <Link href="/" className="block">
            <h1 className="text-3xl font-extrabold tracking-tight">Imprimax</h1>
            <p className="mt-1 text-sm text-white/90">Gerador de Cartões Profissional</p>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="secondary" className="bg-white text-[#16120E]">
                Entrar
              </Button>
            </Link>
            <Link
              href="/#comprar"
              className="inline-flex items-center rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white"
            >
              Comprar acesso vitalício
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 md:px-6">
        <section className="no-print mb-6 grid gap-4 rounded-2xl border border-[#1847CC]/10 bg-white/90 p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-[#16120E] md:text-3xl">
              Crie, alinhe e imprima frente/verso sem dor de cabeça
            </h2>
            <p className="mt-2 text-sm text-[#16120E]/75">
              Teste o gerador básico gratuito. Para desbloquear templates premium, faça o pagamento único vitalício.
            </p>
          </div>
          <div className="w-full max-w-xs">
            <Link href="/checkout">
              <Button className="w-full gap-2">
                Comprar Acesso Vitalício
                <Icon name="arrow-right" className="size-4" />
              </Button>
            </Link>
          </div>
        </section>

        <CardGenerator />
      </main>
    </div>
  );
}
