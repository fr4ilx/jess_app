import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { PandaLogo } from "@/components/onboarding/PandaLogo";
import { supabase } from "@/integrations/supabase/client";

type ChatMessage = { role: "user" | "assistant"; content: string };

const INITIAL_GREETING: ChatMessage = {
  role: "assistant",
  content: "Hi, I'm Panda 👋 Ask me anything about food, macros, or your daily goals.",
};

export default function Coach() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, pending]);

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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply || "Hmm, I didn't catch that — try again?" },
      ]);
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

  return (
    <div className="flex min-h-screen flex-col bottom-nav-safe">
      <header className="flex items-center gap-3 px-5 pt-12 pb-4">
        <PandaLogo size={44} />
        <div>
          <h1 className="text-xl font-bold leading-tight text-foreground">Coach</h1>
          <p className="text-xs text-muted-foreground">Your GLP-1 nutrition guide</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-5 pb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                : "mr-auto bg-white/80 text-foreground rounded-bl-sm backdrop-blur"
            }`}
          >
            {m.content}
          </div>
        ))}
        {pending && (
          <div className="mr-auto flex items-center gap-2 rounded-2xl rounded-bl-sm bg-white/80 px-3.5 py-2.5 text-sm backdrop-blur">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="opacity-70">Panda is thinking…</span>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="sticky bottom-0 flex items-center gap-2 bg-gradient-to-t from-background via-background/95 to-transparent px-5 pb-6 pt-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Panda something…"
          disabled={pending}
          className="flex-1 rounded-full bg-white/90 px-4 py-3 text-sm text-foreground outline-none ring-1 ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
