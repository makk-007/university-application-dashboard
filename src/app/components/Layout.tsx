import { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { PageTransition } from "./PageTransition";
import { CycleSelector } from "./CycleSelector";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/universities", label: "Universities", icon: GraduationCap },
  { path: "/scholarships", label: "Scholarships", icon: DollarSign },
  { path: "/timeline", label: "Timeline", icon: Calendar },
  { path: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  return (
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
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-2 border-sidebar-primary pl-[10px]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-l-2 border-transparent pl-[10px]"
              }`}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Layout() {
  const { user, loading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const initials = user.email ? user.email.slice(0, 2).toUpperCase() : "U";

  const sidebarFooter = (
    <div className="p-3 border-t border-sidebar-border">
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
        <div className="size-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {user.email}
          </p>
        </div>
        <button
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
        >
          {theme === "dark" ? (
            <Sun className="size-4" aria-hidden="true" />
          ) : (
            <Moon className="size-4" aria-hidden="true" />
          )}
        </button>
        <button
          onClick={async () => {
            await signOut();
            toast.success("Signed out successfully");
          }}
          aria-label="Sign out"
          title="Sign out"
          className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
        >
          <LogOut className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border fixed h-full flex-col z-10">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap
                className="size-5 text-primary-foreground"
                aria-hidden="true"
              />
            </div>
            <h1 className="font-semibold text-sm text-sidebar-foreground leading-tight">
              Application Tracker
            </h1>
          </div>
        </div>
        <div className="p-3 border-b border-sidebar-border">
          <CycleSelector />
        </div>
        <nav
          className="flex-1 p-3 overflow-y-auto"
          aria-label="Main navigation"
        >
          <NavLinks />
        </nav>
        {sidebarFooter}
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────────────── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap
              className="size-4 text-primary-foreground"
              aria-hidden="true"
            />
          </div>
          <span className="font-semibold text-sm text-sidebar-foreground">
            App Tracker
          </span>
        </div>
        <div className="flex items-center gap-1">
          <CycleSelector compact />
          <button
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* ── Mobile slide-over ───────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="lg:hidden fixed left-0 top-0 h-full w-72 bg-sidebar border-r border-sidebar-border flex flex-col z-40"
            >
              <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <GraduationCap
                      className="size-5 text-primary-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="font-semibold text-sm text-sidebar-foreground">
                    Application Tracker
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div className="p-3 border-b border-sidebar-border">
                <CycleSelector />
              </div>
              <nav
                className="flex-1 p-3 overflow-y-auto"
                aria-label="Main navigation"
              >
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </nav>
              {sidebarFooter}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ────────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}
