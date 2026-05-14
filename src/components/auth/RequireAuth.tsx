import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Guards /onboarding/* and (later) /app/*. While auth state is loading we render
// a spinner — never <Navigate> during loading, which is the most common cause of
// redirect loops.
export function RequireAuth() {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/signup" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
