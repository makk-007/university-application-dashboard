import { useState } from "react";
import { useNavigate } from "react-router";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

type Mode = "login" | "signup";

const inputCls =
  "flex h-9 w-full rounded-md border border-border bg-input-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow]";

export function Auth() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
        toast.error("Sign in failed", { description: error.message });
      } else {
        toast.success("Welcome back!");
        navigate("/");
      }
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message);
        toast.error("Sign up failed", { description: error.message });
      } else {
        toast.success("Account created!", {
          description: "Check your email to confirm your account.",
        });
        setSuccess(
          "Account created! Check your email to confirm, then log in.",
        );
        setMode("login");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4">
            <GraduationCap className="size-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Masters Application Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your applications in one place
          </p>
        </div>

        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-5">
            {mode === "login" ? "Sign in to your account" : "Create an account"}
          </h2>

          {error && (
            <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 mb-5">
              <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputCls} pl-9 pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 6 characters
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors mt-2"
            >
              {loading
                ? mode === "login"
                  ? "Signing in…"
                  : "Creating account…"
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
                setSuccess(null);
              }}
              className="text-primary font-medium hover:underline underline-offset-4"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
