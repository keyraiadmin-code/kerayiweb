"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  FileText,
  Wrench,
  ClipboardList,
  FileSignature,
  ListFilter,
  HardHat,
  FolderOpen,
  MessageSquare,
  BarChart3,
  Settings,
  ShieldCheck,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, key: "dashboard" as const },
  { href: "/properties", icon: Building2, key: "properties" as const },
  { href: "/tenants", icon: Users, key: "tenants" as const },
  { href: "/payments", icon: CreditCard, key: "payments" as const },
  { href: "/receipts", icon: FileText, key: "receipts" as const },
  { href: "/maintenance", icon: Wrench, key: "maintenance" as const },
  { href: "/applications", icon: ClipboardList, key: "applications" as const },
  { href: "/leases", icon: FileSignature, key: "leases" as const },
  { href: "/listings/manage", icon: ListFilter, key: "listings" as const },
  { href: "/vendors", icon: HardHat, key: "vendors" as const },
  { href: "/documents", icon: FolderOpen, key: "documents" as const },
  { href: "/messages", icon: MessageSquare, key: "messages" as const },
  { href: "/reports", icon: BarChart3, key: "reports" as const },
  { href: "/settings", icon: Settings, key: "settings" as const },
  { href: "/admin", icon: ShieldCheck, key: "admin" as const },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen sticky top-0 border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b">
        <div className="flex-shrink-0 w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
          <Home className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-lg text-brand">Keyrai</span>
            <p className="text-[10px] text-muted-foreground leading-none">Ethiopia</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded hover:bg-muted"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map(({ href, icon: Icon, key }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>{t[key]}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t">
          <p className="text-[10px] text-muted-foreground">© 2025 Keyrai</p>
        </div>
      )}
    </aside>
  );
}
