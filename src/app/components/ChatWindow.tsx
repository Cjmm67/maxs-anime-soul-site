"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatBubble from "./ChatBubble";
import BreakReminder from "./BreakReminder";

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
    {
      id: "greeting",
      role: "assistant",
      content: GOJO_GREETING,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [usage, setUsage] = useState<UsageStatus | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch usage status on mount
  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setUsage(data.usage);
        if (!data.usage.allowed) {
          setLimitReached(true);
        }
      }
    } catch {
      // Silently fail — timer just won't show
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  // Countdown timer — ticks every second when we have usage data
  useEffect(() => {
    if (!usage || limitReached) return;

    const interval = setInterval(() => {
      setUsage((prev) => {
        if (!prev) return prev;
        const newRemaining = Math.max(0, prev.remainingSeconds - 1);
        if (newRemaining === 0) {
          setLimitReached(true);
        }
        // Show break reminder at 5 minutes remaining
        if (newRemaining === 5 * 60) {
          setShowBreakReminder(true);
        }
        return { ...prev, remainingSeconds: newRemaining };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [usage, limitReached]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || limitReached) return;

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
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

      // Update usage from response
      if (data.usage) {
        setUsage(data.usage);
        if (data.limitReached || !data.usage.allowed) {
          setLimitReached(true);
        }
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response || "Hmm, my Six Eyes glitched. Try again!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Whoa, something went wrong on my end 😅 Try again!",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format seconds as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Timer colour based on remaining time
  const getTimerColor = () => {
    if (!usage) return "text-white/50";
    if (usage.remainingSeconds <= 60) return "text-red-400 animate-pulse";
    if (usage.remainingSeconds <= 5 * 60) return "text-yellow-400";
    return "text-white/50";
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col h-[90vh] relative">
      {/* Header */}
      <div className="gojo-glow bg-gradient-to-r from-gojo-blue to-gojo-purple rounded-t-2xl p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img src="/gojo-avatar.svg" alt="Gojo" width={48} height={48} />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Gojo-sensei</h1>
          <p className="text-xs text-white/70">The Strongest Sorcerer • Online</p>
        </div>
        {/* Usage Timer */}
        {usage && (
          <div className={`text-right ${getTimerColor()}`}>
            <p className="text-xs font-mono">⏱️ {formatTime(usage.remainingSeconds)}</p>
            <p className="text-[10px] text-white/30">remaining today</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gojo-dark/80 backdrop-blur-sm p-4 space-y-3">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 chat-bubble">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img src="/gojo-avatar.svg" alt="Gojo" width={32} height={32} />
            </div>
            <div className="bg-white/10 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              <span className="typing-dot w-2 h-2 bg-gojo-blue rounded-full inline-block" />
              <span className="typing-dot w-2 h-2 bg-gojo-blue rounded-full inline-block" />
              <span className="typing-dot w-2 h-2 bg-gojo-blue rounded-full inline-block" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Daily Limit Reached Banner */}
      {limitReached && (
        <div className="bg-gojo-dark/90 border-t border-gojo-blue/20 p-6 text-center space-y-2">
          <p className="text-2xl">⏰</p>
          <p className="text-white font-semibold">Time&apos;s up for today!</p>
          <p className="text-white/50 text-sm">
            You&apos;ve used your 15 minutes — come back tomorrow!
          </p>
          <p className="text-white/30 text-xs">
            Even Gojo-sensei rests between battles 😎💤
          </p>
        </div>
      )}

      {/* Input — hidden when limit reached */}
      {!limitReached && (
        <div className="bg-gojo-dark/90 backdrop-blur-sm rounded-b-2xl p-3 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Talk to Gojo-sensei..."
            maxLength={500}
            disabled={isLoading}
            className="flex-1 bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gojo-blue/50 transition-all disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-gojo-blue to-gojo-purple text-white px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      )}

      {/* Break Reminder Modal */}
      {showBreakReminder && !limitReached && (
        <BreakReminder onDismiss={() => setShowBreakReminder(false)} />
      )}
    </div>
  );
}
