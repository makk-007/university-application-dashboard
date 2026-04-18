import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LogOut, User, Shield, Info, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

const inputCls =
  "flex h-9 w-full rounded-md border border-border bg-muted/50 px-3 py-1 text-sm text-muted-foreground cursor-not-allowed";

export function Settings() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-8 py-6">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </header>

      <div className="p-8 max-w-2xl space-y-6">
        {/* Account */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
            <User className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Account</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <input readOnly value={user?.email ?? ""} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                User ID
              </label>
              <input
                readOnly
                value={user?.id ?? ""}
                className={`${inputCls} font-mono text-xs`}
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
            {theme === "dark" ? (
              <Moon className="size-4 text-muted-foreground" />
            ) : (
              <Sun className="size-4 text-muted-foreground" />
            )}
            <h2 className="text-base font-semibold text-foreground">
              Appearance
            </h2>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Dark mode</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {theme === "dark"
                    ? "Dark theme is active"
                    : "Light theme is active"}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                role="switch"
                aria-checked={theme === "dark"}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  theme === "dark" ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    theme === "dark" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
            <Shield className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">
              Security
            </h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-muted-foreground mb-4">
              To change your password, sign out and use the "Forgot Password"
              option on the login page.
            </p>
            <button
              onClick={async () => {
                await signOut();
                toast.success("Signed out successfully");
              }}
              className="inline-flex items-center gap-2 px-4 h-9 border border-destructive text-destructive text-sm font-medium rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* About */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
            <Info className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">About</h2>
          </div>
          <div className="px-6 py-5 space-y-2">
            {[
              ["Application", "Masters Application Tracker"],
              ["Version", "2.0.0"],
              ["Backend", "Supabase (PostgreSQL + Auth)"],
              ["Frontend", "React + TypeScript + Tailwind CSS"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between items-center py-1"
              >
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-foreground">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
