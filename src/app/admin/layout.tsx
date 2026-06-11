import { redirect } from "next/navigation";
import Link from "next/link";
import { checkIsAdmin } from "@/lib/is-admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", background: "#FEFCF9", fontFamily: "var(--font-dm-sans), sans-serif" }}>
      <header style={{ background: "#16120E", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", gap: "24px" }}>
        <span style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 800, fontSize: "18px", color: "#FEFCF9", letterSpacing: "-0.02em" }}>
          Imprimax
        </span>
        <span style={{ color: "#9A948D", fontSize: "13px" }}>/</span>
        <span style={{ color: "#9A948D", fontSize: "13px", fontFamily: "var(--font-dm-mono), monospace" }}>admin</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: "16px" }}>
          <Link href="/admin/templates" style={{ color: "#FEFCF9", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
            Templates
          </Link>
          <Link href="/admin/users" style={{ color: "#9A948D", fontSize: "13px", textDecoration: "none" }}>
            Usuários
          </Link>
          <Link href="/dashboard" style={{ color: "#9A948D", fontSize: "13px", textDecoration: "none" }}>
            ← Sair do admin
          </Link>
        </div>
      </header>
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        {children}
      </main>
    </div>
  );
}
