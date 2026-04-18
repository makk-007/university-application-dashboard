import { Outlet, Link, useLocation, Navigate } from "react-router";
import {
  LayoutDashboard,
  GraduationCap,
  DollarSign,
  Calendar,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/universities", label: "Universities", icon: GraduationCap },
  { path: "/scholarships", label: "Scholarships", icon: DollarSign },
  { path: "/timeline", label: "Timeline", icon: Calendar },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function Layout() {
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const initials = user.email ? user.email.slice(0, 2).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border fixed h-full flex flex-col z-10">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="size-5 text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-sm text-sidebar-foreground leading-tight">
              Application Tracker
            </h1>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/" && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="size-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground">Graduate Student</p>
            </div>
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
            >
              {theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </button>
            {/* Sign out */}
            <button
              onClick={async () => {
                await signOut();
                toast.success("Signed out successfully");
              }}
              title="Sign out"
              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
