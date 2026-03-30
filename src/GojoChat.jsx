import { useState, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   GOJO CHATBOT — "Nah, I'd Win" Edition
   A floating chat widget with Gojo Satoru's personality.
   Pure client-side — no API keys, no backend needed.
   ═══════════════════════════════════════════════════════════════ */

// ─── Gojo's Brain (pattern-matched responses) ───────────────
const GOJO_RESPONSES = [
  // Greetings
  { patterns: [/^(hi|hey|hello|yo|sup|what'?s up|howdy|hola)/i],
    replies: [
      "Yo! The strongest sorcerer just entered the chat. 😎",
      "Hey there~ You must have good taste to summon me.",
      "Ah, a visitor! Don't worry, I won't use Hollow Purple on you... probably.",
      "Welcome to my Domain — the chat version. Much less deadly, I promise~",
    ]},
  // Who are you
  { patterns: [/who (are|r) (you|u)/i, /what'?s your name/i, /introduce yourself/i],
    replies: [
      "I'm Gojo Satoru — the strongest jujutsu sorcerer alive. But you already knew that, right? 😎",
      "Throughout the heavens and earth, I alone am the honoured one~ That's me!",
      "The name's Gojo. Teacher, sorcerer, and undeniably the coolest person you'll ever chat with.",
    ]},
  // About his power / infinity / six eyes
  { patterns: [/infinit(y|e)/i, /six eyes/i, /your (power|ability|technique)/i, /how strong/i, /strongest/i],
    replies: [
      "Infinity means nothing can touch me~ It's the convergence of an infinite series right at my body. Pretty neat, huh?",
      "The Six Eyes let me see cursed energy at an atomic level AND use my techniques with basically zero energy cost. Broken? Maybe. Do I care? Nah~ 😎",
      "Let's just say... on a scale of 1 to 10, I broke the scale. Then used the broken pieces as confetti.",
      "Strong enough that they had to seal me away because they couldn't beat me. That says everything, doesn't it?",
    ]},
  // Hollow Purple / Domain Expansion
  { patterns: [/hollow purple/i, /domain expansion/i, /unlimited void/i, /purple/i],
    replies: [
      "Hollow Purple — the merging of Blue and Red into the ultimate destructive force. It erases everything in its path~ ✨",
      "Domain Expansion: Unlimited Void. Once you're in, your mind gets flooded with infinite information. Game over~ 🔮",
      "You want me to demonstrate? ...Maybe let's not. This is Max's website and I'd rather not delete it. 😅",
    ]},
  // About Max
  { patterns: [/who(( i)?s|'s) max/i, /tell me about max/i, /max/i],
    replies: [
      "Max? That kid's creativity is off the charts. Built this entire website! Even I'm impressed, and I don't impress easily~",
      "Max is The Creative Legend — age 11 and already building things most adults can't. Future strongest creator, I'd say! 🌟",
      "Ah, Max! The third member of our legendary trio. His superpower? Pure imagination and unstoppable energy!",
    ]},
  // About Tanjiro
  { patterns: [/tanjiro/i, /demon slayer/i, /kamado/i, /water breathing/i],
    replies: [
      "Tanjiro? Good kid. Heart of gold. His Water Breathing is elegant — not as flashy as Infinity, but I respect the grind~",
      "The Demon Slayer boy! His determination is his real power. Even I'd think twice before making him angry.",
      "Tanjiro Kamado — proof that kindness can be the strongest weapon. Don't tell him I said that though. 😏",
    ]},
  // About Naruto
  { patterns: [/naruto/i, /hokage/i, /ninja/i, /uzumaki/i, /rasengan/i],
    replies: [
      "Naruto? Talk-no-jutsu champion of the world. Even I'd have trouble arguing with that kid's speeches~",
      "The guy who befriended a giant fox demon through sheer stubbornness. Respect. 🦊",
      "Different universe, but I'd love a sparring match. Infinite Void vs. Talk-no-Jutsu — who wins? ...Nah, I'd win.",
    ]},
  // Nah I'd win
  { patterns: [/nah,? i'?d win/i, /would you win/i, /can you (beat|win|defeat)/i, /fight/i, /vs\.?/i, /versus/i, /who would win/i, /battle/i],
    replies: [
      "Nah, I'd win. 😎",
      "Was that even a question? I'd win before breakfast~",
      "The outcome was decided the moment you asked. Nah, I'd win.",
      "I appreciate the hypothetical, but we both know how this ends~ 😎✌️",
    ]},
  // Anime recommendations
  { patterns: [/recommend/i, /watch (what|which)/i, /what (should|anime)/i, /suggest/i, /favourite anime/i, /best anime/i],
    replies: [
      "Obviously Jujutsu Kaisen — but I might be biased since I steal every scene I'm in~ 😎\nAlso: Demon Slayer, Naruto, One Piece, Hunter x Hunter, and Spy x Family!",
      "Start with JJK (for me), then Demon Slayer (for the animation), then One Piece (for the adventure). You're welcome~",
      "My top picks: Jujutsu Kaisen, Demon Slayer, My Hero Academia, and Attack on Titan. Each one hits different!",
    ]},
  // Manga
  { patterns: [/manga/i, /read/i, /chapter/i],
    replies: [
      "Manga reader? Cultured! The Jujutsu Kaisen manga goes HARD. And the Demon Slayer art is *chef's kiss* 🎨",
      "Reading manga is peak culture. Check out One Piece if you want 1000+ chapters of pure adventure!",
    ]},
  // Secret codes / easter eggs
  { patterns: [/secret/i, /code/i, /easter egg/i, /hidden/i, /unlock/i, /cheat/i],
    replies: [
      "Ooh, looking for secrets? Try typing some special codes on the main site... I won't tell you what they are though. A sorcerer never reveals his tricks~ 🤫",
      "There might be some hidden powers on this site... Try thinking about what the three legends are known for~ 😉",
      "Secrets? On THIS site? ...Maybe. Try the secret code input on the main page. That's all I'll say~ 🔮",
    ]},
  // Compliments
  { patterns: [/you('re| are) (cool|awesome|great|amazing|the best)/i, /i (love|like) you/i, /you rock/i],
    replies: [
      "I know~ 😎✨ But thanks for saying it anyway!",
      "Finally, someone who gets it! You have excellent judgment~",
      "Stop, you're making me blush~ ...Just kidding, I'm always this confident. But thank you! 💙",
    ]},
  // How are you
  { patterns: [/how (are|r) (you|u)/i, /how'?s it going/i, /what'?s good/i],
    replies: [
      "I'm doing great~ Being the strongest is exhausting, but someone's gotta do it. 😎",
      "Living my best life as a chatbot on Max's legendary website. Can't complain~",
      "Fantastic! Just finished teaching my students... by which I mean roasting them lovingly. 💙",
    ]},
  // Goodbye
  { patterns: [/bye/i, /goodbye/i, /see (you|ya)/i, /later/i, /gotta go/i, /leaving/i],
    replies: [
      "Later~ Remember: throughout the heavens and earth, I alone am the honoured one. Don't forget it! 😎✌️",
      "See ya! Don't miss me too much~ ...Who am I kidding, of course you will.",
      "Bye for now! Come back anytime — my Domain is always open for cool people like you~ ✨",
    ]},
  // Funny / jokes
  { patterns: [/joke/i, /funny/i, /make me laugh/i, /tell me something/i],
    replies: [
      "Why did the cursed spirit cross the road? Because I was on the other side, and it wanted to get exorcised in style~ 😎",
      "My students asked me to be serious for once. I tried. I lasted 3 seconds. New personal record!",
      "What's the difference between me and other sorcerers? About 10 power levels~ 😂",
    ]},
  // School / teaching
  { patterns: [/teach/i, /school/i, /student/i, /learn/i, /jujutsu (high|tech)/i, /sensei/i],
    replies: [
      "I'm actually a teacher at Jujutsu High! Yuji, Megumi, Nobara — they're my precious students. Even if I show it in... unconventional ways~",
      "Teaching is my real passion. The fighting is just a side hobby. ...Okay, the fighting is also a passion. 😅",
      "Want to learn jujutsu? Step 1: Believe in yourself. Step 2: Don't die. Step 3: Profit. That's basically my curriculum~",
    ]},
  // The website
  { patterns: [/this (site|website)/i, /the site/i, /cool (site|website)/i, /who (made|built|created)/i],
    replies: [
      "This website? Built by Max — The Creative Legend! Age 11 and already creating things that blow minds. The kid's got talent! 🌟",
      "Pretty sick website, right? Max coded the whole thing. React, Vite, SVG art, animations — the works!",
      "Max built this entire site with React and pure CSS animations. No animation libraries needed when you have raw talent~ ✨",
    ]},
];

// Fallback responses when no pattern matches
const FALLBACK_REPLIES = [
  "Hmm, interesting! I'm not sure what to say to that, but I'd still win. 😎",
  "That's beyond even my Six Eyes' comprehension~ Try asking me about anime, powers, or Max!",
  "I'd answer that, but my Infinity is blocking the response~ Try asking something else!",
  "Even the strongest sorcerer needs a moment to think about that one... Ask me about JJK, the legends, or anime!",
  "My brain is processing that at infinite speed... and I still got nothing. But I look cool doing it~ 😎",
  "*adjusts blindfold* ...Nah, I got nothing for that one. Ask me about powers, anime, or the legends!",
];

// Typing delay simulation (ms)
const TYPING_DELAY_MIN = 600;
const TYPING_DELAY_MAX = 1500;

function getGojoResponse(input) {
  const trimmed = input.trim();
  if (!trimmed) return "...You just sent me nothing? Even Hollow Purple has more substance than that~ 😎";

  for (const { patterns, replies } of GOJO_RESPONSES) {
    for (const pat of patterns) {
      if (pat.test(trimmed)) {
        return replies[Math.floor(Math.random() * replies.length)];
      }
    }
  }
  return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
}

// ─── Mini Gojo SVG for the chat bubble ──────────────────────
const GojoAvatar = ({ size = 40 }) => (
  <svg viewBox="0 0 120 120" width={size} height={size} style={{ borderRadius: "50%", flexShrink: 0 }}>
    <rect width="120" height="120" rx="60" fill="#0a0a2e" />
    {/* Hair */}
    <ellipse cx="60" cy="38" rx="28" ry="14" fill="#e8e8f0" />
    <path d="M34 42 Q38 18 60 24 Q82 18 86 42" fill="#e8e8f0" />
    <path d="M42 22 L45 12 L52 24" fill="#d8d8e8" />
    <path d="M68 24 L75 12 L78 22" fill="#d8d8e8" />
    {/* Face */}
    <ellipse cx="60" cy="52" rx="22" ry="24" fill="#fce4c8" />
    {/* Blindfold */}
    <rect x="36" y="45" width="48" height="10" rx="5" fill="#1a1a2e" />
    <rect x="36" y="45" width="48" height="10" rx="5" fill="none" stroke="#0066ff" strokeWidth="1" opacity="0.6" />
    {/* Smirk */}
    <path d="M48 65 Q60 72 72 65" fill="none" stroke="#c8a090" strokeWidth="1.5" strokeLinecap="round" />
    {/* Glow */}
    <circle cx="60" cy="50" r="55" fill="none" stroke="#0066ff" strokeWidth="0.5" opacity="0.3" />
  </svg>
);

// ─── The Chat Component ─────────────────────────────────────
export default function GojoChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "gojo", text: "Yo! I'm Gojo Satoru — the strongest sorcerer and Max's personal chatbot~ Ask me anything! 😎" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [bubblePulse, setBubblePulse] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setBubblePulse(false);
    }
  }, [isOpen]);

  const sendMessage = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    // Add user message
    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setInput("");
    setIsTyping(true);

    // Simulate Gojo thinking
    const delay = TYPING_DELAY_MIN + Math.random() * (TYPING_DELAY_MAX - TYPING_DELAY_MIN);
    setTimeout(() => {
      const reply = getGojoResponse(trimmed);
      setMessages((prev) => [...prev, { from: "gojo", text: reply }]);
      setIsTyping(false);
    }, delay);
  }, [input, isTyping]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @keyframes gojoBubblePulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(0,102,255,0.3), 0 0 40px rgba(0,102,255,0.1); transform: scale(1); }
          50% { box-shadow: 0 4px 30px rgba(0,102,255,0.5), 0 0 60px rgba(0,102,255,0.2); transform: scale(1.05); }
        }
        @keyframes gojoChatSlideUp {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes gojoChatSlideDown {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(20px) scale(0.95); }
        }
        @keyframes gojoTypingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
        @keyframes gojoInfinityFloat {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
        }
        .gojo-chat-msg-enter {
          animation: gojoChatSlideUp 0.3s ease-out both;
        }
      `}</style>

      {/* ═══ FLOATING CHAT BUBBLE + LABEL ═══ */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 10000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          pointerEvents: "none",
        }}
      >
        {/* "Gojo Pal" label above bubble */}
        {!isOpen && (
          <span
            style={{
              fontFamily: "'Zen Dots', cursive",
              fontSize: 11,
              color: "#0066ff",
              textTransform: "uppercase",
              letterSpacing: 2,
              textShadow: "0 0 10px rgba(0,102,255,0.5), 0 0 20px rgba(0,102,255,0.2)",
              animation: "gojoBubblePulse 2s ease-in-out infinite",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            Gojo Pal
          </span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close Gojo Chat" : "Chat with Gojo"}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: "2px solid rgba(0,102,255,0.4)",
            background: "linear-gradient(135deg, #0a0a2e 0%, #1a1060 100%)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: bubblePulse && !isOpen ? "gojoBubblePulse 2s ease-in-out infinite" : "none",
            boxShadow: "0 4px 20px rgba(0,102,255,0.3)",
            transition: "transform 0.3s, box-shadow 0.3s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            padding: 0,
            pointerEvents: "auto",
          }}
        >
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <GojoAvatar size={48} />
          )}
        </button>
      </div>

      {/* ═══ CHAT WINDOW ═══ */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 96,
            right: 24,
            zIndex: 9999,
            width: "min(380px, calc(100vw - 32px))",
            maxHeight: "min(520px, calc(100vh - 140px))",
            borderRadius: 16,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: "rgba(10, 5, 30, 0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(0,102,255,0.2)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 30px rgba(0,102,255,0.1)",
            animation: "gojoChatSlideUp 0.35s ease-out both",
          }}
        >
          {/* ─── Header ─── */}
          <div
            style={{
              padding: "14px 16px",
              background: "linear-gradient(135deg, rgba(0,102,255,0.15) 0%, rgba(26,16,96,0.8) 100%)",
              borderBottom: "1px solid rgba(0,102,255,0.15)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <GojoAvatar size={36} />
            <div style={{ flex: 1 }}>
              <h4
                style={{
                  fontFamily: "'Zen Dots', cursive",
                  fontSize: 13,
                  color: "#e8e8e8",
                  margin: 0,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                Gojo Satoru
              </h4>
              <p
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9,
                  color: "#0066ff",
                  margin: 0,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                The Strongest Sorcerer
              </p>
            </div>
            {/* Infinity symbol */}
            <div
              style={{
                fontSize: 20,
                color: "#0066ff",
                opacity: 0.5,
                animation: "gojoInfinityFloat 4s ease-in-out infinite",
              }}
            >
              ∞
            </div>
          </div>

          {/* ─── Messages ─── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              minHeight: 200,
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0,102,255,0.3) transparent",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className="gojo-chat-msg-enter"
                style={{
                  display: "flex",
                  gap: 8,
                  flexDirection: msg.from === "user" ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                {msg.from === "gojo" && <GojoAvatar size={28} />}
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "10px 14px",
                    borderRadius: msg.from === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background:
                      msg.from === "user"
                        ? "linear-gradient(135deg, #7c4dff, #5c2ddf)"
                        : "rgba(255,255,255,0.06)",
                    border:
                      msg.from === "user"
                        ? "1px solid rgba(124,77,255,0.3)"
                        : "1px solid rgba(255,255,255,0.08)",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: msg.from === "user" ? "#f0f0f0" : "#d0d0d8",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <GojoAvatar size={28} />
                <div
                  style={{
                    padding: "10px 18px",
                    borderRadius: "14px 14px 14px 4px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    gap: 5,
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((d) => (
                    <div
                      key={d}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#0066ff",
                        animation: `gojoTypingDot 1.4s ease-in-out ${d * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ─── Input ─── */}
          <div
            style={{
              padding: "10px 12px",
              borderTop: "1px solid rgba(0,102,255,0.15)",
              background: "rgba(0,0,0,0.3)",
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Gojo anything..."
              maxLength={500}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(0,102,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "#e8e8e8",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                outline: "none",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(0,102,255,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(0,102,255,0.2)")}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                border: "none",
                background:
                  input.trim() && !isTyping
                    ? "linear-gradient(135deg, #0066ff, #0044cc)"
                    : "rgba(255,255,255,0.05)",
                cursor: input.trim() && !isTyping ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s",
                flexShrink: 0,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={input.trim() && !isTyping ? "#ffffff" : "#555"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          {/* ─── Footer ─── */}
          <div
            style={{
              padding: "6px 14px 8px",
              textAlign: "center",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 8,
                color: "rgba(255,255,255,0.2)",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Powered by Infinity ∞
            </span>
          </div>
        </div>
      )}
    </>
  );
}
ct, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   GOJO CHATBOT — "Nah, I'd Win" Edition
   A floating chat widget with Gojo Satoru's personality.
   Pure client-side — no API keys, no backend needed.
   ═══════════════════════════════════════════════════════════════ */

// ─── Gojo's Brain (pattern-matched responses) ───────────────
const GOJO_RESPONSES = [
  // Greetings
  { patterns: [/^(hi|hey|hello|yo|sup|what'?s up|howdy|hola)/i],
    replies: [
      "Yo! The strongest sorcerer just entered the chat. 😎",
      "Hey there~ You must have good taste to summon me.",
      "Ah, a visitor! Don't worry, I won't use Hollow Purple on you... probably.",
      "Welcome to my Domain — the chat version. Much less deadly, I promise~",
    ]},
  // Who are you
  { patterns: [/who (are|r) (you|u)/i, /what'?s your name/i, /introduce yourself/i],
    replies: [
      "I'm Gojo Satoru — the strongest jujutsu sorcerer alive. But you already knew that, right? 😎",
      "Throughout the heavens and earth, I alone am the honoured one~ That's me!",
      "The name's Gojo. Teacher, sorcerer, and undeniably the coolest person you'll ever chat with.",
    ]},
  // About his power / infinity / six eyes
  { patterns: [/infinit(y|e)/i, /six eyes/i, /your (power|ability|technique)/i, /how strong/i, /strongest/i],
    replies: [
      "Infinity means nothing can touch me~ It's the convergence of an infinite series right at my body. Pretty neat, huh?",
      "The Six Eyes let me see cursed energy at an atomic level AND use my techniques with basically zero energy cost. Broken? Maybe. Do I care? Nah~ 😎",
      "Let's just say... on a scale of 1 to 10, I broke the scale. Then used the broken pieces as confetti.",
      "Strong enough that they had to seal me away because they couldn't beat me. That says everything, doesn't it?",
    ]},
  // Hollow Purple / Domain Expansion
  { patterns: [/hollow purple/i, /domain expansion/i, /unlimited void/i, /purple/i],
    replies: [
      "Hollow Purple — the merging of Blue and Red into the ultimate destructive force. It erases everything in its path~ ✨",
      "Domain Expansion: Unlimited Void. Once you're in, your mind gets flooded with infinite information. Game over~ 🔮",
      "You want me to demonstrate? ...Maybe let's not. This is Max's website and I'd rather not delete it. 😅",
    ]},
  // About Max
  { patterns: [/who(( i)?s|'s) max/i, /tell me about max/i, /max/i],
    replies: [
      "Max? That kid's creativity is off the charts. Built this entire website! Even I'm impressed, and I don't impress easily~",
      "Max is The Creative Legend — age 11 and already building things most adults can't. Future strongest creator, I'd say! 🌟",
      "Ah, Max! The third member of our legendary trio. His superpower? Pure imagination and unstoppable energy!",
    ]},
  // About Tanjiro
  { patterns: [/tanjiro/i, /demon slayer/i, /kamado/i, /water breathing/i],
    replies: [
      "Tanjiro? Good kid. Heart of gold. His Water Breathing is elegant — not as flashy as Infinity, but I respect the grind~",
      "The Demon Slayer boy! His determination is his real power. Even I'd think twice before making him angry.",
      "Tanjiro Kamado — proof that kindness can be the strongest weapon. Don't tell him I said that though. 😏",
    ]},
  // About Naruto
  { patterns: [/naruto/i, /hokage/i, /ninja/i, /uzumaki/i, /rasengan/i],
    replies: [
      "Naruto? Talk-no-jutsu champion of the world. Even I'd have trouble arguing with that kid's speeches~",
      "The guy who befriended a giant fox demon through sheer stubbornness. Respect. 🦊",
      "Different universe, but I'd love a sparring match. Infinite Void vs. Talk-no-Jutsu — who wins? ...Nah, I'd win.",
    ]},
  // Nah I'd win
  { patterns: [/nah,? i'?d win/i, /would you win/i, /can you (beat|win|defeat)/i, /fight/i, /vs\.?/i, /versus/i, /who would win/i, /battle/i],
    replies: [
      "Nah, I'd win. 😎",
      "Was that even a question? I'd win before breakfast~",
      "The outcome was decided the moment you asked. Nah, I'd win.",
      "I appreciate the hypothetical, but we both know how this ends~ 😎✌️",
    ]},
  // Anime recommendations
  { patterns: [/recommend/i, /watch (what|which)/i, /what (should|anime)/i, /suggest/i, /favourite anime/i, /best anime/i],
    replies: [
      "Obviously Jujutsu Kaisen — but I might be biased since I steal every scene I'm in~ 😎\nAlso: Demon Slayer, Naruto, One Piece, Hunter x Hunter, and Spy x Family!",
      "Start with JJK (for me), then Demon Slayer (for the animation), then One Piece (for the adventure). You're welcome~",
      "My top picks: Jujutsu Kaisen, Demon Slayer, My Hero Academia, and Attack on Titan. Each one hits different!",
    ]},
  // Manga
  { patterns: [/manga/i, /read/i, /chapter/i],
    replies: [
      "Manga reader? Cultured! The Jujutsu Kaisen manga goes HARD. And the Demon Slayer art is *chef's kiss* 🎨",
      "Reading manga is peak culture. Check out One Piece if you want 1000+ chapters of pure adventure!",
    ]},
  // Secret codes / easter eggs
  { patterns: [/secret/i, /code/i, /easter egg/i, /hidden/i, /unlock/i, /cheat/i],
    replies: [
      "Ooh, looking for secrets? Try typing some special codes on the main site... I won't tell you what they are though. A sorcerer never reveals his tricks~ 🤫",
      "There might be some hidden powers on this site... Try thinking about what the three legends are known for~ 😉",
      "Secrets? On THIS site? ...Maybe. Try the secret code input on the main page. That's all I'll say~ 🔮",
    ]},
  // Compliments
  { patterns: [/you('re| are) (cool|awesome|great|amazing|the best)/i, /i (love|like) you/i, /you rock/i],
    replies: [
      "I know~ 😎✨ But thanks for saying it anyway!",
      "Finally, someone who gets it! You have excellent judgment~",
      "Stop, you're making me blush~ ...Just kidding, I'm always this confident. But thank you! 💙",
    ]},
  // How are you
  { patterns: [/how (are|r) (you|u)/i, /how'?s it going/i, /what'?s good/i],
    replies: [
      "I'm doing great~ Being the strongest is exhausting, but someone's gotta do it. 😎",
      "Living my best life as a chatbot on Max's legendary website. Can't complain~",
      "Fantastic! Just finished teaching my students... by which I mean roasting them lovingly. 💙",
    ]},
  // Goodbye
  { patterns: [/bye/i, /goodbye/i, /see (you|ya)/i, /later/i, /gotta go/i, /leaving/i],
    replies: [
      "Later~ Remember: throughout the heavens and earth, I alone am the honoured one. Don't forget it! 😎✌️",
      "See ya! Don't miss me too much~ ...Who am I kidding, of course you will.",
      "Bye for now! Come back anytime — my Domain is always open for cool people like you~ ✨",
    ]},
  // Funny / jokes
  { patterns: [/joke/i, /funny/i, /make me laugh/i, /tell me something/i],
    replies: [
      "Why did the cursed spirit cross the road? Because I was on the other side, and it wanted to get exorcised in style~ 😎",
      "My students asked me to be serious for once. I tried. I lasted 3 seconds. New personal record!",
      "What's the difference between me and other sorcerers? About 10 power levels~ 😂",
    ]},
  // School / teaching
  { patterns: [/teach/i, /school/i, /student/i, /learn/i, /jujutsu (high|tech)/i, /sensei/i],
    replies: [
      "I'm actually a teacher at Jujutsu High! Yuji, Megumi, Nobara — they're my precious students. Even if I show it in... unconventional ways~",
      "Teaching is my real passion. The fighting is just a side hobby. ...Okay, the fighting is also a passion. 😅",
      "Want to learn jujutsu? Step 1: Believe in yourself. Step 2: Don't die. Step 3: Profit. That's basically my curriculum~",
    ]},
  // The website
  { patterns: [/this (site|website)/i, /the site/i, /cool (site|website)/i, /who (made|built|created)/i],
    replies: [
      "This website? Built by Max — The Creative Legend! Age 11 and already creating things that blow minds. The kid's got talent! 🌟",
      "Pretty sick website, right? Max coded the whole thing. React, Vite, SVG art, animations — the works!",
      "Max built this entire site with React and pure CSS animations. No animation libraries needed when you have raw talent~ ✨",
    ]},
];

// Fallback responses when no pattern matches
const FALLBACK_REPLIES = [
  "Hmm, interesting! I'm not sure what to say to that, but I'd still win. 😎",
  "That's beyond even my Six Eyes' comprehension~ Try asking me about anime, powers, or Max!",
  "I'd answer that, but my Infinity is blocking the response~ Try asking something else!",
  "Even the strongest sorcerer needs a moment to think about that one... Ask me about JJK, the legends, or anime!",
  "My brain is processing that at infinite speed... and I still got nothing. But I look cool doing it~ 😎",
  "*adjusts blindfold* ...Nah, I got nothing for that one. Ask me about powers, anime, or the legends!",
];

// Typing delay simulation (ms)
const TYPING_DELAY_MIN = 600;
const TYPING_DELAY_MAX = 1500;

function getGojoResponse(input) {
  const trimmed = input.trim();
  if (!trimmed) return "...You just sent me nothing? Even Hollow Purple has more substance than that~ 😎";

  for (const { patterns, replies } of GOJO_RESPONSES) {
    for (const pat of patterns) {
      if (pat.test(trimmed)) {
        return replies[Math.floor(Math.random() * replies.length)];
      }
    }
  }
  return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
}

// ─── Mini Gojo SVG for the chat bubble ──────────────────────
const GojoAvatar = ({ size = 40 }) => (
  <svg viewBox="0 0 120 120" width={size} height={size} style={{ borderRadius: "50%", flexShrink: 0 }}>
    <rect width="120" height="120" rx="60" fill="#0a0a2e" />
    {/* Hair */}
    <ellipse cx="60" cy="38" rx="28" ry="14" fill="#e8e8f0" />
    <path d="M34 42 Q38 18 60 24 Q82 18 86 42" fill="#e8e8f0" />
    <path d="M42 22 L45 12 L52 24" fill="#d8d8e8" />
    <path d="M68 24 L75 12 L78 22" fill="#d8d8e8" />
    {/* Face */}
    <ellipse cx="60" cy="52" rx="22" ry="24" fill="#fce4c8" />
    {/* Blindfold */}
    <rect x="36" y="45" width="48" height="10" rx="5" fill="#1a1a2e" />
    <rect x="36" y="45" width="48" height="10" rx="5" fill="none" stroke="#0066ff" strokeWidth="1" opacity="0.6" />
    {/* Smirk */}
    <path d="M48 65 Q60 72 72 65" fill="none" stroke="#c8a090" strokeWidth="1.5" strokeLinecap="round" />
    {/* Glow */}
    <circle cx="60" cy="50" r="55" fill="none" stroke="#0066ff" strokeWidth="0.5" opacity="0.3" />
  </svg>
);

// ─── The Chat Component ─────────────────────────────────────
export default function GojoChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "gojo", text: "Yo! I'm Gojo Satoru — the strongest sorcerer and Max's personal chatbot~ Ask me anything! 😎" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [bubblePulse, setBubblePulse] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setBubblePulse(false);
    }
  }, [isOpen]);

  const sendMessage = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    // Add user message
    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setInput("");
    setIsTyping(true);

    // Simulate Gojo thinking
    const delay = TYPING_DELAY_MIN + Math.random() * (TYPING_DELAY_MAX - TYPING_DELAY_MIN);
    setTimeout(() => {
      const reply = getGojoResponse(trimmed);
      setMessages((prev) => [...prev, { from: "gojo", text: reply }]);
      setIsTyping(false);
    }, delay);
  }, [input, isTyping]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @keyframes gojoBubblePulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(0,102,255,0.3), 0 0 40px rgba(0,102,255,0.1); transform: scale(1); }
          50% { box-shadow: 0 4px 30px rgba(0,102,255,0.5), 0 0 60px rgba(0,102,255,0.2); transform: scale(1.05); }
        }
        @keyframes gojoChatSlideUp {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes gojoChatSlideDown {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(20px) scale(0.95); }
        }
        @keyframes gojoTypingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
        @keyframes gojoInfinityFloat {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
        }
        .gojo-chat-msg-enter {
          animation: gojoChatSlideUp 0.3s ease-out both;
        }
      `}</style>

      {/* ═══ FLOATING CHAT BUBBLE ═══ */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close Gojo Chat" : "Chat with Gojo"}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 10000,
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: "2px solid rgba(0,102,255,0.4)",
          background: "linear-gradient(135deg, #0a0a2e 0%, #1a1060 100%)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: bubblePulse && !isOpen ? "gojoBubblePulse 2s ease-in-out infinite" : "none",
          boxShadow: "0 4px 20px rgba(0,102,255,0.3)",
          transition: "transform 0.3s, box-shadow 0.3s",
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          padding: 0,
        }}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <GojoAvatar size={48} />
        )}
      </button>

      {/* ═══ CHAT WINDOW ═══ */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 96,
            right: 24,
            zIndex: 9999,
            width: "min(380px, calc(100vw - 32px))",
            maxHeight: "min(520px, calc(100vh - 140px))",
            borderRadius: 16,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: "rgba(10, 5, 30, 0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(0,102,255,0.2)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 30px rgba(0,102,255,0.1)",
            animation: "gojoChatSlideUp 0.35s ease-out both",
          }}
        >
          {/* ─── Header ─── */}
          <div
            style={{
              padding: "14px 16px",
              background: "linear-gradient(135deg, rgba(0,102,255,0.15) 0%, rgba(26,16,96,0.8) 100%)",
              borderBottom: "1px solid rgba(0,102,255,0.15)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <GojoAvatar size={36} />
            <div style={{ flex: 1 }}>
              <h4
                style={{
                  fontFamily: "'Zen Dots', cursive",
                  fontSize: 13,
                  color: "#e8e8e8",
                  margin: 0,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                Gojo Satoru
              </h4>
              <p
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9,
                  color: "#0066ff",
                  margin: 0,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                The Strongest Sorcerer
              </p>
            </div>
            {/* Infinity symbol */}
            <div
              style={{
                fontSize: 20,
                color: "#0066ff",
                opacity: 0.5,
                animation: "gojoInfinityFloat 4s ease-in-out infinite",
              }}
            >
              ∞
            </div>
          </div>

          {/* ─── Messages ─── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              minHeight: 200,
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0,102,255,0.3) transparent",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className="gojo-chat-msg-enter"
                style={{
                  display: "flex",
                  gap: 8,
                  flexDirection: msg.from === "user" ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                {msg.from === "gojo" && <GojoAvatar size={28} />}
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "10px 14px",
                    borderRadius: msg.from === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background:
                      msg.from === "user"
                        ? "linear-gradient(135deg, #7c4dff, #5c2ddf)"
                        : "rgba(255,255,255,0.06)",
                    border:
                      msg.from === "user"
                        ? "1px solid rgba(124,77,255,0.3)"
                        : "1px solid rgba(255,255,255,0.08)",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: msg.from === "user" ? "#f0f0f0" : "#d0d0d8",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <GojoAvatar size={28} />
                <div
                  style={{
                    padding: "10px 18px",
                    borderRadius: "14px 14px 14px 4px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    gap: 5,
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((d) => (
                    <div
                      key={d}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#0066ff",
                        animation: `gojoTypingDot 1.4s ease-in-out ${d * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ─── Input ─── */}
          <div
            style={{
              padding: "10px 12px",
              borderTop: "1px solid rgba(0,102,255,0.15)",
              background: "rgba(0,0,0,0.3)",
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Gojo anything..."
              maxLength={500}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(0,102,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "#e8e8e8",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                outline: "none",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(0,102,255,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(0,102,255,0.2)")}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                border: "none",
                background:
                  input.trim() && !isTyping
                    ? "linear-gradient(135deg, #0066ff, #0044cc)"
                    : "rgba(255,255,255,0.05)",
                cursor: input.trim() && !isTyping ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s",
                flexShrink: 0,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={input.trim() && !isTyping ? "#ffffff" : "#555"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          {/* ─── Footer ─── */}
          <div
            style={{
              padding: "6px 14px 8px",
              textAlign: "center",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 8,
                color: "rgba(255,255,255,0.2)",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Powered by Infinity ∞
            </span>
          </div>
        </div>
      )}
    </>
  );
}
