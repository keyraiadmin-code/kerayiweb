"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, CreditCard, FileText,
  Wrench, ClipboardList, FileSignature, ListFilter, HardHat,
  FolderOpen, BarChart3, Settings, ShieldCheck, Home,
  ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type NavItem = { href: string; icon: React.ComponentType<{ className?: string }>; label: string };
type NavGroup = { label?: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/properties", icon: Building2, label: "Properties" },
      { href: "/payments", icon: CreditCard, label: "Payments" },
      { href: "/receipts", icon: FileText, label: "Receipts" },
      { href: "/reports", icon: BarChart3, label: "Reports" },
    ],
  },
  {
    label: "Tenants",
    items: [
      { href: "/tenants", icon: Users, label: "Tenant Directory" },
      { href: "/leases", icon: FileSignature, label: "Leases" },
      { href: "/applications", icon: ClipboardList, label: "Applications" },
      { href: "/documents", icon: FolderOpen, label: "Documents" },
    ],
  },
  {
    label: "Maintenance",
    items: [
      { href: "/maintenance", icon: Wrench, label: "Work Orders" },
      { href: "/vendors", icon: HardHat, label: "Vendors" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/listings/manage", icon: ListFilter, label: "Listings" },
      { href: "/settings", icon: Settings, label: "Settings" },
      { href: "/admin", icon: ShieldCheck, label: "Admin" },
    ],
  },
];

function NavContent({ collapsed, onClose }: { collapsed: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 py-3 overflow-y-auto">
      {navGroups.map((group, gi) => (
        <div key={gi} className="mb-1">
          {group.label && !collapsed && (
            <p className="px-5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              {group.label}
            </p>
          )}
          {group.label && collapsed && (
            <div className="mx-3 my-2 border-t border-border/40" />
          )}
          <ul className="space-y-0.5 px-2">
            {group.items.map(({ href, icon: Icon, label }) => {
              const isActive =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    title={collapsed ? label : undefined}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 border-r bg-card transition-all duration-300 flex-shrink-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center gap-3 px-4 py-5 border-b min-h-[64px]">
          {!collapsed && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-shrink-0 w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-brand truncate">Keyrai</span>
            </div>
          )}
          {collapsed && (
            <div className="flex-shrink-0 w-8 h-8 bg-brand rounded-lg flex items-center justify-center mx-auto">
              <Home className="h-4 w-4 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex-shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors",
              collapsed && "mx-auto"
            )}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <NavContent collapsed={collapsed} />

        <div className="px-4 py-3 border-t">
          {!collapsed ? (
            <p className="text-[10px] text-muted-foreground">© 2026 Keyrai</p>
          ) : (
            <p className="text-[10px] text-muted-foreground text-center">©</p>
          )}
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-card border-r shadow-xl transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <Home className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-brand">Keyrai</span>
          </div>
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <NavContent collapsed={false} onClose={onMobileClose} />
        <div className="px-4 py-3 border-t">
          <p className="text-[10px] text-muted-foreground">© 2026 Keyrai</p>
        </div>
      </aside>
    </>
  );
}
