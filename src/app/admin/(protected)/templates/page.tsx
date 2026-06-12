"use client";

import { useEffect, useState } from "react";
import { TEMPLATE_CATEGORIES, NICHOS } from "@/lib/imprimax-constants";

type AdminTab = "templates" | "kits" | "colecoes";

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  nicho: string;
  front_url: string;
  back_url: string | null;
  is_free: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface KitAdminItem {
  id: string;
  name: string;
  description: string | null;
  nicho: string;
  is_free: boolean;
  is_active: boolean;
  sort_order: number;
  templates: TemplateItem[];
}

interface ColecaoAdminItem {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  is_active: boolean;
  sort_order: number;
  templates: TemplateItem[];
}

const EMPTY_COLECAO_FORM = {
  name: "",
  description: "",
  cover_url: "",
  is_active: true,
  sort_order: 0,
  template_ids: [] as string[],
};

const EMPTY_FORM = {
  name: "",
  category: "cartao_agradecimento",
  nicho: "geral",
  front_url: "",
  back_url: "",
  is_free: false,
  is_active: true,
  sort_order: 0,
};

const EMPTY_KIT_FORM = {
  name: "",
  description: "",
  nicho: "geral",
  is_free: false,
  is_active: true,
  sort_order: 0,
  template_ids: [] as string[],
};

const INPUT_STYLE = {
  width: "100%",
  border: "1px solid #E8E5E1",
  borderRadius: "8px",
  padding: "10px 12px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box" as const,
};

export default function AdminTemplatesPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("templates");

  // ── Templates state ──
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // ── Kits state ──
  const [kits, setKits] = useState<KitAdminItem[]>([]);
  const [loadingKits, setLoadingKits] = useState(false);
  const [showKitForm, setShowKitForm] = useState(false);
  const [editingKit, setEditingKit] = useState<KitAdminItem | null>(null);
  const [savingKit, setSavingKit] = useState(false);
  const [kitForm, setKitForm] = useState({ ...EMPTY_KIT_FORM });

  // ── Coleções state ──
  const [colecoes, setColecoes] = useState<ColecaoAdminItem[]>([]);
  const [loadingColecoes, setLoadingColecoes] = useState(false);
  const [showColecaoForm, setShowColecaoForm] = useState(false);
  const [editingColecao, setEditingColecao] = useState<ColecaoAdminItem | null>(null);
  const [savingColecao, setSavingColecao] = useState(false);
  const [colecaoForm, setColecaoForm] = useState({ ...EMPTY_COLECAO_FORM });

  // ── Data loading ──
  async function loadTemplates() {
    setLoading(true);
    const res = await fetch("/api/admin/templates");
    const json = await res.json();
    setTemplates(json.templates ?? []);
    setLoading(false);
  }

  async function loadKits() {
    setLoadingKits(true);
    const res = await fetch("/api/admin/kits");
    const json = await res.json();
    setKits(json.kits ?? []);
    setLoadingKits(false);
  }

  async function loadColecoes() {
    setLoadingColecoes(true);
    const res = await fetch("/api/admin/colecoes");
    const json = await res.json();
    setColecoes(json.colecoes ?? []);
    setLoadingColecoes(false);
  }

  useEffect(() => { loadTemplates(); }, []);

  useEffect(() => {
    if (activeTab === "kits" && kits.length === 0) loadKits();
    if (activeTab === "colecoes" && colecoes.length === 0) loadColecoes();
  }, [activeTab]);

  // ── Template CRUD ──
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
      nicho: t.nicho || "geral",
      front_url: t.front_url,
      back_url: t.back_url ?? "",
      is_free: t.is_free,
      is_active: t.is_active,
      sort_order: t.sort_order ?? 0,
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
      nicho: form.nicho,
      front_url: form.front_url,
      back_url: form.back_url || null,
      is_free: form.is_free,
      is_active: form.is_active,
      sort_order: form.sort_order,
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

  // ── Kit CRUD ──
  function openNewKit() {
    setEditingKit(null);
    setKitForm({ ...EMPTY_KIT_FORM });
    setShowKitForm(true);
  }

  function openEditKit(k: KitAdminItem) {
    setEditingKit(k);
    setKitForm({
      name: k.name,
      description: k.description ?? "",
      nicho: k.nicho || "geral",
      is_free: k.is_free,
      is_active: k.is_active,
      sort_order: k.sort_order ?? 0,
      template_ids: (k.templates || []).map((t) => t.id),
    });
    setShowKitForm(true);
  }

  function closeKitForm() {
    setShowKitForm(false);
    setEditingKit(null);
    setKitForm({ ...EMPTY_KIT_FORM });
  }

  async function handleDeleteKit(k: KitAdminItem) {
    if (!window.confirm(`Excluir o kit "${k.name}"?`)) return;
    await fetch(`/api/admin/kits?id=${k.id}`, { method: "DELETE" });
    setKits((prev) => prev.filter((x) => x.id !== k.id));
  }

  async function handleSaveKit() {
    if (!kitForm.name) { alert("Nome do kit é obrigatório."); return; }
    setSavingKit(true);
    const body = {
      name: kitForm.name,
      description: kitForm.description || null,
      nicho: kitForm.nicho,
      is_free: kitForm.is_free,
      is_active: kitForm.is_active,
      sort_order: kitForm.sort_order,
      template_ids: kitForm.template_ids,
    };
    if (editingKit) {
      await fetch("/api/admin/kits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingKit.id, ...body }),
      });
    } else {
      await fetch("/api/admin/kits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    setSavingKit(false);
    closeKitForm();
    loadKits();
  }

  function toggleTemplateInKit(tid: string) {
    setKitForm((prev) => ({
      ...prev,
      template_ids: prev.template_ids.includes(tid)
        ? prev.template_ids.filter((x) => x !== tid)
        : [...prev.template_ids, tid],
    }));
  }

  // ── Coleções CRUD ──
  function openNewColecao() {
    setEditingColecao(null);
    setColecaoForm({ ...EMPTY_COLECAO_FORM });
    setShowColecaoForm(true);
  }

  function openEditColecao(c: ColecaoAdminItem) {
    setEditingColecao(c);
    setColecaoForm({
      name: c.name,
      description: c.description ?? "",
      cover_url: c.cover_url ?? "",
      is_active: c.is_active,
      sort_order: c.sort_order ?? 0,
      template_ids: (c.templates || []).map((t) => t.id),
    });
    setShowColecaoForm(true);
  }

  function closeColecaoForm() {
    setShowColecaoForm(false);
    setEditingColecao(null);
    setColecaoForm({ ...EMPTY_COLECAO_FORM });
  }

  async function handleDeleteColecao(c: ColecaoAdminItem) {
    if (!window.confirm(`Excluir a coleção "${c.name}"?`)) return;
    await fetch(`/api/admin/colecoes?id=${c.id}`, { method: "DELETE" });
    setColecoes((prev) => prev.filter((x) => x.id !== c.id));
  }

  async function handleSaveColecao() {
    if (!colecaoForm.name) { alert("Nome da coleção é obrigatório."); return; }
    setSavingColecao(true);
    const body = {
      name: colecaoForm.name,
      description: colecaoForm.description || null,
      cover_url: colecaoForm.cover_url || null,
      is_active: colecaoForm.is_active,
      sort_order: colecaoForm.sort_order,
      template_ids: colecaoForm.template_ids,
    };
    if (editingColecao) {
      await fetch("/api/admin/colecoes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingColecao.id, ...body }),
      });
    } else {
      await fetch("/api/admin/colecoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    setSavingColecao(false);
    closeColecaoForm();
    loadColecoes();
  }

  function toggleTemplateInColecao(tid: string) {
    setColecaoForm((prev) => ({
      ...prev,
      template_ids: prev.template_ids.includes(tid)
        ? prev.template_ids.filter((x) => x !== tid)
        : [...prev.template_ids, tid],
    }));
  }

  const total = templates.length;
  const ativos = templates.filter((t) => t.is_active).length;
  const gratuitos = templates.filter((t) => t.is_free).length;

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "28px", borderBottom: "1px solid #E8E5E1", paddingBottom: "0" }}>
        {(["templates", "kits", "colecoes"] as AdminTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontFamily: "var(--font-jakarta), sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              padding: "10px 20px",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #FF5028" : "2px solid transparent",
              color: activeTab === tab ? "#FF5028" : "#9A948D",
              cursor: "pointer",
              marginBottom: "-1px",
            }}
          >
            {tab === "templates" ? "Templates" : tab === "kits" ? "Kits" : "Coleções"}
          </button>
        ))}
      </div>

      {/* ── TEMPLATES TAB ── */}
      {activeTab === "templates" && (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 800, fontSize: "28px", color: "#16120E", margin: 0 }}>
                Templates
              </h1>
              <p style={{ marginTop: "6px", fontSize: "13px", color: "#9A948D" }}>
                {total} total · {ativos} ativos · {gratuitos} gratuitos · {total - gratuitos} premium
              </p>
            </div>
            <button
              onClick={openNew}
              style={{ background: "#FF5028", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
            >
              + Novo template
            </button>
          </div>

          {loading && <p style={{ color: "#9A948D", fontSize: "14px" }}>Carregando templates...</p>}

          {!loading && templates.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 24px", background: "#fff", borderRadius: "12px", border: "1px solid #E8E5E1" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📂</div>
              <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 700, fontSize: "18px", color: "#16120E", margin: 0 }}>
                Nenhum template ainda
              </p>
            </div>
          )}

          {!loading && templates.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {templates.map((t) => (
                <div key={t.id} style={{ background: "#fff", border: "1px solid #E8E5E1", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    {t.front_url && (
                      <img src={t.front_url} alt={t.name} style={{ width: "64px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid #E8E5E1", flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 700, fontSize: "15px", color: "#16120E", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {t.name}
                      </p>
                      <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                        <span style={{ background: "#EEF2FF", color: "#4F46E5", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>
                          {TEMPLATE_CATEGORIES[t.category as keyof typeof TEMPLATE_CATEGORIES] ?? t.category}
                        </span>
                        <span style={{ background: "#F3F4F6", color: "#6B7280", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>
                          {NICHOS[t.nicho as keyof typeof NICHOS] ?? t.nicho}
                        </span>
                        <span style={{ background: t.is_free ? "#D1FAE5" : "#EEF2FF", color: t.is_free ? "#065F46" : "#4F46E5", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>
                          {t.is_free ? "Gratuito" : "Premium"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#16120E", fontWeight: 500 }}>
                      <input type="checkbox" checked={t.is_active} onChange={() => handleToggleActive(t)} style={{ accentColor: "#FF5028", width: "16px", height: "16px", cursor: "pointer" }} />
                      Ativo
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => openEdit(t)} style={{ background: "transparent", border: "1px solid #E8E5E1", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: "#16120E", cursor: "pointer" }}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(t)} style={{ background: "transparent", border: "1px solid #FECACA", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: "#DC2626", cursor: "pointer" }}>
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal template */}
          {showForm && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(22,18,14,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
              onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}>
              <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", padding: "28px" }}>
                <h2 style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 800, fontSize: "20px", color: "#16120E", margin: "0 0 20px" }}>
                  {editingTemplate ? "Editar template" : "Novo template"}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Nome */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "6px" }}>Nome *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: Cartão Floral Rosa" style={INPUT_STYLE} />
                  </div>
                  {/* Categoria */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "6px" }}>Categoria *</label>
                    <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} style={{ ...INPUT_STYLE, background: "#fff" }}>
                      {Object.entries(TEMPLATE_CATEGORIES).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  {/* Nicho */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "6px" }}>Nicho</label>
                    <select value={form.nicho} onChange={(e) => setForm((p) => ({ ...p, nicho: e.target.value }))} style={{ ...INPUT_STYLE, background: "#fff" }}>
                      {Object.entries(NICHOS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  {/* Sort order */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "6px" }}>Ordem de exibição</label>
                    <input type="number" min={0} value={form.sort_order} onChange={(e) => setForm((p) => ({ ...p, sort_order: Number(e.target.value) }))} style={INPUT_STYLE} />
                  </div>
                  {/* Checkboxes */}
                  <div style={{ display: "flex", gap: "20px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#16120E", fontWeight: 500 }}>
                      <input type="checkbox" checked={form.is_free} onChange={(e) => setForm((p) => ({ ...p, is_free: e.target.checked }))} style={{ accentColor: "#FF5028", width: "16px", height: "16px", cursor: "pointer" }} />
                      Gratuito
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#16120E", fontWeight: 500 }}>
                      <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} style={{ accentColor: "#FF5028", width: "16px", height: "16px", cursor: "pointer" }} />
                      Exibir na galeria
                    </label>
                  </div>
                  {/* Imagem frente */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "6px" }}>Imagem da frente *</label>
                    {form.front_url && <img src={form.front_url} alt="Frente" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid #E8E5E1", marginBottom: "8px", display: "block" }} />}
                    <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingFront} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, "front"); }} style={{ fontSize: "13px" }} />
                    {uploadingFront && <p style={{ marginTop: "6px", fontSize: "12px", color: "#9A948D" }}>Enviando frente...</p>}
                  </div>
                  {/* Imagem verso */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "6px" }}>Imagem do verso <span style={{ fontWeight: 400, color: "#9A948D" }}>(opcional)</span></label>
                    {form.back_url && (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <img src={form.back_url} alt="Verso" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid #E8E5E1" }} />
                        <button onClick={() => setForm((p) => ({ ...p, back_url: "" }))} style={{ background: "transparent", border: "1px solid #FECACA", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 600, color: "#DC2626", cursor: "pointer" }}>
                          Remover verso
                        </button>
                      </div>
                    )}
                    {!form.back_url && (
                      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingBack} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, "back"); }} style={{ fontSize: "13px" }} />
                    )}
                    {uploadingBack && <p style={{ marginTop: "6px", fontSize: "12px", color: "#9A948D" }}>Enviando verso...</p>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
                  <button onClick={closeForm} style={{ background: "transparent", border: "1px solid #E8E5E1", borderRadius: "8px", padding: "10px 18px", fontWeight: 600, fontSize: "14px", color: "#16120E", cursor: "pointer" }}>
                    Cancelar
                  </button>
                  <button onClick={handleSave} disabled={saving || uploadingFront || uploadingBack} style={{ background: saving ? "#9A948D" : "#FF5028", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: 700, fontSize: "14px", cursor: saving ? "not-allowed" : "pointer" }}>
                    {saving ? "Salvando..." : "Salvar template"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── KITS TAB ── */}
      {activeTab === "kits" && (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 800, fontSize: "28px", color: "#16120E", margin: 0 }}>
                Kits
              </h1>
              <p style={{ marginTop: "6px", fontSize: "13px", color: "#9A948D" }}>
                {kits.length} kits cadastrados
              </p>
            </div>
            <button
              onClick={openNewKit}
              style={{ background: "#FF5028", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
            >
              + Novo kit
            </button>
          </div>

          {loadingKits && <p style={{ color: "#9A948D", fontSize: "14px" }}>Carregando kits...</p>}

          {!loadingKits && kits.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 24px", background: "#fff", borderRadius: "12px", border: "1px solid #E8E5E1" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
              <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 700, fontSize: "18px", color: "#16120E", margin: 0 }}>
                Nenhum kit ainda
              </p>
              <p style={{ marginTop: "8px", fontSize: "14px", color: "#9A948D" }}>
                Clique em + Novo kit para agrupar templates relacionados.
              </p>
            </div>
          )}

          {!loadingKits && kits.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {kits.map((k) => (
                <div key={k.id} style={{ background: "#fff", border: "1px solid #E8E5E1", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 700, fontSize: "15px", color: "#16120E", margin: 0 }}>{k.name}</p>
                    <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                      <span style={{ background: "#F3F4F6", color: "#6B7280", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>
                        {NICHOS[k.nicho as keyof typeof NICHOS] ?? k.nicho}
                      </span>
                      <span style={{ background: "#E0F2FE", color: "#0369A1", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>
                        {(k.templates || []).length} templates
                      </span>
                      <span style={{ background: k.is_free ? "#D1FAE5" : "#EEF2FF", color: k.is_free ? "#065F46" : "#4F46E5", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>
                        {k.is_free ? "Gratuito" : "Premium"}
                      </span>
                      {!k.is_active && (
                        <span style={{ background: "#FEE2E2", color: "#DC2626", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>
                          Inativo
                        </span>
                      )}
                    </div>
                    {k.description && (
                      <p style={{ marginTop: "6px", fontSize: "12px", color: "#9A948D" }}>{k.description}</p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button onClick={() => openEditKit(k)} style={{ background: "transparent", border: "1px solid #E8E5E1", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: "#16120E", cursor: "pointer" }}>
                      Editar
                    </button>
                    <button onClick={() => handleDeleteKit(k)} style={{ background: "transparent", border: "1px solid #FECACA", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: "#DC2626", cursor: "pointer" }}>
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal kit */}
          {showKitForm && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(22,18,14,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
              onClick={(e) => { if (e.target === e.currentTarget) closeKitForm(); }}>
              <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", padding: "28px" }}>
                <h2 style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 800, fontSize: "20px", color: "#16120E", margin: "0 0 20px" }}>
                  {editingKit ? "Editar kit" : "Novo kit"}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "6px" }}>Nome *</label>
                    <input type="text" value={kitForm.name} onChange={(e) => setKitForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: Kit Confeitaria Deluxe" style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "6px" }}>Descrição <span style={{ fontWeight: 400, color: "#9A948D" }}>(opcional)</span></label>
                    <input type="text" value={kitForm.description} onChange={(e) => setKitForm((p) => ({ ...p, description: e.target.value }))} placeholder="Ex: Cartão, tag e etiqueta para confeitaria" style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "6px" }}>Nicho</label>
                    <select value={kitForm.nicho} onChange={(e) => setKitForm((p) => ({ ...p, nicho: e.target.value }))} style={{ ...INPUT_STYLE, background: "#fff" }}>
                      {Object.entries(NICHOS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "6px" }}>Ordem de exibição</label>
                    <input type="number" min={0} value={kitForm.sort_order} onChange={(e) => setKitForm((p) => ({ ...p, sort_order: Number(e.target.value) }))} style={INPUT_STYLE} />
                  </div>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#16120E", fontWeight: 500 }}>
                      <input type="checkbox" checked={kitForm.is_free} onChange={(e) => setKitForm((p) => ({ ...p, is_free: e.target.checked }))} style={{ accentColor: "#FF5028", width: "16px", height: "16px" }} />
                      Gratuito
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#16120E", fontWeight: 500 }}>
                      <input type="checkbox" checked={kitForm.is_active} onChange={(e) => setKitForm((p) => ({ ...p, is_active: e.target.checked }))} style={{ accentColor: "#FF5028", width: "16px", height: "16px" }} />
                      Ativo
                    </label>
                  </div>
                  {/* Template selection */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "10px" }}>
                      Templates do kit <span style={{ fontWeight: 400, color: "#9A948D" }}>({kitForm.template_ids.length} selecionados)</span>
                    </label>
                    {templates.length === 0 && (
                      <p style={{ fontSize: "13px", color: "#9A948D" }}>Nenhum template disponível. Crie templates primeiro.</p>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "8px", maxHeight: "280px", overflowY: "auto", padding: "4px" }}>
                      {templates.filter((t) => t.is_active).map((t) => {
                        const selected = kitForm.template_ids.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => toggleTemplateInKit(t.id)}
                            style={{
                              background: selected ? "#FFF1EE" : "#FAFAFA",
                              border: selected ? "1.5px solid #FF5028" : "1px solid #E8E5E1",
                              borderRadius: "8px",
                              padding: "4px",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <img src={t.front_url} alt={t.name} style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: "4px", display: "block" }} />
                            <p style={{ fontSize: "10px", fontWeight: 600, color: selected ? "#FF5028" : "#16120E", margin: "4px 2px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {t.name}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
                  <button onClick={closeKitForm} style={{ background: "transparent", border: "1px solid #E8E5E1", borderRadius: "8px", padding: "10px 18px", fontWeight: 600, fontSize: "14px", color: "#16120E", cursor: "pointer" }}>
                    Cancelar
                  </button>
                  <button onClick={handleSaveKit} disabled={savingKit} style={{ background: savingKit ? "#9A948D" : "#FF5028", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: 700, fontSize: "14px", cursor: savingKit ? "not-allowed" : "pointer" }}>
                    {savingKit ? "Salvando..." : "Salvar kit"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── COLEÇÕES TAB ── */}
      {activeTab === "colecoes" && (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 800, fontSize: "28px", color: "#16120E", margin: 0 }}>
                Coleções
              </h1>
              <p style={{ marginTop: "6px", fontSize: "13px", color: "#9A948D" }}>
                {colecoes.length} coleções cadastradas — agrupamento por tema visual
              </p>
            </div>
            <button onClick={openNewColecao} style={{ background: "#7C3AED", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
              + Nova coleção
            </button>
          </div>

          {loadingColecoes && <p style={{ color: "#9A948D", fontSize: "14px" }}>Carregando coleções...</p>}

          {!loadingColecoes && colecoes.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 24px", background: "#fff", borderRadius: "12px", border: "1px solid #E8E5E1" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎨</div>
              <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 700, fontSize: "18px", color: "#16120E", margin: 0 }}>
                Nenhuma coleção ainda
              </p>
              <p style={{ marginTop: "8px", fontSize: "14px", color: "#9A948D" }}>
                Agrupe templates com tema visual semelhante (ex: Coleção Floral, Coleção Minimalista).
              </p>
            </div>
          )}

          {!loadingColecoes && colecoes.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {colecoes.map((c) => (
                <div key={c.id} style={{ background: "#fff", border: "1px solid #E8E5E1", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 700, fontSize: "15px", color: "#16120E", margin: 0 }}>{c.name}</p>
                    <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                      <span style={{ background: "#EDE9FE", color: "#6D28D9", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>
                        {(c.templates || []).length} templates
                      </span>
                      {!c.is_active && (
                        <span style={{ background: "#FEE2E2", color: "#DC2626", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>Inativo</span>
                      )}
                    </div>
                    {c.description && <p style={{ marginTop: "6px", fontSize: "12px", color: "#9A948D" }}>{c.description}</p>}
                  </div>
                  {/* Miniaturas dos templates */}
                  {(c.templates || []).length > 0 && (
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {(c.templates || []).slice(0, 6).map((t) => (
                        <img key={t.id} src={t.front_url} alt={t.name} style={{ width: "40px", height: "50px", objectFit: "cover", borderRadius: "4px", border: "1px solid #E8E5E1" }} />
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button onClick={() => openEditColecao(c)} style={{ background: "transparent", border: "1px solid #E8E5E1", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: "#16120E", cursor: "pointer" }}>
                      Editar
                    </button>
                    <button onClick={() => handleDeleteColecao(c)} style={{ background: "transparent", border: "1px solid #FECACA", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: "#DC2626", cursor: "pointer" }}>
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal coleção */}
          {showColecaoForm && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(22,18,14,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
              onClick={(e) => { if (e.target === e.currentTarget) closeColecaoForm(); }}>
              <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", padding: "28px" }}>
                <h2 style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 800, fontSize: "20px", color: "#16120E", margin: "0 0 20px" }}>
                  {editingColecao ? "Editar coleção" : "Nova coleção"}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "6px" }}>Nome *</label>
                    <input type="text" value={colecaoForm.name} onChange={(e) => setColecaoForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: Coleção Floral Primavera" style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "6px" }}>Descrição <span style={{ fontWeight: 400, color: "#9A948D" }}>(opcional)</span></label>
                    <input type="text" value={colecaoForm.description} onChange={(e) => setColecaoForm((p) => ({ ...p, description: e.target.value }))} placeholder="Ex: Designs com motivos florais e cores suaves" style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "6px" }}>Ordem de exibição</label>
                    <input type="number" min={0} value={colecaoForm.sort_order} onChange={(e) => setColecaoForm((p) => ({ ...p, sort_order: Number(e.target.value) }))} style={INPUT_STYLE} />
                  </div>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#16120E", fontWeight: 500 }}>
                      <input type="checkbox" checked={colecaoForm.is_active} onChange={(e) => setColecaoForm((p) => ({ ...p, is_active: e.target.checked }))} style={{ accentColor: "#7C3AED", width: "16px", height: "16px" }} />
                      Ativa (visível na galeria)
                    </label>
                  </div>
                  {/* Seleção de templates */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#16120E", marginBottom: "10px" }}>
                      Templates da coleção <span style={{ fontWeight: 400, color: "#9A948D" }}>({colecaoForm.template_ids.length} selecionados)</span>
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "8px", maxHeight: "280px", overflowY: "auto", padding: "4px" }}>
                      {templates.filter((t) => t.is_active).map((t) => {
                        const selected = colecaoForm.template_ids.includes(t.id);
                        return (
                          <button key={t.id} type="button" onClick={() => toggleTemplateInColecao(t.id)} style={{ background: selected ? "#F5F3FF" : "#FAFAFA", border: selected ? "1.5px solid #7C3AED" : "1px solid #E8E5E1", borderRadius: "8px", padding: "4px", cursor: "pointer", textAlign: "left" }}>
                            <img src={t.front_url} alt={t.name} style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: "4px", display: "block" }} />
                            <p style={{ fontSize: "10px", fontWeight: 600, color: selected ? "#7C3AED" : "#16120E", margin: "4px 2px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {t.name}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
                  <button onClick={closeColecaoForm} style={{ background: "transparent", border: "1px solid #E8E5E1", borderRadius: "8px", padding: "10px 18px", fontWeight: 600, fontSize: "14px", color: "#16120E", cursor: "pointer" }}>
                    Cancelar
                  </button>
                  <button onClick={handleSaveColecao} disabled={savingColecao} style={{ background: savingColecao ? "#9A948D" : "#7C3AED", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: 700, fontSize: "14px", cursor: savingColecao ? "not-allowed" : "pointer" }}>
                    {savingColecao ? "Salvando..." : "Salvar coleção"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
