"use client";

import { useState } from "react";
import { TEMPLATE_CATEGORIES, NICHOS } from "@/lib/imprimax-constants";

export type TemplateItem = {
  id: string;
  name: string;
  category: string;
  nicho?: string;
  front_url: string;
  back_url?: string | null;
  is_free: boolean;
  sort_order?: number;
};

export type KitItem = {
  id: string;
  name: string;
  description?: string | null;
  nicho?: string;
  cover_url?: string | null;
  is_free: boolean;
  templates?: TemplateItem[];
};

type Tab = "todos" | "kits" | string;

type Props = {
  templates: TemplateItem[];
  kits?: KitItem[];
  hasAccess: boolean;
  selectedTemplateId?: string | null;
  onSelect: (template: TemplateItem) => void;
  onKitSelect?: (kit: KitItem) => void;
};

export default function TemplateGallery({
  templates,
  kits = [],
  hasAccess,
  selectedTemplateId = null,
  onSelect,
  onKitSelect,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("todos");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const nichosPresentes = Array.from(
    new Set(templates.map((t) => t.nicho || "geral"))
  ).filter((n) => n !== "geral");

  const templatesFiltrados = templates.filter((t) => {
    const nichoMatch =
      activeTab === "todos" || activeTab === "kits"
        ? true
        : (t.nicho || "geral") === activeTab;
    const categoryMatch =
      selectedCategory === "all" ? true : t.category === selectedCategory;
    return nichoMatch && categoryMatch;
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: "todos", label: "Todos" },
    ...(kits.length > 0 ? [{ id: "kits" as Tab, label: "Kits" }] : []),
    ...nichosPresentes.map((n) => ({
      id: n as Tab,
      label: NICHOS[n as keyof typeof NICHOS] || n,
    })),
    { id: "geral", label: "Geral" },
  ];

  return (
    <section>
      {/* Abas de nicho */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: "12px",
              fontWeight: activeTab === tab.id ? 700 : 500,
              padding: "5px 12px",
              borderRadius: "20px",
              border: activeTab === tab.id
                ? "1.5px solid #1847CC"
                : "0.5px solid #E6E2DC",
              background: activeTab === tab.id ? "#EEF2FC" : "#FFFFFF",
              color: activeTab === tab.id ? "#1038A8" : "#9A948D",
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filtro de categoria */}
      {activeTab !== "kits" && (
        <div style={{ marginBottom: "14px" }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: "13px",
              padding: "7px 10px",
              borderRadius: "8px",
              border: "0.5px solid #E6E2DC",
              background: "#FFFFFF",
              color: "#16120E",
              outline: "none",
              width: "100%",
            }}
          >
            <option value="all">Todas as categorias</option>
            {Object.entries(TEMPLATE_CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* GRID DE KITS */}
      {activeTab === "kits" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "10px",
          }}
        >
          {kits.length === 0 && (
            <p
              style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: "13px",
                color: "#9A948D",
                gridColumn: "1/-1",
                textAlign: "center",
                padding: "24px 0",
              }}
            >
              Nenhum kit disponível ainda.
            </p>
          )}
          {kits.map((kit) => {
            const locked = !kit.is_free && !hasAccess;
            const previewUrls = (kit.templates || [])
              .slice(0, 4)
              .map((t) => t.front_url);

            return (
              <div
                key={kit.id}
                style={{
                  background: "#FFFFFF",
                  border: "0.5px solid #E6E2DC",
                  borderRadius: "12px",
                  overflow: "hidden",
                  opacity: locked ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    height: "100px",
                    background: "#F5F3EF",
                    gap: "2px",
                  }}
                >
                  {previewUrls.length > 0
                    ? previewUrls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ))
                    : Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} style={{ background: "#EEF2FC" }} />
                      ))}
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-jakarta), sans-serif",
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "#16120E",
                      marginBottom: "2px",
                    }}
                  >
                    {kit.name}
                  </div>
                  {kit.description && (
                    <div
                      style={{
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        fontSize: "11px",
                        color: "#9A948D",
                        marginBottom: "8px",
                        lineHeight: 1.4,
                      }}
                    >
                      {kit.description}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontFamily: "var(--font-jakarta), sans-serif",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: locked ? "#FFF1EE" : "#EAF3DE",
                        color: locked ? "#C53410" : "#3B6D11",
                      }}
                    >
                      {locked ? "Premium" : "Disponível"}
                    </span>
                    {!locked && onKitSelect && (
                      <button
                        type="button"
                        onClick={() => onKitSelect(kit)}
                        style={{
                          marginLeft: "auto",
                          fontFamily: "var(--font-jakarta), sans-serif",
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "4px 10px",
                          background: "#1847CC",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Usar kit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GRID DE TEMPLATES */}
      {activeTab !== "kits" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "10px",
          }}
        >
          {templatesFiltrados.length === 0 && (
            <p
              style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: "13px",
                color: "#9A948D",
                gridColumn: "1/-1",
                textAlign: "center",
                padding: "24px 0",
              }}
            >
              Nenhum template nesta categoria.
            </p>
          )}
          {templatesFiltrados.map((template) => {
            const locked = !template.is_free && !hasAccess;
            const selected = selectedTemplateId === template.id;
            const catLabel =
              TEMPLATE_CATEGORIES[
                template.category as keyof typeof TEMPLATE_CATEGORIES
              ] || template.category;

            return (
              <div
                key={template.id}
                style={{
                  background: "#FFFFFF",
                  border: selected ? "1.5px solid #FF5028" : "0.5px solid #E6E2DC",
                  borderRadius: "10px",
                  overflow: "hidden",
                  cursor: locked ? "not-allowed" : "pointer",
                  opacity: locked ? 0.6 : 1,
                  transition: "border-color 150ms ease",
                  boxShadow: selected ? "0 4px 16px rgba(255,80,40,0.15)" : "none",
                }}
                onClick={() => !locked && onSelect(template)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && !locked && onSelect(template)}
                onMouseEnter={(e) => {
                  if (!locked && !selected)
                    (e.currentTarget as HTMLElement).style.borderColor = "#1847CC";
                }}
                onMouseLeave={(e) => {
                  if (!selected)
                    (e.currentTarget as HTMLElement).style.borderColor = "#E6E2DC";
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    height: "110px",
                    background: "#F5F3EF",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={template.front_url}
                    alt={template.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    loading="lazy"
                  />
                  {locked && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(22,18,14,0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ fontSize: "20px" }}>🔒</span>
                    </div>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      display: "flex",
                      gap: "3px",
                    }}
                  >
                    {template.back_url && (
                      <span
                        style={{
                          background: "rgba(24,71,204,0.9)",
                          color: "#FFFFFF",
                          fontSize: "9px",
                          fontFamily: "var(--font-jakarta), sans-serif",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        F+V
                      </span>
                    )}
                    {selected && (
                      <span
                        style={{
                          background: "#FF5028",
                          color: "#FFFFFF",
                          fontSize: "9px",
                          fontFamily: "var(--font-jakarta), sans-serif",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        Em uso
                      </span>
                    )}
                  </div>
                </div>
                {/* Info */}
                <div style={{ padding: "8px 10px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-jakarta), sans-serif",
                      fontWeight: 700,
                      fontSize: "12px",
                      color: "#16120E",
                      marginBottom: "3px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {template.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        color: "#9A948D",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "90px",
                      }}
                    >
                      {catLabel}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontFamily: "var(--font-jakarta), sans-serif",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: template.is_free ? "#EAF3DE" : "#EEF2FC",
                        color: template.is_free ? "#3B6D11" : "#1038A8",
                        flexShrink: 0,
                      }}
                    >
                      {template.is_free ? "Free" : "Pro"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
