import Link from "next/link";
import { LayoutGrid, Settings2, Workflow } from "lucide-react";
import type { CSSProperties } from "react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutGrid, active: false },
  { label: "Workflows", href: "/", icon: Workflow, active: true },
];

const sidebarStyle: CSSProperties = {
  position: "fixed",
  inset: "0 auto 0 0",
  zIndex: 20,
  display: "flex",
  width: 261,
  flexDirection: "column",
  borderRight: "1px solid rgba(229, 229, 229, 0.5)",
  background: "#f9f9f9",
};

const navLinkStyle: CSSProperties = {
  display: "flex",
  height: 38,
  alignItems: "center",
  gap: 12,
  borderRadius: 10,
  padding: "0 12px",
  fontSize: 14,
  fontWeight: 400,
  color: "#6b7280",
  textDecoration: "none",
};

const navLinkActiveStyle: CSSProperties = {
  background: "#e8e8e8",
  color: "#111111",
};

export function AppSidebar() {
  return (
    <aside style={sidebarStyle}>
      <div style={{ padding: "12px 18px 18px" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "-0.045em",
                color: "#111111",
              }}
            >
              NextFlow
            </p>
          </div>
        </Link>
      </div>

      <nav style={{ flex: "1 1 0%", padding: "0 6px" }}>
        <div style={{ display: "grid", gap: 3 }}>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                style={item.active ? { ...navLinkStyle, ...navLinkActiveStyle } : navLinkStyle}
              >
                <Icon size={16} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div style={{ padding: "16px 8px 16px" }}>
        <button
          style={{
            margin: "0 20px",
            display: "flex",
            height: 32,
            width: "calc(100% - 40px)",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 9999,
            border: "1px solid #d1d5db",
            background: "#ffffff",
            fontSize: 12,
            fontWeight: 500,
            color: "#4b5563",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          }}
        >
          <Settings2 size={16} />
          Settings
        </button>
      </div>
    </aside>
  );
}
