"use client";

import { useRouter } from "next/navigation";
import { LogOut, User, Bell, Menu, MessageSquare, Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { LangSwitcher } from "./lang-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { switchOrganization } from "@/app/actions/switch-org";
import { getInitials } from "@/lib/utils";
import Link from "next/link";

interface Org {
  id: string;
  name: string;
  slug: string;
}

interface TopbarProps {
  user: {
    id: string;
    email?: string;
    full_name?: string;
    role?: string;
    avatar_url?: string;
    org_id?: string;
  };
  orgs: Org[];
  onMenuClick: () => void;
}

export function Topbar({ user, orgs, onMenuClick }: TopbarProps) {
  const router = useRouter();
  const currentOrg = orgs.find((o) => o.id === user.org_id);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b bg-background px-4 sm:px-6">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Org name on desktop */}
      {currentOrg && (
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          <span className="truncate max-w-[160px]">{currentOrg.name}</span>
        </div>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <div className="hidden sm:block">
          <LangSwitcher />
        </div>
        <ThemeToggle />

        <Link href="/messages">
          <Button variant="ghost" size="icon" title="Messages">
            <MessageSquare className="h-5 w-5" />
          </Button>
        </Link>

        <Button variant="ghost" size="icon" title="Notifications">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-brand text-white text-xs">
                  {getInitials(user.full_name || user.email || "U")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60" align="end">
            <DropdownMenuLabel>
              <div className="space-y-0.5">
                <p className="font-medium truncate">{user.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate font-normal">{user.email}</p>
                {user.role && (
                  <p className="text-xs text-brand capitalize font-normal">{user.role}</p>
                )}
              </div>
            </DropdownMenuLabel>

            {/* Organization switcher */}
            {orgs.length > 0 && (
              <>
                <DropdownMenuSeparator />
                {orgs.length === 1 ? (
                  <div className="px-2 py-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{orgs[0].name}</span>
                  </div>
                ) : (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{currentOrg?.name ?? "Select org"}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-52">
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                        Switch Organization
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {orgs.map((org) => (
                        <DropdownMenuItem
                          key={org.id}
                          className="gap-2"
                          onClick={async () => {
                            if (org.id !== user.org_id) {
                              await switchOrganization(org.id);
                            }
                          }}
                        >
                          {org.id === user.org_id && (
                            <Check className="h-3.5 w-3.5 text-brand flex-shrink-0" />
                          )}
                          <span className={org.id === user.org_id ? "font-medium" : "ml-5"}>
                            {org.name}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/settings">
                <User className="mr-2 h-4 w-4" />
                Profile &amp; Settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
