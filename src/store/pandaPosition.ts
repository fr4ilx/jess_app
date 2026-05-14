import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PandaEdge = "left" | "right";

type State = {
  y: number;
  edge: PandaEdge;
};

type Actions = {
  setPosition: (y: number, edge: PandaEdge) => void;
};

// Default places the panda above BottomNav on the right side. Computed at import
// time using window.innerHeight when available; falls back to 480 in any
// no-window context.
const defaultY = typeof window !== "undefined" ? window.innerHeight * 0.7 : 480;

export const usePandaPositionStore = create<State & Actions>()(
  persist(
    (set) => ({
      y: defaultY,
      edge: "right",
      setPosition: (y, edge) => set({ y, edge }),
    }),
    { name: "panda-position-v1" }
  )
);
