"use client";

import { useState } from "react";
import PinGate from "./components/PinGate";
import ChatWindow from "./components/ChatWindow";

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <PinGate onUnlock={() => setAuthenticated(true)} />;
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1060 0%, #2a1a80 25%, #3520a0 50%, #2a1a80 75%, #1a1060 100%)",
      backgroundSize: "300% 300%",
      animation: "gradientShift 12s ease-in-out infinite",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes particleRise {
          0% { transform: translateY(110vh) translateX(0) rotate(0deg); opacity: 1; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-20px) translateX(var(--drift, 30px)) rotate(var(--rot-end, 360deg)); opacity: 0; }
        }
      `}</style>

      {/* Ambient particles */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {Array.from({ length: 16 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              bottom: "-20px",
              width: 6 + Math.random() * 10,
              height: 6 + Math.random() * 10,
              borderRadius: "50%",
              background: "#ff6b6b",
              boxShadow: "0 0 6px #ff6b6b",
              opacity: 0.55,
              animation: `particleRise ${7 + Math.random() * 11}s linear ${-(Math.random() * 18)}s infinite`,
              "--drift": `${-25 + Math.random() * 50}px`,
              "--rot-end": `${Math.random() * 360}deg`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Hero section */}
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{
            fontFamily: "'Zen Dots', cursive",
            fontSize: "clamp(32px, 8vw, 72px)",
            color: "#e8e8e8",
            textTransform: "uppercase",
            letterSpacing: "clamp(4px, 1vw, 12px)",
            lineHeight: 1.2,
            textShadow: "0 0 20px rgba(124,77,255,0.4)",
            margin: 0,
          }}>
            MAX
          </h1>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "clamp(10px, 1.5vw, 14px)",
            color: "#a0a0b0",
            textTransform: "uppercase",
            letterSpacing: 4,
            marginTop: 12,
          }}>
            THE ANIME SOUL EXPERIENCE
          </p>
        </div>

        {/* Tagline */}
        <div style={{ marginBottom: 40, padding: "0 16px", maxWidth: 800 }}>
          <h2 style={{
            fontFamily: "'Zen Dots', cursive",
            fontSize: "clamp(14px, 2.8vw, 24px)",
            color: "#e8e8e8",
            textTransform: "uppercase",
            letterSpacing: "clamp(2px, 0.5vw, 6px)",
            lineHeight: 1.6,
            textShadow: "0 0 10px rgba(101,31,255,0.4)",
            textAlign: "center",
          }}>
            THE POWER OF THE THREE GREATS AWAKENS THE LEGENDS
          </h2>
        </div>

        {/* Welcome message */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "28px 32px",
          maxWidth: 600,
          margin: "0 auto 40px",
          textAlign: "center",
        }}>
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(14px, 2vw, 16px)",
            color: "#c0c0c8",
            lineHeight: 1.7,
          }}>
            Hi my name is Max, welcome to my website! Chat with Gojo-sensei below to learn about anime and manga. Thank you!
          </p>
        </div>

        {/* Parent dashboard link */}
        <a
          href="/parent"
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            color: "#7c4dff",
            textTransform: "uppercase",
            letterSpacing: 2,
            padding: "8px 16px",
            border: "1px solid rgba(124,77,255,0.3)",
            borderRadius: 8,
            background: "rgba(124,77,255,0.08)",
            transition: "all 0.3s",
            display: "inline-block",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(124,77,255,0.15)";
            e.currentTarget.style.borderColor = "rgba(124,77,255,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(124,77,255,0.08)";
            e.currentTarget.style.borderColor = "rgba(124,77,255,0.3)";
          }}
        >
          🔒 Parent Dashboard
        </a>
      </div>

      {/* Chat window - floating bottom right */}
      <ChatWindow />
    </main>
  );
}
