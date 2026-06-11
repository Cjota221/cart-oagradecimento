"use client";

import { useEffect, useState } from "react";

type Category = "cartao_agradecimento" | "tag_produto" | "etiqueta";

interface TemplateItem {
  id: string;
  name: string;
  category: Category;
  front_url: string;
  back_url: string | null;
  is_free: boolean;
  is_active: boolean;
  created_at: string;
}

const CATEGORY_LABELS: Record<Category, string> = {
  cartao_agradecimento: "Cartão de Agradecimento",
  tag_produto: "Tag de Produto",
  etiqueta: "Etiqueta",
};

const EMPTY_FORM = {
  name: "",
  category: "cartao_agradecimento" as Category,
  front_url: "",
  back_url: "",
  is_free: false,
  is_active: true,
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  async function loadTemplates() {
    setLoading(true);
    const res = await fetch("/api/admin/templates");
    const json = await res.json();
    setTemplates(json.templates ?? []);
    setLoading(false);
  }

  useEffect(() => { loadTemplates(); }, []);

  function openNew() {
    setEditingTemplate(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  }

  function openEdit(t: TemplateItem) {
    setEditingTemplate(t);
    setForm({
      name: t.name,
      category: t.category,
      front_url: t.front_url,
      back_url: t.back_url ?? "",
      is_free: t.is_free,
      is_active: t.is_active,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingTemplate(null);
    setForm({ ...EMPTY_FORM });
  }

  async function uploadFile(file: File, side: "front" | "back") {
    const setUploading = side === "front" ? setUploadingFront : setUploadingBack;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "templates");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json();
    setUploading(false);
    if (json.url) {
      setForm((prev) => ({ ...prev, [side === "front" ? "front_url" : "back_url"]: json.url }));
    } else {
      alert("Erro no upload: " + (json.error ?? "desconhecido"));
    }
  }

  async function handleToggleActive(t: TemplateItem) {
    await fetch("/api/admin/templates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, is_active: !t.is_active }),
    });
    setTemplates((prev) => prev.map((x) => x.id === t.id ? { ...x, is_active: !t.is_active } : x));
  }

  async function handleDelete(t: TemplateItem) {
    if (!window.confirm(`Excluir o template "${t.name}"? Esta ação não pode ser desfeita.`)) return;
    await fetch(`/api/admin/templates?id=${t.id}`, { method: "DELETE" });
    setTemplates((prev) => prev.filter((x) => x.id !== t.id));
  }

  async function handleSave() {
    if (!form.name || !form.category || !form.front_url) {
      alert("Nome, categoria e imagem da frente são obrigatórios.");
      return;
    }
    setSaving(true);
    const body = {
      name: form.name,
      category: form.category,
      front_url: form.front_url,
      back_url: form.back_url || null,
      is_free: form.is_free,
      is_active: form.is_active,
    };

    if (editingTemplate) {
      await fetch("/api/admin/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingTemplate.id, ...body }),
      });
    } else {
      await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    setSaving(false);
    closeForm();
    loadTemplates();
  }

  const total = templates.length;
  const ativos = templates.filter((t) => t.is_active).length;
  const gratuitos = templates.filter((t) => t.is_free).length;
  const premium = total - gratuitos;

  return (
    <div>
      {/* Header da seção */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 800, fontSize: "28px", color: "#16120E", margin: 0, letterSpacing: "-0.02em" }}>
            Templates
          </h1>
          <p style={{ marginTop: "6px", fontSize: "13px", color: "#9A948D" }}>
            {total} total · {ativos} ativos · {gratuitos} gratuitos · {premium} premium
          </p>
        </div>
        <button
          onClick={openNew}
          style={{ background: "#FF5028", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          + Novo template
        </button>
      </div>

      {/* Estado de carregamento */}
      {loading && (
        <p style={{ color: "#9A948D", fontSize: "14px" }}>Carregando templates...</p>
      )}

      {/* Estado vazio */}
      {!loading && templates.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 24px", background: "#fff", borderRadius: "12px", border: "1px solid #E8E5E1" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📂</div>
          <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 700, fontSize: "18px", color: "#16120E", margin: 0 }}>
            Nenhum template ainda
          </p>
          <p style={{ marginTop: "8px", fontSize: "14px", color: "#9A948D" }}>
            Clique em + Novo template para adicionar o primeiro.
          </p>
        </div>
      )}

      {/* Grid de templates */}
      {!loading && templates.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {templates.map((t) => (
            <div
              key={t.id}
              style={{ background: "#fff", border: "1px solid #E8E5E1", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                {t.front_url && (
                  <img
                    src={t.front_url}
                    alt={t.name}
                    style={{ width: "64px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid #E8E5E1", flexShrink: 0 }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 700, fontSize: "15px", color: "#16120E", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {t.name}
                  </p>
                  <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                    <span style={{ background: "#EEF2FF", color: "#4F46E5", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>
                      {CATEGORY_LABELS[t.category] ?? t.category}
                    </span>
                    <span style={{ background: t.is_free ? "#D1FAE5" : "#EEF2FF", color: t.is_free ? "#065F46" : "#4F46E5", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>
                      {t.is_free ? "Gratuito" : "Premium"}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#16120E", fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={t.is_active}
                    onChange={() => handleToggleActive(t)}
                    style={{ accentColor: "#FF5028", width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  Ativo
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => openEdit(t)}
                    style={{ background: "transparent", border: "1px solid #E8E5E1", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: "#16120E", cursor: "pointer" }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(t)}
                    style={{ background: "transparent", border: "1px solid #FECACA", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: "#DC2626", cursor: "pointer" }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de criação/edição */}
      {showForm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(22,18,14,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}
        >
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", padding: "28px" }}>
            <h2 style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 800, fontSize: "20px", color: "#16120E", margin: "0 0 20px" }}>
              {editingTemplate ? "Editar template" : "Novo template"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Nome */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "6px" }}>
                  Nome *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Cartão Floral Rosa"
                  style={{ width: "100%", border: "1px solid #E8E5E1", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Categoria */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "6px" }}>
                  Categoria *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as Category }))}
                  style={{ width: "100%", border: "1px solid #E8E5E1", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", outline: "none", background: "#fff", boxSizing: "border-box" }}
                >
                  <option value="cartao_agradecimento">Cartão de Agradecimento</option>
                  <option value="tag_produto">Tag de Produto</option>
                  <option value="etiqueta">Etiqueta</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div style={{ display: "flex", gap: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#16120E", fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={form.is_free}
                    onChange={(e) => setForm((p) => ({ ...p, is_free: e.target.checked }))}
                    style={{ accentColor: "#FF5028", width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  Este template é gratuito
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#16120E", fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                    style={{ accentColor: "#FF5028", width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  Exibir na galeria
                </label>
              </div>

              {/* Imagem da frente */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "6px" }}>
                  Imagem da frente *
                </label>
                {form.front_url && (
                  <img
                    src={form.front_url}
                    alt="Frente"
                    style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid #E8E5E1", marginBottom: "8px", display: "block" }}
                  />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingFront}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, "front"); }}
                  style={{ fontSize: "13px" }}
                />
                {uploadingFront && (
                  <p style={{ marginTop: "6px", fontSize: "12px", color: "#9A948D" }}>Enviando frente...</p>
                )}
              </div>

              {/* Imagem do verso */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "6px" }}>
                  Imagem do verso <span style={{ fontWeight: 400, color: "#9A948D" }}>(opcional)</span>
                </label>
                {form.back_url && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <img
                      src={form.back_url}
                      alt="Verso"
                      style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid #E8E5E1" }}
                    />
                    <button
                      onClick={() => setForm((p) => ({ ...p, back_url: "" }))}
                      style={{ background: "transparent", border: "1px solid #FECACA", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 600, color: "#DC2626", cursor: "pointer" }}
                    >
                      Remover verso
                    </button>
                  </div>
                )}
                {!form.back_url && (
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploadingBack}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, "back"); }}
                    style={{ fontSize: "13px" }}
                  />
                )}
                {uploadingBack && (
                  <p style={{ marginTop: "6px", fontSize: "12px", color: "#9A948D" }}>Enviando verso...</p>
                )}
              </div>
            </div>

            {/* Botões */}
            <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
              <button
                onClick={closeForm}
                style={{ background: "transparent", border: "1px solid #E8E5E1", borderRadius: "8px", padding: "10px 18px", fontWeight: 600, fontSize: "14px", color: "#16120E", cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploadingFront || uploadingBack}
                style={{ background: saving ? "#9A948D" : "#FF5028", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: 700, fontSize: "14px", cursor: saving ? "not-allowed" : "pointer" }}
              >
                {saving ? "Salvando..." : "Salvar template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
