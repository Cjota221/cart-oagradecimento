"use client";

import Card from "@/components/ui/Card";

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
  onSelect: (template: TemplateItem) => void;
};

export default function TemplateGallery({ templates, hasAccess, onSelect }: Props) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#16120E]/70">
        Templates prontos
      </h2>
      <div className="space-y-3">
        {templates.map((template) => {
          const locked = !template.is_free && !hasAccess;

          return (
            <Card key={template.id} className="p-3">
              <button
                type="button"
                disabled={locked}
                onClick={() => onSelect(template)}
                className="w-full text-left disabled:cursor-not-allowed disabled:opacity-55"
              >
                <p className="text-sm font-semibold text-[#16120E]">{template.name}</p>
                <p className="mt-1 text-xs text-[#16120E]/70">{template.category.replace("_", " ")}</p>
                <p className="mt-2 text-xs font-medium text-[#FF5028]">
                  {locked ? "Premium bloqueado" : "Disponível para carregar"}
                </p>
              </button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
