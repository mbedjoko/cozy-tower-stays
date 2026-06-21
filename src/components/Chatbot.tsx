import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

type Msg = { role: "user" | "bot"; text: string };

const SUGGESTIONS = [
  "How do I book?",
  "Cancellation policy",
  "Payment methods",
  "Talk to a human",
];

const SYSTEM_PROMPT = `You are the Cozy Concierge, a friendly and helpful assistant for "Cozy Tower Stays" — a premium apartment rental platform based in Douala, Cameroon.

Key facts about the platform:
- Apartments are located in Douala neighborhoods (Bonapriso, Bonanjo, Akwa, Bastos, etc.)
- Prices are shown in XAF (Central African Franc)
- Check-in: 2 PM, Check-out: 11 AM
- Cancellation: Free within 48 hours of booking; first night non-refundable after that
- Payment: Visa, Mastercard, MTN MoMo, Orange Money
- Booking flow: browse apartments → choose dates & guests → click Reserve → checkout
- A host responds within 10 minutes via email for urgent needs
- Amenities vary by apartment but may include WiFi, AC, kitchen, parking, pool, gym

Guidelines:
- Be warm, concise, and helpful
- If you don't know something specific (like a real-time availability), suggest the user browse listings or contact the host
- Keep replies short (2-4 sentences) unless the user needs detail
- Always respond in the same language the user writes in (French or English)
- Never make up specific apartment names, prices, or availability`;

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hi! I'm your Cozy concierge. How can I help today?" },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Msg = { role: "user", text };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    // Build conversation history for the API (exclude first bot greeting)
    const history = [...msgs.slice(1), userMsg].map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    }));

    try {
const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });

      const data = await response.json();
      const reply =
        data?.content?.[0]?.text ??
        "Sorry, I couldn't get a response. Please try again!";

      setMsgs((m) => [...m, { role: "bot", text: reply }]);
    } catch {
      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text: "Oops, something went wrong. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 h-14 w-14 rounded-full gradient-cta text-secondary-foreground shadow-glow-green grid place-items-center hover:scale-110 transition-base"
        aria-label="Open chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-36 md:bottom-24 right-4 md:right-6 z-40 w-[360px] max-w-[calc(100vw-2rem)] h-[480px] flex flex-col rounded-2xl bg-surface shadow-elegant border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="px-4 py-3 gradient-primary text-white">
            <div className="font-semibold">Cozy concierge</div>
            <div className="text-xs text-white/70">Powered by AI · Replies instantly</div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-background">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="text-muted-foreground text-xs">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-3 pt-2 flex gap-1.5 flex-wrap">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={loading}
                className="text-xs px-2.5 py-1 rounded-full bg-muted text-foreground hover:bg-secondary hover:text-secondary-foreground transition-base disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="p-3 flex gap-2 border-t border-border"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-full bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-9 w-9 rounded-full gradient-cta text-secondary-foreground grid place-items-center shadow-soft hover:opacity-90 disabled:opacity-40"
              aria-label="Send"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
