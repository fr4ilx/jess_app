import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, type PanInfo } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Loader2, Send } from "lucide-react";
import { PandaLogo } from "@/components/onboarding/PandaLogo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { shouldShowFloatingPanda } from "@/lib/floatingPanda";
import { usePandaPositionStore, type PandaEdge } from "@/store/pandaPosition";
import { supabase } from "@/integrations/supabase/client";

type ChatMessage = { role: "user" | "assistant"; content: string };

const INITIAL_GREETING: ChatMessage = {
  role: "assistant",
  content: "Hi, I'm Panda 👋 Ask me anything about food, macros, or your daily goals.",
};

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
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, pending, sheetOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || pending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setPending(true);
    try {
      const { data, error } = await supabase.functions.invoke("panda-chat", {
        body: { messages: next.filter((m) => m !== INITIAL_GREETING) },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const reply: string = data?.reply ?? "";
      setMessages((prev) => [...prev, { role: "assistant", content: reply || "Hmm, I didn't catch that — try again?" }]);
    } catch (err) {
      console.error("panda-chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry — I'm having trouble right now. Try again in a moment." },
      ]);
    } finally {
      setPending(false);
    }
  };

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
        <SheetContent side="bottom" className="rounded-t-2xl flex flex-col gap-3 h-[75vh] max-h-[640px]">
          <SheetHeader className="text-left">
            <SheetTitle>Panda 🐼</SheetTitle>
          </SheetHeader>

          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pr-1">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                    : "mr-auto bg-secondary text-secondary-foreground rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            ))}
            {pending && (
              <div className="mr-auto bg-secondary text-secondary-foreground rounded-2xl rounded-bl-sm px-3 py-2 text-sm flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="opacity-70">Panda is thinking…</span>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Panda something…"
              disabled={pending}
              className="flex-1 rounded-full bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
