import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useOnboardingStore } from "@/store/onboarding";
import { toProfilePatch } from "@/lib/onboarding/toProfilePatch";

/**
 * Per-step save hook for onboarding.
 *
 * Returns `{ save, isPending }`:
 * - `save({ final })` writes the current Zustand state to Supabase if (and only
 *   if) the user has a session. In sandbox mode (no session) it's a silent no-op.
 * - `isPending` reflects the underlying mutation state so step Continue buttons
 *   can show a spinner.
 *
 * Callers should `await save()` before navigating so the write completes before
 * the user moves on. Errors are already surfaced as toasts by useUpdateProfile;
 * `save` resolves either way so navigation isn't blocked on a flaky network —
 * the next step's Continue will re-attempt the (idempotent) write.
 */
export function useSaveOnboardingStep() {
  const { user } = useAuth();
  const update = useUpdateProfile();

  const save = async (options: { final?: boolean } = {}): Promise<void> => {
    if (!user) return; // sandbox mode: skip backend
    const state = useOnboardingStore.getState();
    try {
      await update.mutateAsync(toProfilePatch(state, options));
    } catch {
      // useUpdateProfile already shows the error toast.
    }
  };

  return { save, isPending: update.isPending };
}
