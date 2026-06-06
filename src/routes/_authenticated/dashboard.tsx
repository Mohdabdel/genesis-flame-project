import { createFileRoute, Link, useNavigate, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ClipboardList,
  FolderKanban,
  GraduationCap,
  Settings,
  Menu,
  LogOut,
  ChevronLeft,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
});

const navItems = [
  { label: "لوحة التحكم", icon: LayoutDashboard, href: "/dashboard" },
  { label: "التقييمات", icon: ClipboardList, href: "/dashboard/assessments" },
  { label: "المشاريع", icon: FolderKanban, href: "/dashboard/projects" },
  { label: "التدريب", icon: GraduationCap, href: "/dashboard/training" },
  { label: "الإعدادات", icon: Settings, href: "/dashboard/settings" },
];

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*, organizations(*)")
        .eq("id", user.user.id)
        .single();
      return data;
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const currentPath = Route.useMatch().pathname;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-col border-l bg-card transition-all duration-300 md:static",
          sidebarOpen ? "w-64" : "w-16",
          mobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link to="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              هم
            </div>
            {sidebarOpen && (
              <span className="whitespace-nowrap font-semibold text-foreground">
                مسارهمم
              </span>
            )}
          </Link>
          <button
            onClick={() => {
              setSidebarOpen(!sidebarOpen);
              setMobileOpen(false);
            }}
            className="rounded-md p-1 hover:bg-accent"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => {
            const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-3 space-y-2">
          {profile?.organizations && sidebarOpen && (
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{profile.organizations.name}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && "تسجيل الخروج"}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 hover:bg-accent md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <p className="font-medium">{profile?.full_name || "المستخدم"}</p>
              <p className="text-xs text-muted-foreground">{profile?.job_title || ""}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              {(profile?.full_name || "U")[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
