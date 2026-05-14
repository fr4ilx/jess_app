import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsPending(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back");
      // Placeholder destination — once resolveOnboardingStep lands,
      // we'll route here based on profile state (onboarded → /today, partial → resume).
      navigate("/onboarding/name");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-in failed";
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 pt-16 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col justify-center"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-display text-foreground">Panda AI</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back</p>
        </div>

        <form onSubmit={onSubmit} className="glass-card rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-semibold font-display text-foreground">Sign in</h2>

          <div>
            <label htmlFor="login-email" className="text-xs text-muted-foreground mb-1 block">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="text-xs text-muted-foreground mb-1 block">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || !email || !password}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-5">
          New here?{" "}
          <Link to="/signup" className="text-primary font-medium">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
