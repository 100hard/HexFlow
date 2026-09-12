"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Folder, 
  BarChart2, 
  Bookmark, 
  Users, 
  Settings, 
  Palette, 
  Sparkles, 
  Mic 
} from "lucide-react";
import type { CSSProperties } from "react";

const mainNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Projects", href: "/", icon: Folder },
  { label: "Renders", href: "/", icon: BarChart2 },
  { label: "Library", href: "/", icon: Bookmark },
  { label: "Actors", href: "/", icon: Users },
];

const toolNavItems = [
  { label: "HexFlow", href: "/workflows", icon: Palette },
  { label: "Marketing Studio", href: "/", icon: Sparkles },
  { label: "Talking head", href: "/", icon: Mic },
];

const sidebarStyle: CSSProperties = {
  position: "fixed",
  inset: "0 auto 0 0",
  zIndex: 20,
  display: "flex",
  width: 240,
  flexDirection: "column",
  borderRight: "1px solid #f1f5f9",
  background: "#ffffff",
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const navLinkStyle: CSSProperties = {
  display: "flex",
  height: 36,
  alignItems: "center",
  gap: 12,
  borderRadius: 8,
  padding: "0 12px",
  fontSize: 13,
  fontWeight: 500,
  color: "#475569",
  textDecoration: "none",
  transition: "all 0.15s ease",
};

const navLinkActiveStyle: CSSProperties = {
  background: "#dcfce7",
  color: "#15803d",
  fontWeight: 600,
};

export function AppSidebar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isWorkflow = pathname.startsWith("/workflow");

  return (
    <aside style={sidebarStyle}>
      {/* Brand Header */}
      <div style={{ padding: "20px 20px 16px" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#0f172a",
              textTransform: "uppercase",
            }}
          >
            HEXCODED
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav style={{ flex: "1 1 0%", padding: "0 10px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "grid", gap: 2 }}>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = item.label === "Home" && isHome;

            return (
              <Link
                key={item.label}
                href={item.href}
                style={active ? { ...navLinkStyle, ...navLinkActiveStyle } : navLinkStyle}
                className={!active ? "hover:bg-slate-50 hover:text-slate-900" : ""}
              >
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Tools Section */}
        <div style={{ marginTop: 24, marginBottom: 8, padding: "0 12px" }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#94a3b8",
              textTransform: "uppercase",
            }}
          >
            Tools
          </span>
        </div>

        <div style={{ display: "grid", gap: 2 }}>
          {toolNavItems.map((item) => {
            const Icon = item.icon;
            const active = item.label === "HexFlow" && isWorkflow;

            return (
              <Link
                key={item.label}
                href={item.href}
                style={active ? { ...navLinkStyle, ...navLinkActiveStyle } : navLinkStyle}
                className={!active ? "hover:bg-slate-50 hover:text-slate-900" : ""}
              >
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Settings Link */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid #f8fafc" }}>
        <Link
          href="/"
          style={{
            ...navLinkStyle,
            color: "#64748b",
          }}
          className="hover:bg-slate-50 hover:text-slate-900"
        >
          <Settings size={16} strokeWidth={1.8} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}

