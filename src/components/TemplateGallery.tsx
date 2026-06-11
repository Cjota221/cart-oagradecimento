"use client";

import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";

export type TemplateItem = {
  id: string;
  name: string;
  category: "cartao_agradecimento" | "tag_produto" | "etiqueta";
  front_url: string;
  back_url?: string | null;
  is_free: boolean;
};

type Props = {
  templates: TemplateItem[];
  hasAccess: boolean;
  selectedTemplateId?: string | null;
  onSelect: (template: TemplateItem) => void;
};

const CATEGORY_LABELS: Record<TemplateItem["category"], string> = {
  cartao_agradecimento: "Cartao",
  tag_produto: "Tag",
  etiqueta: "Etiqueta",
};

type CategoryFilter = "todos" | TemplateItem["category"];

export default function TemplateGallery({
  templates,
  hasAccess,
  selectedTemplateId = null,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("todos");
  const [preview, setPreview] = useState<TemplateItem | null>(null);
  const [previewSide, setPreviewSide] = useState<"front" | "back">("front");
  const [cardSides, setCardSides] = useState<Record<string, "front" | "back">>({});

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesCategory = category === "todos" || template.category === category;
      const matchesQuery =
        !normalizedQuery ||
        template.name.toLowerCase().includes(normalizedQuery) ||
        CATEGORY_LABELS[template.category].toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, query, templates]);

  function openPreview(template: TemplateItem) {
    setPreview(template);
    setPreviewSide("front");
  }

  function loadTemplate(template: TemplateItem) {
    onSelect(template);
    setPreview(null);
  }

  function getCardSide(template: TemplateItem) {
    return template.back_url ? cardSides[template.id] ?? "front" : "front";
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#16120E]/70">
          Templates prontos
        </h2>
        <p className="mt-1 text-xs text-[#16120E]/60">
          Escolha, visualize frente e verso, depois carregue na folha.
        </p>
      </div>

      <div className="space-y-2">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar template"
        />
        <div className="grid grid-cols-2 gap-2">
          {(["todos", "cartao_agradecimento", "tag_produto", "etiqueta"] as CategoryFilter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                category === item
                  ? "border-[#FF5028] bg-[#FFF1EE] text-[#FF5028]"
                  : "border-[#E6E2DC] bg-white text-[#16120E]/65 hover:border-[#FFD2C7]"
              }`}
            >
              {item === "todos" ? "Todos" : CATEGORY_LABELS[item]}
            </button>
          ))}
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <Card className="p-4 text-center">
          <p className="text-sm font-semibold text-[#16120E]">Nenhum template encontrado</p>
          <p className="mt-1 text-xs text-[#16120E]/60">Tente outro nome ou categoria.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {filteredTemplates.map((template) => {
            const locked = !template.is_free && !hasAccess;
            const selected = selectedTemplateId === template.id;
            const cardSide = getCardSide(template);
            const visibleImage =
              cardSide === "back" ? template.back_url || template.front_url : template.front_url;

            return (
              <article
                key={template.id}
                className={`overflow-hidden rounded-lg border bg-white transition ${
                  selected
                    ? "border-[#FF5028] shadow-[0_14px_36px_rgba(255,80,40,0.16)]"
                    : "border-[#E6E2DC] hover:border-[#FFD2C7]"
                } ${locked ? "opacity-65" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => openPreview(template)}
                  className="block w-full text-left"
                >
                  <div className="relative aspect-[4/5] bg-[#F7F7F7]">
                    <img
                      src={visibleImage}
                      alt={`${template.name} ${cardSide === "front" ? "frente" : "verso"}`}
                      className="h-full w-full object-contain p-3"
                      loading="lazy"
                    />
                    <div className="absolute left-2 top-2 flex gap-1">
                      {locked && (
                        <span className="inline-flex items-center gap-1 rounded bg-[#16120E] px-1.5 py-1 text-[10px] font-bold text-white">
                          <Icon name="lock" className="size-3" />
                          Premium
                        </span>
                      )}
                      {selected && (
                        <span className="rounded bg-[#FF5028] px-1.5 py-1 text-[10px] font-bold text-white">
                          Em uso
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-xs font-bold text-[#16120E]">{template.name}</p>
                    <p className="mt-1 text-[11px] font-medium text-[#16120E]/55">
                      {CATEGORY_LABELS[template.category]} {template.back_url ? "com verso" : "frente unica"}
                    </p>
                  </div>
                </button>
                <div className="border-t border-[#F0EDE9] p-2.5">
                  {template.back_url && (
                    <div className="mb-2 grid grid-cols-2 gap-1 rounded-lg bg-[#F7F7F7] p-1">
                      <button
                        type="button"
                        onClick={() => setCardSides((prev) => ({ ...prev, [template.id]: "front" }))}
                        className={`rounded-md px-2 py-1.5 text-[11px] font-bold ${
                          cardSide === "front"
                            ? "bg-white text-[#FF5028] shadow-sm"
                            : "text-[#16120E]/55"
                        }`}
                      >
                        Frente
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardSides((prev) => ({ ...prev, [template.id]: "back" }))}
                        className={`rounded-md px-2 py-1.5 text-[11px] font-bold ${
                          cardSide === "back"
                            ? "bg-white text-[#FF5028] shadow-sm"
                            : "text-[#16120E]/55"
                        }`}
                      >
                        Verso
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => loadTemplate(template)}
                    className="w-full rounded-md bg-[#FF5028] px-2 py-2 text-xs font-bold text-white transition hover:bg-[#C83A18] disabled:cursor-not-allowed disabled:bg-[#E6E2DC] disabled:text-[#9A948D]"
                  >
                    {locked ? "Bloqueado" : "Carregar"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#16120E]/55 p-4"
          onClick={(event) => {
            if (event.currentTarget === event.target) setPreview(null);
          }}
        >
          <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-[#E6E2DC] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-[#16120E]">{preview.name}</p>
                <p className="text-xs text-[#16120E]/60">{CATEGORY_LABELS[preview.category]}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="ml-auto rounded-md border border-[#E6E2DC] p-2 text-[#16120E]/70 hover:bg-[#F7F7F7]"
                aria-label="Fechar preview"
              >
                <Icon name="x" className="size-4" />
              </button>
            </div>
            <div className="grid md:grid-cols-[1fr_220px]">
              <div className="flex max-h-[70vh] items-center justify-center bg-[#F7F7F7] p-4">
                <img
                  src={previewSide === "front" ? preview.front_url : preview.back_url || preview.front_url}
                  alt={`${preview.name} ${previewSide === "front" ? "frente" : "verso"}`}
                  className="max-h-[64vh] w-auto max-w-full object-contain shadow-sm"
                />
              </div>
              <div className="space-y-3 p-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewSide("front")}
                    className={`rounded-lg border px-3 py-2 text-xs font-bold ${
                      previewSide === "front"
                        ? "border-[#FF5028] bg-[#FFF1EE] text-[#FF5028]"
                        : "border-[#E6E2DC] text-[#16120E]/65"
                    }`}
                  >
                    Frente
                  </button>
                  <button
                    type="button"
                    disabled={!preview.back_url}
                    onClick={() => setPreviewSide("back")}
                    className={`rounded-lg border px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-45 ${
                      previewSide === "back"
                        ? "border-[#FF5028] bg-[#FFF1EE] text-[#FF5028]"
                        : "border-[#E6E2DC] text-[#16120E]/65"
                    }`}
                  >
                    Verso
                  </button>
                </div>
                <button
                  type="button"
                  disabled={!preview.is_free && !hasAccess}
                  onClick={() => loadTemplate(preview)}
                  className="imprimax-btn w-full"
                >
                  Carregar template
                </button>
                {!preview.is_free && !hasAccess && (
                  <p className="text-xs font-medium text-[#DC2626]">
                    Este template premium precisa de acesso ativo.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
