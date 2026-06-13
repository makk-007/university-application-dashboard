import { useState } from "react";
import { useNavigate } from "react-router";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Sun,
  Moon,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { inputCls } from "../components/ui/input-classes";
import { supabase } from "../lib/supabase";

type Mode = "login" | "signup" | "forgot";

function getStrength(pw: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak", color: "bg-destructive" };
  if (score <= 3) return { score, label: "Fair", color: "bg-orange-500" };
  return { score, label: "Strong", color: "bg-green-500" };
}

export function Auth({
  defaultMode = "login",
}: {
  defaultMode?: "login" | "signup" | "forgot";
}) {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const strength = mode === "signup" ? getStrength(password) : null;
  const passwordMismatch =
    mode === "signup" &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setSuccess(null);
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === "forgot") {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Password reset email sent. Check your inbox.");
      }
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

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
        switchMode("login");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <button
        onClick={toggleTheme}
        aria-label={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        title={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        className="fixed top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        {theme === "dark" ? (
          <Sun className="size-5" aria-hidden="true" />
        ) : (
          <Moon className="size-5" aria-hidden="true" />
        )}
      </button>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4">
            <GraduationCap
              className="size-6 text-primary-foreground"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Masters Application Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your applications in one place
          </p>
        </div>

        <div className="bg-card rounded-xl border shadow-sm p-6">
          {mode === "forgot" && (
            <button
              onClick={() => switchMode("login")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Back to sign in
            </button>
          )}

          <h2 className="text-lg font-semibold text-card-foreground mb-5">
            {mode === "login"
              ? "Sign in to your account"
              : mode === "signup"
                ? "Create an account"
                : "Reset your password"}
          </h2>

          {error && (
            <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 mb-5">
              <AlertCircle
                className="size-4 text-destructive mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2.5 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 mb-5">
              <CheckCircle2
                className="size-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <p className="text-sm text-green-700 dark:text-green-300">
                {success}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  aria-hidden="true"
                />
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

            {/* Password - hidden on forgot mode */}
            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    Password
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-xs text-primary hover:underline underline-offset-4"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {/* Strength meter - signup only */}
                {mode === "signup" && password.length > 0 && strength && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${i < strength.score ? strength.color : "bg-muted"}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Strength:{" "}
                      <span
                        className={
                          strength.score >= 4
                            ? "text-green-600 dark:text-green-400"
                            : strength.score >= 2
                              ? "text-orange-600"
                              : "text-destructive"
                        }
                      >
                        {strength.label}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Confirm password - signup only */}
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputCls} pl-9 pr-9 ${passwordMismatch ? "border-destructive focus-visible:border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {passwordMismatch && (
                  <p className="text-xs text-destructive mt-1">
                    Passwords do not match
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || passwordMismatch}
              className="w-full h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors mt-2"
            >
              {loading
                ? mode === "login"
                  ? "Signing in..."
                  : mode === "signup"
                    ? "Creating account..."
                    : "Sending..."
                : mode === "login"
                  ? "Sign in"
                  : mode === "signup"
                    ? "Create account"
                    : "Send reset email"}
            </button>
          </form>

          {mode !== "forgot" && (
            <p className="text-center text-sm text-muted-foreground mt-5">
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                onClick={() =>
                  switchMode(mode === "login" ? "signup" : "login")
                }
                className="text-primary font-medium hover:underline underline-offset-4"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
