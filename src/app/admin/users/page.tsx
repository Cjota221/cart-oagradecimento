import { getSupabaseServiceClient } from "@/lib/supabase-service";

interface Profile {
  id: string;
  email: string;
  name: string | null;
  has_access: boolean;
  is_admin: boolean;
  paid_at: string | null;
  created_at: string;
}

function fmt(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function AdminUsersPage() {
  const service = getSupabaseServiceClient();
  const { data: profiles } = await service
    .from("imprimax_profiles")
    .select("id, email, name, has_access, is_admin, paid_at, created_at")
    .order("created_at", { ascending: false });

  const rows = (profiles ?? []) as Profile[];

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 800, fontSize: "28px", color: "#16120E", margin: 0, letterSpacing: "-0.02em" }}>
          Usuários
        </h1>
        <p style={{ marginTop: "6px", fontSize: "13px", color: "#9A948D" }}>
          {rows.length} cadastros · {rows.filter((r) => r.has_access).length} com acesso
        </p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E8E5E1", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#F7F7F7", borderBottom: "1px solid #E8E5E1" }}>
                {["Email", "Nome", "Acesso", "Admin", "Pagou em", "Cadastro"].map((col) => (
                  <th
                    key={col}
                    style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, color: "#16120E", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "#9A948D" }}>
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              )}
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  style={{ borderBottom: i < rows.length - 1 ? "1px solid #F0EDE9" : "none" }}
                >
                  <td style={{ padding: "12px 16px", color: "#16120E", fontFamily: "var(--font-dm-mono), monospace", fontSize: "12px" }}>
                    {r.email}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#16120E" }}>
                    {r.name ?? <span style={{ color: "#9A948D" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: r.has_access ? "#D1FAE5" : "#FEF3C7", color: r.has_access ? "#065F46" : "#92400E", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>
                      {r.has_access ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: r.is_admin ? "#EEF2FF" : "transparent", color: r.is_admin ? "#4F46E5" : "#9A948D", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>
                      {r.is_admin ? "Admin" : "—"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#16120E" }}>
                    {fmt(r.paid_at)}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#9A948D", fontFamily: "var(--font-dm-mono), monospace", fontSize: "12px" }}>
                    {fmt(r.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
