import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type Msg = { role: "user" | "bot"; text: string };

const SUGGESTIONS = [
  "How do I book?",
  "Cancellation policy",
  "Payment methods",
  "Power & water?",
  "Getting here from the airport",
  "Talk to a human",
];

const BOT_REPLIES: Record<string, string> = {
  "How do I book?": "Pick a room package, choose your dates and guests, then click 'Reserve'. You'll be guided through a quick checkout — everything happens in this same building, so what you see is what you get.",
  "Cancellation policy": "Free cancellation within 48 hours of booking. After that, the first night is non-refundable.",
  "Payment methods": "We accept Visa, Mastercard, and Mobile Money (MTN MoMo, Orange Money) — no card required.",
  "Power & water?": "Every room has backup power for outages and a water reserve, so a SONEL cut or a dry spell won't interrupt your stay.",
  "Getting here from the airport": "About 25–35 minutes from Douala International Airport depending on traffic. Tell us your flight time and we'll arrange a pickup.",
  "Talk to a human": "The concierge on site will reach you within 10 minutes via the email you used to sign up — it's the same person who'll hand you your keys.",
};

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hi! I'm your Cozy concierge. How can I help today?" },
  ]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const reply = BOT_REPLIES[text] ?? "Thanks! A team member will follow up shortly. In the meantime, browse our apartments.";
    setMsgs((m) => [...m, { role: "user", text }, { role: "bot", text: reply }]);
    setInput("");
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
          <div className="px-4 py-3 gradient-primary text-white">
            <div className="font-semibold">Cozy concierge</div>
            <div className="text-xs text-white/70">Typically replies in seconds</div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-background">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
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
          </div>

          <div className="px-3 pt-2 flex gap-1.5 flex-wrap">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-2.5 py-1 rounded-full bg-muted text-foreground hover:bg-secondary hover:text-secondary-foreground transition-base"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="p-3 flex gap-2 border-t border-border"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 px-4 py-2 rounded-full bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className="h-9 w-9 rounded-full gradient-cta text-secondary-foreground grid place-items-center shadow-soft hover:opacity-90"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
