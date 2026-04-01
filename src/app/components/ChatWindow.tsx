"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UsageStatus {
  allowed: boolean;
  usedSeconds: number;
  limitSeconds: number;
  remainingSeconds: number;
}

const GOJO_GREETING = `Yooo Max! Gojo-sensei here 😎 The strongest sorcerer alive — and now your personal anime expert. Your parents can see our chats by the way, so no secrets — that's how the strongest roll.\n\nSo! What anime are we talking about today?`;

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", role: "assistant", content: GOJO_GREETING, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [usage, setUsage] = useState<UsageStatus | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setUsage(data.usage);
        if (!data.usage.allowed) setLimitReached(true);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  useEffect(() => {
    if (!usage || limitReached) return;
    const interval = setInterval(() => {
      setUsage((prev) => {
        if (!prev) return prev;
        const newRemaining = Math.max(0, prev.remainingSeconds - 1);
        if (newRemaining === 0) setLimitReached(true);
        if (newRemaining === 5 * 60) setShowBreakReminder(true);
        return { ...prev, remainingSeconds: newRemaining };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [usage, limitReached]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || limitReached) return;
    const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content: trimmed, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (data.usage) {
        setUsage(data.usage);
        if (data.limitReached || !data.usage.allowed) setLimitReached(true);
      }
      setMessages((prev) => [...prev, {
        id: `assistant-${Date.now()}`, role: "assistant",
        content: data.response || "Hmm, my Six Eyes glitched. Try again!", timestamp: new Date(),
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: `error-${Date.now()}`, role: "assistant",
        content: "Whoa, something went wrong on my end 😅 Try again!", timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (!usage) return "#ffffff80";
    if (usage.remainingSeconds <= 60) return "#f87171";
    if (usage.remainingSeconds <= 5 * 60) return "#fbbf24";
    return "#ffffff80";
  };

  return (
    <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0066ff, #7c4dff)", borderRadius: "16px 16px 0 0",
        padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
        boxShadow: "0 0 20px rgba(0,102,255,0.3)",
      }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
          <img src="/gojo-avatar.svg" alt="Gojo" width={44} height={44} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Zen Dots',cursive", fontSize: 15, margin: 0, color: "#fff" }}>Gojo-sensei</h1>
          <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.7)", margin: 0 }}>The Strongest Sorcerer • Online</p>
        </div>
        {usage && (
          <div style={{ textAlign: "right" }}>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: getTimerColor(), margin: 0 }}>⏱️ {formatTime(usage.remainingSeconds)}</p>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", margin: 0 }}>remaining today</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", background: "rgba(10,10,46,0.8)", padding: "14px",
        display: "flex", flexDirection: "column", gap: 10, minHeight: 200,
      }}>
        {messages.map((msg) => {
          const isGojo = msg.role === "assistant";
          return (
            <div key={msg.id} style={{ display: "flex", gap: 8, flexDirection: isGojo ? "row" : "row-reverse", alignItems: "flex-end" }}>
              {isGojo && (
                <div style={{ width: 30, height: 30, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                  <img src="/gojo-avatar.svg" alt="Gojo" width={30} height={30} />
                </div>
              )}
              <div style={{
                maxWidth: "78%", padding: "10px 14px",
                borderRadius: isGojo ? "14px 14px 14px 4px" : "14px 14px 4px 14px",
                background: isGojo ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #0066ff, #7c4dff)",
                border: isGojo ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,102,255,0.3)",
                fontFamily: "'Outfit',sans-serif", fontSize: 13, lineHeight: 1.6,
                color: isGojo ? "#d0d0d8" : "#f0f0f0", whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {msg.content.split("\n").map((line, i) => (
                  <p key={i} style={{ margin: i > 0 ? "8px 0 0 0" : 0 }}>{line}</p>
                ))}
                <p style={{ fontSize: 9, color: isGojo ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.5)", marginTop: 4, marginBottom: 0 }}>
                  {msg.timestamp.toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {!isGojo && (
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(124,77,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>⭐</div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
              <img src="/gojo-avatar.svg" alt="Gojo" width={30} height={30} />
            </div>
            <div style={{ padding: "10px 18px", borderRadius: "14px 14px 14px 4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 5 }}>
              {[0, 1, 2].map((d) => (
                <div key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: "#0066ff", animation: `typingDot 1.4s ease-in-out ${d * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Daily Limit Banner */}
      {limitReached && (
        <div style={{ background: "rgba(10,10,46,0.9)", borderTop: "1px solid rgba(0,102,255,0.2)", padding: "24px", textAlign: "center" }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>⏰</p>
          <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 600, color: "#fff", marginBottom: 4 }}>Time&apos;s up for today!</p>
          <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Come back tomorrow for more anime talk!</p>
          <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>Even Gojo-sensei rests between battles 😎💤</p>
        </div>
      )}

      {/* Input */}
      {!limitReached && (
        <div style={{ background: "rgba(10,10,46,0.9)", borderRadius: "0 0 16px 16px", padding: 12, display: "flex", gap: 8 }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Talk to Gojo-sensei..."
            maxLength={500}
            disabled={isLoading}
            style={{
              flex: 1, background: "rgba(255,255,255,0.1)", color: "#e8e8e8", border: "1px solid rgba(0,102,255,0.2)",
              borderRadius: 12, padding: "10px 14px", fontFamily: "'Outfit',sans-serif", fontSize: 13, outline: "none",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            style={{
              background: input.trim() && !isLoading ? "linear-gradient(135deg, #0066ff, #7c4dff)" : "rgba(255,255,255,0.05)",
              color: "#fff", border: "none", borderRadius: 12, padding: "10px 20px",
              fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 13, cursor: input.trim() && !isLoading ? "pointer" : "default",
              opacity: input.trim() && !isLoading ? 1 : 0.3,
            }}
          >
            Send
          </button>
        </div>
      )}

      {/* Break Reminder */}
      {showBreakReminder && !limitReached && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100050, padding: 16,
        }}>
          <div style={{
            background: "#0a0a2e", border: "1px solid rgba(0,102,255,0.3)", borderRadius: 16,
            padding: 24, maxWidth: 360, textAlign: "center",
          }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>⏰</p>
            <h2 style={{ fontFamily: "'Zen Dots',cursive", fontSize: 18, color: "#0066ff", marginBottom: 12 }}>Break Time, Max!</h2>
            <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: 8 }}>
              You&apos;ve been chatting for a while — even Gojo-sensei takes breaks between training sessions! 😎
            </p>
            <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 16 }}>
              Stand up, stretch, grab a drink. I&apos;ll still be here!
            </p>
            <button
              onClick={() => setShowBreakReminder(false)}
              style={{
                background: "linear-gradient(135deg, #0066ff, #7c4dff)", color: "#fff", border: "none",
                borderRadius: 12, padding: "12px 24px", fontFamily: "'Outfit',sans-serif", fontWeight: 600,
                fontSize: 14, cursor: "pointer", width: "100%",
              }}
            >
              Got it, taking a break! 💪
            </button>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 12 }}>
              Your parents can see how long you chat 👀
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
