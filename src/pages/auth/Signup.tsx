import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsPending(true);
    try {
      await signUp(email, password);
      toast.success("Account created");
      navigate("/onboarding/name");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-up failed";
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
          <p className="text-sm text-muted-foreground mt-1">Personalized cardiometabolic nutrition</p>
        </div>

        <form onSubmit={onSubmit} className="glass-card rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-semibold font-display text-foreground">Create your account</h2>

          <div>
            <label htmlFor="signup-email" className="text-xs text-muted-foreground mb-1 block">
              Email
            </label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className="text-xs text-muted-foreground mb-1 block">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
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
                Create account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
