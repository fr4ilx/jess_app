import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, type PanInfo } from "framer-motion";
import { useLocation } from "react-router-dom";
import { PandaLogo } from "@/components/onboarding/PandaLogo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { shouldShowFloatingPanda } from "@/lib/floatingPanda";
import { usePandaPositionStore, type PandaEdge } from "@/store/pandaPosition";

const SIZE = 56;
const EDGE_PADDING = 16;
const TOP_SAFE = 60; // below status bar + screen header
const BOTTOM_SAFE = 96; // above BottomNav (h-16) + safe-area inset

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const xForEdge = (edge: PandaEdge) => {
  if (typeof window === "undefined") return EDGE_PADDING;
  return edge === "left" ? EDGE_PADDING : window.innerWidth - SIZE - EDGE_PADDING;
};

const clampedY = (y: number) => {
  if (typeof window === "undefined") return y;
  return clamp(y, TOP_SAFE, window.innerHeight - SIZE - BOTTOM_SAFE);
};

export function FloatingPanda() {
  const location = useLocation();
  const { y: storedY, edge: storedEdge } = usePandaPositionStore();
  // Initial values used only on first render of the motion value; subsequent
  // renders are ignored by useMotionValue, which is what we want — the motion
  // values are the live source of truth during drag.
  const motionX = useMotionValue(xForEdge(storedEdge));
  const motionY = useMotionValue(storedY);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Clamp + re-snap on mount and every viewport resize. Reads the latest store
  // via getState() so we don't need to re-subscribe when the store changes.
  useEffect(() => {
    const recompute = () => {
      const { y, edge, setPosition } = usePandaPositionStore.getState();
      const newY = clampedY(y);
      motionX.set(xForEdge(edge));
      motionY.set(newY);
      if (newY !== y) setPosition(newY, edge);
    };
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [motionX, motionY]);

  if (!shouldShowFloatingPanda(location.pathname)) return null;

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    _info: PanInfo
  ) => {
    const finalX = motionX.get();
    const finalY = clampedY(motionY.get());
    const center = window.innerWidth / 2;
    const newEdge: PandaEdge = finalX + SIZE / 2 < center ? "left" : "right";
    const snapX = xForEdge(newEdge);
    animate(motionX, snapX, { type: "spring", stiffness: 350, damping: 30 });
    animate(motionY, finalY, { type: "spring", stiffness: 350, damping: 30 });
    usePandaPositionStore.getState().setPosition(finalY, newEdge);
  };

  return (
    <>
      <motion.button
        type="button"
        drag
        dragMomentum={false}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        onTap={() => setSheetOpen(true)}
        onClick={() => setSheetOpen(true)}
        whileTap={{ scale: 0.95 }}
        style={{ x: motionX, y: motionY, position: "fixed", top: 0, left: 0 }}
        className="z-[60] rounded-full shadow-lg cursor-grab active:cursor-grabbing touch-none"
        aria-label="Open Panda chat"
      >
        <PandaLogo size={SIZE} />
      </motion.button>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="text-left">
            <SheetTitle>Hi, I'm Panda 👋</SheetTitle>
            <SheetDescription className="leading-relaxed pt-1">
              Chat is coming soon — ask me anything about food, your meds, or your daily targets.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </>
  );
}
