"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatWindow from "./ChatWindow";

interface UsageStatus {
  allowed: boolean;
  usedSeconds: number;
  limitSeconds: number;
  remainingSeconds: number;
}

export default function GojoChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [shake, setShake] = useState(false);
  const [usage, setUsage] = useState<UsageStatus | null>(null);
  const [chatLocked, setChatLocked] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Check lock status whenever chat is opened or authenticated
  useEffect(() => {
    if (!isOpen) return;
    const checkLock = async () => {
      try {
        const res = await fetch("/api/lock-status");
        if (res.ok) {
          const data = await res.json();
          setChatLocked(data.locked === true);
        }
      } catch { /* silent */ }
    };
    checkLock();
    const interval = setInterval(checkLock, 10000); // re-check every 10s
    return () => clearInterval(interval);
  }, [isOpen]);

  // Fetch usage status on mount and when authenticated
  useEffect(() => {
    if (!authenticated) return;
    const fetchUsage = async () => {
      try {
        const res = await fetch("/api/chat");
        if (res.ok) {
          const data = await res.json();
          setUsage(data.usage);
        }
      } catch (err) {
        console.error("Failed to fetch usage:", err);
      }
    };
    fetchUsage();
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, [authenticated]);

  const handlePinSubmit = async () => {
    if (pin.length !== 4) return;

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        setAuthenticated(true);
        setPin("");
        setPinError(false);
      } else {
        setPinError(true);
        setShake(true);
        setPin("");
        setTimeout(() => setShake(false), 500);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setPinError(true);
      setPin("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handlePinSubmit();
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0066ff 0%, #7c4dff 100%)",
          border: "2px solid rgba(255,255,255,0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 40,
          boxShadow: "0 4px 20px rgba(0,102,255,0.4)",
          transition: "all 0.3s ease",
          fontSize: 28,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 30px rgba(0,102,255,0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,102,255,0.4)";
        }}
      >
        😎
      </button>

      {/* Chat Window - Floating Popup */}
      {isOpen && (
        <div
          ref={chatRef}
          style={{
            position: "fixed",
            bottom: 100,
            right: 20,
            width: "min(500px, calc(100vw - 40px))",
            maxHeight: "600px",
            background: "rgba(20,15,50,0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(0,102,255,0.3)",
            borderRadius: 16,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            zIndex: 50,
            boxShadow: "0 8px 32px rgba(0,102,255,0.2)",
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#fff",
              width: 32,
              height: 32,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            ✕
          </button>

          {/* PIN Gate (inside popup) */}
          {!authenticated ? (
            <div
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "center",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <h2
                  style={{
                    fontFamily: "'Zen Dots', cursive",
                    fontSize: 18,
                    color: "#e8e8e8",
                    margin: 0,
                  }}
                >
                  Gojo-sensei 😎
                </h2>
                <p
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 12,
                    color: "#a0a0b0",
                    margin: "8px 0 0",
                  }}
                >
                  Enter secret code to chat
                </p>
              </div>

              {/* PIN Display */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "center",
                  transform: shake ? "translateX(-5px)" : "translateX(0)",
                  transition: "transform 0.3s",
                }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 40,
                      height: 44,
                      borderRadius: 8,
                      border: `2px solid ${pin.length > i ? "#0066ff" : "rgba(255,255,255,0.2)"}`,
                      background: pin.length > i ? "rgba(0,102,255,0.2)" : "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      color: pin.length > i ? "#fff" : "rgba(255,255,255,0.2)",
                      fontFamily: "'Space Mono', monospace",
                      transition: "all 0.2s",
                    }}
                  >
                    {pin.length > i ? "•" : ""}
                  </div>
                ))}
              </div>

              {/* Number Pad */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 6,
                  width: "100%",
                  maxWidth: 180,
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫"].map((num, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (num === null) return;
                      if (num === "⌫") {
                        setPin((p) => p.slice(0, -1));
                      } else if (pin.length < 4) {
                        setPin((p) => p + num);
                      }
                      setPinError(false);
                    }}
                    style={{
                      height: 40,
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: num === null ? "transparent" : "rgba(255,255,255,0.08)",
                      color: "#fff",
                      fontSize: 14,
                      fontFamily: "'Space Mono', monospace",
                      cursor: num === null ? "default" : "pointer",
                      opacity: num === null ? 0 : 1,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (num !== null) {
                        e.currentTarget.style.background = "rgba(0,102,255,0.2)";
                        e.currentTarget.style.borderColor = "rgba(0,102,255,0.4)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (num !== null) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                      }
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Enter Button */}
              <button
                onClick={handlePinSubmit}
                disabled={pin.length !== 4}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: pin.length === 4 ? "linear-gradient(135deg, #0066ff 0%, #7c4dff 100%)" : "rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontSize: 14,
                  fontFamily: "'Space Mono', monospace",
                  cursor: pin.length === 4 ? "pointer" : "default",
                  opacity: pin.length === 4 ? 1 : 0.5,
                  transition: "all 0.2s",
                }}
              >
                Enter 😎
              </button>

              {/* Error Message */}
              {pinError && (
                <p
                  style={{
                    color: "#ff6b6b",
                    fontSize: 12,
                    margin: 0,
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  Wrong code! Try again.
                </p>
              )}

              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                  margin: 0,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                Ask your parents for the code
              </p>
            </div>
          ) : chatLocked ? (
            /* Authenticated but chat is locked by parent */
            <div
              style={{
                padding: "32px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 48, margin: 0 }}>🔒</p>
              <h2
                style={{
                  fontFamily: "'Zen Dots', cursive",
                  fontSize: 18,
                  color: "#f87171",
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                Chat is Locked
              </h2>
              <p
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.6)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Gojo-sensei is taking a break right now! 😎💤
              </p>
              <p
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                  margin: 0,
                }}
              >
                Your parents have locked the chat. Ask them to unlock it when you&apos;re ready to chat again.
              </p>
            </div>
          ) : (
            /* Authenticated and unlocked: Show ChatWindow */
            <ChatWindow />
          )}
        </div>
      )}
    </>
  );
}
