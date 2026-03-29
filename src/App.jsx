import { useState, useEffect, useRef, useMemo, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   MAX'S ANIME SOUL SITE — THE POWER OF THE THREE GREATS
   ═══════════════════════════════════════════════════════════════ */

// ─── Scroll Reveal Hook ─────────────────────────────────────
const useScrollReveal = (opts = {}) => {
  const { threshold = 0.15, rootMargin = "0px 0px -50px 0px", once = true } = opts;
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setVis(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); if (once) obs.unobserve(el); } }, { threshold, rootMargin });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
};

// ─── Particle System ────────────────────────────────────────
const ParticleSystem = ({ type = "embers", count = 16, opacity = 0.55 }) => {
  const ps = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i, left: Math.random() * 100, size: type === "stars" ? 2 + Math.random() * 3 : 6 + Math.random() * 10,
    dur: 7 + Math.random() * 11, delay: -(Math.random() * 18), drift: -25 + Math.random() * 50, rot: Math.random() * 360,
  })), [count, type]);
  const styles = {
    embers: (p) => ({ borderRadius: "50%", background: "#ff6b6b", boxShadow: "0 0 6px #ff6b6b", width: p.size, height: p.size }),
    stars: (p) => ({ borderRadius: "50%", background: "#fff", boxShadow: "0 0 4px #fff", width: p.size, height: p.size }),
  };
  const anim = type === "embers" ? "particleRise" : "particleFall";
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {ps.map((p) => (
        <div key={p.id} style={{ position: "absolute", left: `${p.left}%`, [type === "embers" ? "bottom" : "top"]: "-20px",
          opacity, animation: `${anim} ${p.dur}s linear ${p.delay}s infinite`, "--drift": `${p.drift}px`, "--rot-end": `${p.rot}deg`, ...styles[type]?.(p) }} />
      ))}
    </div>
  );
};

// ─── SVG Character: Gojo ────────────────────────────────────
const GojoSVG = ({ glow }) => (
  <svg viewBox="0 0 120 200" width="120" height="200" style={{ filter: `drop-shadow(0 0 20px ${glow})` }}>
    {/* Hair - white spiky */}
    <ellipse cx="60" cy="52" rx="32" ry="18" fill="#e8e8f0" />
    <path d="M30 55 Q35 20 60 28 Q85 20 90 55" fill="#e8e8f0" />
    <path d="M38 30 L42 15 L50 32" fill="#d8d8e8" />
    <path d="M70 32 L78 15 L82 30" fill="#d8d8e8" />
    {/* Face */}
    <ellipse cx="60" cy="65" rx="24" ry="28" fill="#fce4c8" />
    {/* Blindfold */}
    <rect x="34" y="57" width="52" height="12" rx="6" fill="#1a1a2e" />
    <rect x="34" y="57" width="52" height="12" rx="6" fill="none" stroke="#0066ff" strokeWidth="1" opacity="0.6" />
    {/* Smirk */}
    <path d="M50 78 Q60 84 70 78" fill="none" stroke="#c8a090" strokeWidth="1.5" strokeLinecap="round" />
    {/* Neck + Body */}
    <rect x="52" y="90" width="16" height="12" rx="2" fill="#fce4c8" />
    <path d="M35 102 L45 95 L75 95 L85 102 L85 170 Q60 180 35 170 Z" fill="#1a1a2e" />
    {/* Collar detail */}
    <path d="M45 100 L60 115 L75 100" fill="none" stroke="#0066ff" strokeWidth="1.5" opacity="0.8" />
    {/* Infinity symbol on chest */}
    <path d="M50 130 Q55 125 60 130 Q65 135 70 130 Q65 125 60 130 Q55 135 50 130" fill="none" stroke="#0066ff" strokeWidth="1.5" opacity="0.5" />
    {/* Arms */}
    <path d="M35 108 L20 145 L25 147" fill="none" stroke="#1a1a2e" strokeWidth="10" strokeLinecap="round" />
    <path d="M85 108 L100 145 L95 147" fill="none" stroke="#1a1a2e" strokeWidth="10" strokeLinecap="round" />
  </svg>
);

// ─── SVG Character: Max (center hero, slightly bigger) ──────
const MaxSVG = ({ glow }) => (
  <svg viewBox="0 0 130 220" width="650" height="1100" style={{ filter: `drop-shadow(0 0 24px ${glow})`, maxHeight: "65vh", width: "auto" }}>
    {/* Spiky creative-energy hair - purple with gold tips */}
    <path d="M40 55 L30 15 L50 40" fill="#7c4dff" />
    <path d="M55 50 L50 5 L65 38" fill="#7c4dff" />
    <path d="M70 48 L75 8 L82 40" fill="#7c4dff" />
    <path d="M82 55 L95 18 L90 48" fill="#7c4dff" />
    <path d="M30 15 L33 12" stroke="#ffd93d" strokeWidth="3" strokeLinecap="round" />
    <path d="M50 5 L52 2" stroke="#ffd93d" strokeWidth="3" strokeLinecap="round" />
    <path d="M75 8 L77 4" stroke="#ffd93d" strokeWidth="3" strokeLinecap="round" />
    <path d="M95 18 L98 15" stroke="#ffd93d" strokeWidth="3" strokeLinecap="round" />
    {/* Face */}
    <ellipse cx="65" cy="70" rx="26" ry="30" fill="#fce4c8" />
    {/* Eyes - big, determined, anime-style */}
    <ellipse cx="53" cy="65" rx="7" ry="8" fill="white" />
    <ellipse cx="77" cy="65" rx="7" ry="8" fill="white" />
    <ellipse cx="54" cy="66" rx="5" ry="6" fill="#7c4dff" />
    <ellipse cx="78" cy="66" rx="5" ry="6" fill="#7c4dff" />
    <ellipse cx="55" cy="64" rx="2" ry="2" fill="white" />
    <ellipse cx="79" cy="64" rx="2" ry="2" fill="white" />
    {/* Determined eyebrows */}
    <path d="M44 56 L58 54" stroke="#4a2840" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M72 54 L86 56" stroke="#4a2840" strokeWidth="2.5" strokeLinecap="round" />
    {/* Confident grin */}
    <path d="M52 82 Q65 92 78 82" fill="none" stroke="#c8a090" strokeWidth="2" strokeLinecap="round" />
    {/* Neck + Body with cape/jacket */}
    <rect x="57" y="96" width="16" height="12" rx="2" fill="#fce4c8" />
    <path d="M38 108 L50 100 L80 100 L92 108 L92 185 Q65 195 38 185 Z" fill="#2d1b69" />
    {/* Lightning bolt on chest */}
    <polygon points="60,120 68,120 63,135 70,135 55,155 60,140 53,140" fill="#ffd93d" />
    {/* Cape flowing */}
    <path d="M38 108 L22 160 Q30 170 38 165" fill="#7c4dff" opacity="0.7" />
    <path d="M92 108 L108 160 Q100 170 92 165" fill="#7c4dff" opacity="0.7" />
    {/* Star sparkle near head */}
    <polygon points="100,45 102,40 104,45 109,47 104,49 102,54 100,49 95,47" fill="#ffd93d" opacity="0.8" />
  </svg>
);

// ─── SVG Character: Tanjiro ─────────────────────────────────
const TanjiroSVG = ({ glow }) => (
  <svg viewBox="0 0 120 200" width="120" height="200" style={{ filter: `drop-shadow(0 0 20px ${glow})` }}>
    {/* Hair - dark burgundy, shorter */}
    <ellipse cx="60" cy="48" rx="28" ry="16" fill="#5c1a1a" />
    <path d="M32 52 Q38 25 60 30 Q82 25 88 52" fill="#5c1a1a" />
    <path d="M42 30 L45 22" stroke="#3a0e0e" strokeWidth="2" />
    <path d="M75 22 L78 30" stroke="#3a0e0e" strokeWidth="2" />
    {/* Face */}
    <ellipse cx="60" cy="65" rx="24" ry="28" fill="#fce4c8" />
    {/* Scar */}
    <path d="M42 52 Q44 48 46 52 Q48 56 46 60" fill="#c0392b" opacity="0.7" />
    {/* Eyes - kind, determined */}
    <ellipse cx="50" cy="63" rx="5" ry="6" fill="white" />
    <ellipse cx="70" cy="63" rx="5" ry="6" fill="white" />
    <ellipse cx="51" cy="64" rx="3.5" ry="4.5" fill="#c0392b" />
    <ellipse cx="71" cy="64" rx="3.5" ry="4.5" fill="#c0392b" />
    <ellipse cx="52" cy="62" rx="1.5" ry="1.5" fill="white" />
    <ellipse cx="72" cy="62" rx="1.5" ry="1.5" fill="white" />
    {/* Gentle eyebrows */}
    <path d="M43 55 L55 53" stroke="#5c1a1a" strokeWidth="2" strokeLinecap="round" />
    <path d="M65 53 L77 55" stroke="#5c1a1a" strokeWidth="2" strokeLinecap="round" />
    {/* Hanafuda earrings */}
    <circle cx="36" cy="72" r="5" fill="#e94560" />
    <line x1="36" y1="68" x2="36" y2="76" stroke="#ffd93d" strokeWidth="1" />
    <circle cx="84" cy="72" r="5" fill="#e94560" />
    <line x1="84" y1="68" x2="84" y2="76" stroke="#ffd93d" strokeWidth="1" />
    {/* Determined smile */}
    <path d="M52 78 Q60 83 68 78" fill="none" stroke="#c8a090" strokeWidth="1.5" strokeLinecap="round" />
    {/* Body - green-black haori */}
    <rect x="52" y="90" width="16" height="12" rx="2" fill="#fce4c8" />
    <path d="M35 102 L45 95 L75 95 L85 102 L85 170 Q60 180 35 170 Z" fill="#1a3a2a" />
    {/* Checkered pattern on haori */}
    <rect x="40" y="110" width="8" height="8" fill="#2a5a3a" opacity="0.6" />
    <rect x="48" y="118" width="8" height="8" fill="#2a5a3a" opacity="0.6" />
    <rect x="64" y="110" width="8" height="8" fill="#2a5a3a" opacity="0.6" />
    <rect x="72" y="118" width="8" height="8" fill="#2a5a3a" opacity="0.6" />
    {/* Sword on back */}
    <line x1="88" y1="95" x2="78" y2="175" stroke="#888" strokeWidth="3" />
    <rect x="76" y="92" width="8" height="6" rx="1" fill="#e94560" />
  </svg>
);

// ─── Stat Bar Component ─────────────────────────────────────
const StatBar = ({ label, value, max = 100, color, delay = 0, ultra = false }) => {
  const [ref, vis] = useScrollReveal();
  const pct = ((ultra ? 100 : value) / max) * 100;
  const barColor = ultra ? "#ffd93d" : color;
  return (
    <div ref={ref} style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4,
        fontFamily: "'Space Mono',monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "#a0a0b0" }}>
        <span>{label}</span><span style={{ color: barColor }}>{ultra ? 100 : value}</span>
      </div>
      <div style={{ height: 7, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
        <div style={{ height: "100%", width: vis ? `${pct}%` : "0%", background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
          borderRadius: 4, position: "relative", overflow: "hidden",
          transition: `width 1.5s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s` }}>
          <div style={{ position: "absolute", inset: 0,
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)",
            transform: vis ? "translateX(200%)" : "translateX(-100%)", transition: `transform 0.8s ease-out ${delay + 1.6}s` }} />
        </div>
      </div>
    </div>
  );
};

// ─── Manga Card ─────────────────────────────────────────────
const MangaCard = ({ manga, isActive, onClick }) => {
  const [hov, setHov] = useState(false);
  const [ref, vis] = useScrollReveal();
  return (
    <div ref={ref} onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ opacity: vis ? 1 : 0, transform: vis ? (hov ? "translateY(-10px) scale(1.02)" : "none") : "translateY(40px)",
        transition: "all 0.5s ease", cursor: "pointer", position: "relative", borderRadius: 16, overflow: "hidden",
        background: manga.bg, border: `2px solid ${hov ? manga.accent + "88" : "rgba(255,255,255,0.1)"}`,
        boxShadow: hov ? `0 20px 50px rgba(0,0,0,0.5), 0 0 40px ${manga.accent}33` : "0 8px 24px rgba(0,0,0,0.3)" }}>
      {/* Speed lines bg */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `repeating-conic-gradient(rgba(255,255,255,0.02) 0deg 1deg, transparent 1deg 8deg)`,
        opacity: hov ? 0.5 : 0.15, transition: "opacity 0.3s", pointerEvents: "none" }} />
      <div style={{ padding: 28, position: "relative", zIndex: 1 }}>
        {/* Logo-styled title */}
        <h3 style={{ fontFamily: "'Zen Dots',cursive", fontSize: 22, color: manga.accent, textTransform: "uppercase",
          letterSpacing: 3, marginBottom: 8, textShadow: `0 0 12px ${manga.accent}55` }}>{manga.title}</h3>
        <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, color: "#d0d0d0", lineHeight: 1.7, marginBottom: 16 }}>{manga.desc}</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {manga.tags.map(t => (
            <span key={t} style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: 1,
              color: hov ? manga.accent : "#a0a0b0", background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: 12, transition: "color 0.3s" }}>{t}</span>
          ))}
        </div>
      </div>
      {/* Accent strip */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${manga.accent}, transparent)`,
        opacity: hov ? 1 : 0.5, transition: "opacity 0.3s" }} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function MaxAnimeSoulSite() {
  const [introPhase, setIntroPhase] = useState(0); // 0=dark, 1=typing, 2=revealed
  const [typeText, setTypeText] = useState("");
  const [ultraMode, setUltraMode] = useState(false);
  const [ultraAnimating, setUltraAnimating] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [activeManga, setActiveManga] = useState(null);
  const [pageTurn, setPageTurn] = useState(false);
  const heroRef = useRef(null);

  const introLine = "The power of three legends begins here...";

  // Intro sequence
  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase(1), 1200);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (introPhase !== 1) return;
    if (typeText.length >= introLine.length) {
      setTimeout(() => setIntroPhase(2), 600);
      return;
    }
    const t = setTimeout(() => setTypeText(introLine.slice(0, typeText.length + 1)), 55);
    return () => clearTimeout(t);
  }, [introPhase, typeText]);

  // Ultra Super activation
  const activateUltra = useCallback(() => {
    if (ultraMode) return;
    setUltraAnimating(true);
    setTimeout(() => { setUltraAnimating(false); setUltraMode(true); }, 3200);
  }, [ultraMode]);

  const handleSecretSubmit = () => {
    if (secretCode.trim().toLowerCase() === "ultra super") activateUltra();
  };

  // Character data
  const characters = [
    { name: "Gojo Satoru", title: "The Strongest Sorcerer", color: "#0066ff", sig: "Infinity / Hollow Purple",
      stats: [{ l: "Power", v: 100 }, { l: "Speed", v: 95 }, { l: "Intelligence", v: 98 }, { l: "Technique", v: 100 }, { l: "Coolness", v: 100 }] },
    { name: "Max", title: "The Creative Legend", color: "#7c4dff", sig: "Creative Storm / Legend Mode",
      stats: [{ l: "Creativity", v: 100 }, { l: "Soccer Skills", v: 88 }, { l: "Swimming", v: 85 }, { l: "Imagination", v: 100 }, { l: "Energy", v: 95 }] },
    { name: "Tanjiro Kamado", title: "The Demon Slayer", color: "#e94560", sig: "Sun Breathing / Water Breathing",
      stats: [{ l: "Power", v: 85 }, { l: "Speed", v: 80 }, { l: "Determination", v: 100 }, { l: "Kindness", v: 100 }, { l: "Swordsmanship", v: 90 }] },
  ];

  const mangaPages = [
    { title: "Naruto", accent: "#ff8c00", bg: "linear-gradient(135deg, #1a0a00, #3a1a00, #1a0a00)",
      desc: "Follow Naruto Uzumaki on his quest to become the greatest Hokage! A tale of friendship, perseverance, and never giving up — even when the whole world counts you out.",
      tags: ["Action", "Adventure", "Ninja"] },
    { title: "Jujutsu Kaisen", accent: "#0066ff", bg: "linear-gradient(135deg, #0a0a2e, #1a1050, #0a0a2e)",
      desc: "Enter a world of cursed energy and sorcerers. Where Gojo Satoru stands as the strongest and every battle pushes the limits of power. The supernatural has never been this intense.",
      tags: ["Action", "Supernatural", "Dark Fantasy"] },
    { title: "Demon Slayer", accent: "#e94560", bg: "linear-gradient(135deg, #0a1a0a, #1a3020, #0a1a0a)",
      desc: "Tanjiro Kamado swings his blade with the fury of the sun and the grace of water. A breathtaking journey of a boy who fights demons to save his sister and protect humanity.",
      tags: ["Action", "Supernatural", "Historical"] },
  ];

  const quotes = [
    { text: "Throughout the heavens and earth, I alone am the honoured one.", by: "Gojo Satoru", color: "#0066ff" },
    { text: "No matter how many people you may lose, you have no choice but to go on living.", by: "Tanjiro Kamado", color: "#e94560" },
    { text: "Creativity is the ultimate power — it can build worlds that have never existed.", by: "Max", color: "#ffd93d" },
  ];

  // Page turn handler
  const handleMangaClick = (i) => {
    setPageTurn(true);
    setTimeout(() => { setActiveManga(activeManga === i ? null : i); setPageTurn(false); }, 500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Dots&family=Noto+Serif+JP:wght@400;700&family=Outfit:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=Bungee+Shade&display=swap');
        :root {
          --sky-dawn:#1a0a2e; --sky-twilight:#2d1b69; --sky-dusk:#4a1a8a; --sky-night:#0a0514; --sky-sunset:#e91e63;
          --glow-warm:#ff6b6b; --glow-cool:#651fff; --glow-gold:#ffd93d; --glow-sakura:#ff80ab;
          --glow-electric:#7c4dff; --glow-spirit:#00e5ff; --text-primary:#e8e8e8; --text-secondary:#a0a0b0; --text-accent:#ffd600;
        }
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:#0a0030;color:var(--text-primary);font-family:'Outfit',sans-serif;overflow-x:hidden}

        @keyframes particleRise{0%{transform:translateY(110vh) translateX(0) rotate(0deg);opacity:1}80%{opacity:.6}100%{transform:translateY(-20px) translateX(var(--drift,30px)) rotate(var(--rot-end,360deg));opacity:0}}
        @keyframes particleFall{0%{transform:translateY(-20px) translateX(0) rotate(0deg)}100%{transform:translateY(110vh) translateX(var(--drift,30px)) rotate(var(--rot-end,360deg))}}
        @keyframes titleBloom{0%{text-shadow:0 0 30px rgba(255,215,61,0),0 0 60px rgba(255,215,61,0);opacity:0;transform:scale(.92)}40%{text-shadow:0 0 15px rgba(255,215,61,.9),0 0 40px rgba(255,215,61,.5),0 0 70px rgba(255,215,61,.3);opacity:1;transform:scale(1.03)}100%{text-shadow:0 0 6px rgba(255,215,61,.5),0 0 15px rgba(255,215,61,.25),0 0 30px rgba(255,215,61,.1);opacity:1;transform:scale(1)}}
        @keyframes breathe{0%,100%{opacity:.6}50%{opacity:1}}
        @keyframes sectionRise{0%{opacity:0;transform:translateY(60px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}
        @keyframes gradientShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes chargeUp{0%{box-shadow:0 0 10px var(--glow-cool)}25%{box-shadow:0 0 35px var(--glow-cool)}50%{box-shadow:0 0 10px var(--glow-cool)}75%{box-shadow:0 0 35px var(--glow-cool)}100%{box-shadow:0 0 60px var(--glow-gold)}}
        @keyframes ambientDrift{0%,100%{transform:translate(0,0)}25%{transform:translate(5px,-3px)}50%{transform:translate(-3px,5px)}75%{transform:translate(-5px,-2px)}}
        @keyframes pageTurnOut{0%{transform:perspective(1200px) rotateY(0deg);opacity:1}100%{transform:perspective(1200px) rotateY(-90deg);opacity:0}}
        @keyframes pageTurnIn{0%{transform:perspective(1200px) rotateY(90deg);opacity:0}100%{transform:perspective(1200px) rotateY(0deg);opacity:1}}
        @keyframes shockwave{0%{transform:translate(-50%,-50%) scale(0);opacity:.8;border-width:6px}100%{transform:translate(-50%,-50%) scale(4);opacity:0;border-width:1px}}
        @keyframes ultraExplode{0%{opacity:0;transform:scale(.5)}20%{opacity:1;transform:scale(1.15)}40%{transform:scale(.95)}60%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
        @keyframes sfxBurst{0%{opacity:0;transform:translate(var(--tx,0),var(--ty,0)) scale(0) rotate(var(--rot,0deg))}30%{opacity:1;transform:translate(var(--tx,0),var(--ty,0)) scale(1.2) rotate(var(--rot,0deg))}100%{opacity:0;transform:translate(var(--tx,0),var(--ty,0)) scale(.8) rotate(var(--rot,0deg))}}
        @keyframes ultraFlash{0%{opacity:0}10%{opacity:.9}100%{opacity:0}}
        @keyframes borderGlow{0%,100%{box-shadow:inset 0 0 30px rgba(255,215,61,.1)}50%{box-shadow:inset 0 0 60px rgba(255,215,61,.25)}}
        @keyframes speedLinesRotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

        .page-turning{animation:pageTurnOut .25s ease-in forwards}
        .page-turned-in{animation:pageTurnIn .25s ease-out forwards}

        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.3s!important}}
      `}</style>

      {/* Particles */}
      <ParticleSystem type={ultraMode ? "stars" : "embers"} count={ultraMode ? 28 : 16} opacity={ultraMode ? 0.7 : 0.5} />

      {/* ═══ ULTRA SUPER FLASH OVERLAY ═══ */}
      {ultraAnimating && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none" }}>
          {/* White-gold flash */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, #ffd93d, white)", animation: "ultraFlash 1s ease-out forwards" }} />
          {/* Shockwave ring */}
          <div style={{ position: "absolute", top: "50%", left: "50%", width: "200px", height: "200px", borderRadius: "50%",
            border: "4px solid #ffd93d", animation: "shockwave 1.5s ease-out 0.3s forwards", boxShadow: "0 0 40px #ffd93d" }} />
          {/* Speed lines */}
          <div aria-hidden="true" style={{ position: "absolute", inset: "-50%", background: "repeating-conic-gradient(rgba(255,215,61,0.08) 0deg 1.5deg, transparent 1.5deg 6deg)",
            animation: "speedLinesRotate 2s linear infinite" }} />
          {/* ULTRA SUPER text */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <h1 style={{ fontFamily: "'Zen Dots',cursive", fontSize: "clamp(32px,8vw,72px)", color: "#ffd93d", textTransform: "uppercase",
              letterSpacing: 8, textShadow: "0 0 20px #ffd93d, 0 0 40px #ff6b6b, 0 0 80px #7c4dff",
              animation: "ultraExplode 1s cubic-bezier(0.34,1.56,0.64,1) 0.5s both", textAlign: "center", padding: "0 20px" }}>
              ULTRA SUPER<br/>ACTIVATED!
            </h1>
          </div>
          {/* SFX words scattered */}
          {[
            { t: "BOOM!", x: "-30vw", y: "-20vh", r: "-15deg", d: "0.6s" },
            { t: "CRASH!", x: "25vw", y: "-25vh", r: "12deg", d: "0.8s" },
            { t: "LEGENDARY!", x: "-20vw", y: "25vh", r: "-8deg", d: "1s" },
            { t: "POW!", x: "30vw", y: "20vh", r: "18deg", d: "1.2s" },
            { t: "ULTRA!", x: "0", y: "-35vh", r: "5deg", d: "0.9s" },
          ].map((sfx, i) => (
            <div key={i} style={{ position: "absolute", top: "50%", left: "50%",
              fontFamily: "'Bungee Shade',cursive", fontSize: "clamp(24px,5vw,48px)", color: i % 2 === 0 ? "#ffd93d" : "#ff6b6b",
              textShadow: "3px 3px 0 #0a0514", pointerEvents: "none", whiteSpace: "nowrap",
              "--tx": sfx.x, "--ty": sfx.y, "--rot": sfx.r,
              animation: `sfxBurst 1.5s ease-out ${sfx.d} both` }}>
              {sfx.t}
            </div>
          ))}
        </div>
      )}

      {/* ═══ ULTRA MODE BORDER GLOW ═══ */}
      {ultraMode && !ultraAnimating && (
        <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 50, pointerEvents: "none",
          animation: "borderGlow 3s ease-in-out infinite", borderRadius: 0 }} />
      )}

      <main style={{ position: "relative", zIndex: 1 }}>

        {/* ═══════════════════════════════════════════════════════
            HERO SECTION — THE THREE GREATS
            ═══════════════════════════════════════════════════════ */}
        <section ref={heroRef} style={{
          minHeight: "100vh", position: "relative", overflow: "hidden",
          background: introPhase < 2
            ? "var(--sky-night)"
            : "linear-gradient(135deg, #0a0030 0%, #0066ff 25%, #4a1a8a 50%, #e94560 75%, #1a0a2e 100%)",
          backgroundSize: "300% 300%", animation: introPhase >= 2 ? "gradientShift 12s ease-in-out infinite" : "none",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          transition: "background 1.5s ease",
        }}>
          {/* Speed lines behind everything */}
          {introPhase >= 2 && (
            <div aria-hidden="true" style={{ position: "absolute", inset: "-20%",
              background: "repeating-conic-gradient(from 0deg at 50% 55%, rgba(255,255,255,0.015) 0deg 0.8deg, transparent 0.8deg 5deg)",
              pointerEvents: "none" }} />
          )}

          {/* PHASE 0+1: Typewriter */}
          {introPhase < 2 && (
            <div style={{ textAlign: "center", padding: 20 }}>
              {introPhase >= 1 && (
                <p style={{ fontFamily: "'Noto Serif JP',serif", fontSize: "clamp(16px,3vw,22px)", color: "#a0a0b0",
                  letterSpacing: 1, minHeight: "1.5em" }}>
                  {typeText}
                  {typeText.length < introLine.length && <span style={{ borderRight: "2px solid var(--glow-cool)", animation: "blink .8s step-end infinite" }}>&nbsp;</span>}
                </p>
              )}
            </div>
          )}

          {/* PHASE 2: Full hero reveal */}
          {introPhase >= 2 && (
            <div style={{ animation: "sectionRise 1s ease-out", width: "100%", textAlign: "center",
              animationName: "ambientDrift", animationDuration: "20s", animationTimingFunction: "ease-in-out", animationIterationCount: "infinite" }}>

              {/* TAGLINE — top, straight, centred */}
              <div style={{ marginBottom: 40, padding: "0 16px" }}>
                <h2 style={{ fontFamily: "'Zen Dots',cursive", fontSize: "clamp(13px,2.8vw,22px)", color: ultraMode ? "#ffd93d" : "#e8e8e8",
                  textTransform: "uppercase", letterSpacing: "clamp(2px,0.5vw,6px)", lineHeight: 1.6,
                  textShadow: ultraMode ? "0 0 15px #ffd93d, 0 0 30px #ffd93d55" : "0 0 10px rgba(101,31,255,0.4)",
                  textAlign: "center", fontWeight: 400 }}>
                  {ultraMode ? "ULTRA LEGEND MODE: ACTIVATED" : "THE POWER OF THE THREE GREATS AWAKENS THE LEGENDS"}
                </h2>
              </div>

              {/* THREE CHARACTERS */}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "clamp(12px,3vw,40px)", marginBottom: 24, flexWrap: "wrap" }}>
                {/* Gojo — real image */}
                <div style={{ textAlign: "center", animation: "floatY 4s ease-in-out infinite", animationDelay: "0s" }}>
                  <div style={{ width: "clamp(140px,20vw,220px)", height: "clamp(180px,26vw,300px)", borderRadius: 16, overflow: "hidden",
                    border: "2px solid rgba(0,102,255,0.4)", boxShadow: "0 0 30px rgba(0,102,255,0.3), 0 8px 32px rgba(0,0,0,0.5)",
                    position: "relative" }}>
                    <img src="/gojo.jpeg" alt="Gojo Satoru" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,102,255,0.3) 0%, transparent 40%)", pointerEvents: "none" }} />
                  </div>
                  <p style={{ fontFamily: "'Zen Dots',cursive", fontSize: 13, color: "#ffffff", textTransform: "uppercase", letterSpacing: 3,
                    marginTop: 10, textShadow: "0 0 12px #0066ff, 0 0 24px #0066ff88, 0 0 4px #fff", fontWeight: 700 }}>JUJUTSU KAISEN</p>
                </div>
                {/* Max — center, elevated, 5X SIZE */}
                <div style={{ textAlign: "center", marginBottom: 20, animation: "floatY 4s ease-in-out infinite", animationDelay: "0.5s", zIndex: 2 }}>
                  <div style={{ filter: "drop-shadow(0 0 40px #7c4dff) drop-shadow(0 0 80px rgba(255,215,61,0.3))" }}>
                    <MaxSVG glow="#7c4dff" />
                  </div>
                  <p style={{ fontFamily: "'Zen Dots',cursive", fontSize: "clamp(13px,2vw,18px)", color: "#ffd93d", textTransform: "uppercase", letterSpacing: 4,
                    marginTop: 10, textShadow: "0 0 12px #ffd93d55" }}>THE CREATIVE LEGEND</p>
                </div>
                {/* Tanjiro — real image */}
                <div style={{ textAlign: "center", animation: "floatY 4s ease-in-out infinite", animationDelay: "1s" }}>
                  <div style={{ width: "clamp(140px,20vw,220px)", height: "clamp(180px,26vw,300px)", borderRadius: 16, overflow: "hidden",
                    border: "2px solid rgba(233,69,96,0.4)", boxShadow: "0 0 30px rgba(233,69,96,0.3), 0 8px 32px rgba(0,0,0,0.5)",
                    position: "relative" }}>
                    <img src="/tanjiro.jpg" alt="Tanjiro Kamado" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(233,69,96,0.3) 0%, transparent 40%)", pointerEvents: "none" }} />
                  </div>
                  <p style={{ fontFamily: "'Zen Dots',cursive", fontSize: 13, color: "#ffffff", textTransform: "uppercase", letterSpacing: 3,
                    marginTop: 10, textShadow: "0 0 12px #e94560, 0 0 24px #e9456088, 0 0 4px #fff", fontWeight: 700 }}>DEMON SLAYER</p>
                </div>
              </div>

              {/* Welcome text */}
              <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(13px,2vw,16px)", color: "#c0c0c8", maxWidth: 500, margin: "0 auto", lineHeight: 1.7, padding: "0 20px" }}>
                Hi my name is Max, welcome to my website! I hope you enjoy learning about manga and anime. Thank you!
              </p>

              {/* Episode nav dots */}
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 36 }}>
                {["Hero", "Stats", "Manga", "Quotes", "Secret"].map((s, i) => (
                  <a key={s} href={`#section-${i}`} style={{ width: i === 0 ? 28 : 10, height: 10, borderRadius: 5, border: "none",
                    background: i === 0 ? "var(--glow-cool)" : "rgba(255,255,255,0.2)", display: "block", textDecoration: "none",
                    boxShadow: i === 0 ? "0 0 10px var(--glow-cool)" : "none", transition: "all 0.3s" }} />
                ))}
              </div>

              {/* Max name — bottom-left, 5X SIZE */}
              <div style={{ position: "absolute", bottom: 24, left: 24 }}>
                <span style={{ fontFamily: "'Zen Dots',cursive", fontSize: 70, color: ultraMode ? "#ffd93d" : "rgba(255,255,255,0.7)",
                  letterSpacing: 6, textTransform: "uppercase", textShadow: ultraMode ? "0 0 20px #ffd93d, 0 0 40px #ffd93d55" : "0 0 15px rgba(124,77,255,0.4), 0 0 30px rgba(0,102,255,0.2)", lineHeight: 1 }}>
                  Max {ultraMode && <span style={{ background: "#ffd93d", color: "#0a0514", padding: "4px 12px", borderRadius: 8, fontSize: 20, marginLeft: 12, verticalAlign: "middle", fontFamily: "'Space Mono',monospace" }}>ULTRA</span>}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════
            QUOTES STRIP
            ═══════════════════════════════════════════════════════ */}
        <section style={{ background: "linear-gradient(135deg, #0a0030 0%, #0066ff22 25%, #4a1a8a44 50%, #e9456022 75%, #0a0030 100%)", backgroundSize: "300% 300%", animation: "gradientShift 20s ease-in-out infinite", padding: "60px 20px" }}>
          {quotes.map((q, i) => {
            const [ref, vis] = useScrollReveal();
            return (
              <div key={i} ref={ref} style={{ textAlign: "center", maxWidth: 650, margin: "0 auto 40px",
                opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)", transition: `all 0.6s ease ${i * 0.15}s` }}>
                <p style={{ fontFamily: "'Noto Serif JP',serif", fontStyle: "italic", fontSize: "clamp(15px,2.5vw,20px)",
                  color: "#d0d0d8", lineHeight: 1.9, textShadow: `0 0 20px ${q.color}22` }}>
                  "{q.text}"
                </p>
                <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: q.color, textTransform: "uppercase",
                  letterSpacing: 2, marginTop: 10 }}>— {q.by}</p>
              </div>
            );
          })}
        </section>

        {/* ═══════════════════════════════════════════════════════
            CHARACTER STATS — THE THREE GREATS
            ═══════════════════════════════════════════════════════ */}
        <section id="section-1" style={{
          background: "linear-gradient(135deg, #0a0030 0%, #0066ff18 30%, #4a1a8a33 50%, #e9456018 70%, #0a0030 100%)",
          backgroundSize: "300% 300%", animation: "gradientShift 25s ease-in-out infinite",
          padding: "80px 20px",
        }}>
          {(() => { const [ref, vis] = useScrollReveal(); return (
            <div ref={ref} style={{ textAlign: "center", marginBottom: 50, opacity: vis ? 1 : 0,
              transform: vis ? "none" : "translateY(30px)", transition: "all 0.6s ease" }}>
              <div style={{ width: 12, height: 12, background: "var(--glow-cool)", transform: "rotate(45deg)",
                margin: "0 auto 20px", boxShadow: "0 0 12px var(--glow-cool)",
                animation: vis ? "breathe 3s ease-in-out infinite" : "none" }} />
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#a0a0b0", textTransform: "uppercase", letterSpacing: 4, marginBottom: 6 }}>Episode 02</p>
              <h2 style={{ fontFamily: "'Zen Dots',cursive", fontSize: "clamp(22px,5vw,36px)", color: "#e8e8e8", textTransform: "uppercase",
                letterSpacing: 4, textShadow: "0 0 10px rgba(101,31,255,0.3)" }}>THE THREE GREATS</h2>
            </div>
          );})()}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 960, margin: "0 auto" }}>
            {characters.map((c, ci) => {
              const [ref, vis] = useScrollReveal();
              const isMax = c.name === "Max";
              return (
                <div key={c.name} ref={ref} style={{
                  background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 24px", position: "relative", overflow: "hidden",
                  opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(30px) scale(0.97)",
                  transition: `all 0.7s ease ${ci * 0.15}s`,
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: `linear-gradient(90deg, transparent, ${c.color}, transparent)` }} />
                  <div style={{ textAlign: "center", marginBottom: 22 }}>
                    <h3 style={{ fontFamily: "'Zen Dots',cursive", fontSize: 20, color: "#e8e8e8", textTransform: "uppercase", letterSpacing: 3, marginBottom: 4 }}>{c.name}</h3>
                    <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: c.color, textTransform: "uppercase", letterSpacing: 3 }}>{c.title}</p>
                  </div>
                  {c.stats.map((s, si) => (
                    <StatBar key={s.l} label={s.l} value={s.v} color={isMax ? (si % 2 === 0 ? "#7c4dff" : "#ffd93d") : c.color}
                      delay={0.3 + si * 0.12} ultra={ultraMode && isMax} />
                  ))}
                  <div style={{ marginTop: 16, textAlign: "center" }}>
                    <p style={{ fontFamily: "'Noto Serif JP',serif", fontStyle: "italic", fontSize: 12, color: "#a0a0b0" }}>Signature</p>
                    <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: c.color, fontWeight: 600, letterSpacing: 1 }}>{c.sig}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            MANGA PAGES — DISCOVER THE LEGENDS
            ═══════════════════════════════════════════════════════ */}
        <section id="section-2" style={{
          background: "linear-gradient(135deg, #0a0030 0%, #0066ff15 20%, #4a1a8a30 45%, #e9456020 70%, #0a0030 100%)",
          backgroundSize: "300% 300%", animation: "gradientShift 22s ease-in-out infinite",
          padding: "80px 20px", position: "relative",
        }}>
          {(() => { const [ref, vis] = useScrollReveal(); return (
            <div ref={ref} style={{ textAlign: "center", marginBottom: 50, opacity: vis ? 1 : 0,
              transform: vis ? "none" : "translateY(30px)", transition: "all 0.6s ease" }}>
              <div style={{ width: 12, height: 12, background: "#e94560", transform: "rotate(45deg)",
                margin: "0 auto 20px", boxShadow: "0 0 12px #e94560", animation: vis ? "breathe 3s ease-in-out infinite" : "none" }} />
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#a0a0b0", textTransform: "uppercase", letterSpacing: 4, marginBottom: 6 }}>Episode 03</p>
              <h2 style={{ fontFamily: "'Zen Dots',cursive", fontSize: "clamp(22px,5vw,36px)", color: "#e8e8e8", textTransform: "uppercase",
                letterSpacing: 4, textShadow: "0 0 10px rgba(233,69,96,0.3)" }}>DISCOVER THE LEGENDS</h2>
              <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, color: "#a0a0b0", marginTop: 12, maxWidth: 450, margin: "12px auto 0" }}>
                Each page is a gateway into a legendary manga world. Explore the stories that shaped a generation.
              </p>
            </div>
          );})()}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 960, margin: "0 auto" }}
            className={pageTurn ? "page-turning" : ""}>
            {mangaPages.map((m, i) => (
              <MangaCard key={m.title} manga={m} isActive={activeManga === i} onClick={() => handleMangaClick(i)} />
            ))}
          </div>

          {/* Expanded manga detail */}
          {activeManga !== null && !pageTurn && (
            <div className="page-turned-in" style={{ maxWidth: 700, margin: "40px auto 0", background: mangaPages[activeManga].bg,
              border: `2px solid ${mangaPages[activeManga].accent}44`, borderRadius: 16, padding: 32, position: "relative", overflow: "hidden" }}>
              <div aria-hidden="true" style={{ position: "absolute", inset: 0,
                background: `repeating-conic-gradient(rgba(255,255,255,0.01) 0deg 0.6deg, transparent 0.6deg 4deg)`, pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h3 style={{ fontFamily: "'Zen Dots',cursive", fontSize: 28, color: mangaPages[activeManga].accent,
                  textTransform: "uppercase", letterSpacing: 4, marginBottom: 16,
                  textShadow: `0 0 15px ${mangaPages[activeManga].accent}44` }}>{mangaPages[activeManga].title}</h3>
                <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, color: "#d0d0d8", lineHeight: 1.8, marginBottom: 16 }}>
                  {mangaPages[activeManga].desc}
                </p>
                <p style={{ fontFamily: "'Noto Serif JP',serif", fontStyle: "italic", fontSize: 14, color: mangaPages[activeManga].accent, opacity: 0.8 }}>
                  Click another manga page to turn the page...
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECOND QUOTES — More Inspiration
            ═══════════════════════════════════════════════════════ */}
        <section id="section-3" style={{ background: "linear-gradient(135deg, #0a0030 0%, #4a1a8a30 40%, #0066ff18 60%, #e9456015 80%, #0a0030 100%)", backgroundSize: "300% 300%", animation: "gradientShift 18s ease-in-out infinite", padding: "70px 20px" }}>
          {(() => { const [ref, vis] = useScrollReveal(); return (
            <div ref={ref} style={{ textAlign: "center", maxWidth: 600, margin: "0 auto",
              opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(25px)", transition: "all 0.7s ease" }}>
              <p style={{ fontFamily: "'Zen Dots',cursive", fontSize: "clamp(16px,3.5vw,26px)", color: "#ffd93d",
                textTransform: "uppercase", letterSpacing: 3, lineHeight: 1.8,
                textShadow: "0 0 12px rgba(255,215,61,0.3), 0 0 30px rgba(255,215,61,0.15)" }}>
                THE POWER OF THE THREE GREATS AWAKENS THE LEGENDS
              </p>
              <div style={{ width: 50, height: 2, background: "linear-gradient(90deg, transparent, #ffd93d, transparent)", margin: "24px auto" }} />
              <p style={{ fontFamily: "'Noto Serif JP',serif", fontStyle: "italic", fontSize: 15, color: "#a0a0b0", lineHeight: 1.8 }}>
                Three heroes. Three paths. One legendary story.
              </p>
            </div>
          );})()}
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECRET ULTRA SUPER CODE
            ═══════════════════════════════════════════════════════ */}
        <section id="section-4" style={{
          background: "linear-gradient(135deg, #0a0030 0%, #0066ff15 25%, #4a1a8a30 50%, #e9456018 75%, #0a0030 100%)", backgroundSize: "300% 300%", animation: "gradientShift 24s ease-in-out infinite", padding: "80px 20px", position: "relative",
        }}>
          {/* Subtle ? hint */}
          {(() => { const [ref, vis] = useScrollReveal(); return (
            <div ref={ref} style={{ maxWidth: 420, margin: "0 auto", textAlign: "center",
              opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(30px)", transition: "all 0.7s ease" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffd93d", margin: "0 auto 20px",
                boxShadow: "0 0 12px #ffd93d", animation: "breathe 2s ease-in-out infinite" }} />
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#a0a0b0", textTransform: "uppercase",
                letterSpacing: 3, marginBottom: 20 }}>SECRET TRANSMISSION TERMINAL</p>

              {/* Scan lines */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: 24, position: "relative", overflow: "hidden" }}>
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none",
                  background: "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 3px)" }} />

                <label style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: ultraMode ? "#ffd93d" : "#651fff",
                  textTransform: "uppercase", letterSpacing: 3, display: "block", marginBottom: 10, position: "relative" }}>
                  {ultraMode ? "// ULTRA MODE ACTIVE //" : "ENTER SECRET CODE:"}
                </label>
                <input
                  type="text"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSecretSubmit()}
                  disabled={ultraMode}
                  placeholder={ultraMode ? "LEGENDARY STATUS ACHIEVED" : "Type the secret code..."}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "none",
                    borderBottom: `2px solid ${ultraMode ? "#ffd93d" : "rgba(255,255,255,0.1)"}`, borderRadius: "8px 8px 0 0",
                    color: "#e8e8e8", fontFamily: "'Space Mono',monospace", fontSize: 14, padding: "12px 14px",
                    outline: "none", textAlign: "center", letterSpacing: 2, position: "relative",
                    boxShadow: ultraMode ? "0 0 15px rgba(255,215,61,0.15)" : "none" }}
                />
                {!ultraMode && (
                  <button onClick={handleSecretSubmit}
                    style={{ marginTop: 16, width: "100%", padding: "12px 24px", fontFamily: "'Space Mono',monospace",
                      fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3,
                      color: "#e8e8e8", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(101,31,255,0.4)",
                      borderRadius: 8, cursor: "pointer", position: "relative", transition: "all 0.3s" }}>
                    TRANSMIT
                  </button>
                )}
              </div>

              {!ultraMode && (
                <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: "#555", marginTop: 16, fontStyle: "italic" }}>
                  Hint: Only true legends know the code...
                </p>
              )}
            </div>
          );})()}
        </section>

        {/* ═══════════════════════════════════════════════════════
            ULTRA SECRET BONUS SECTION (hidden until Ultra Mode)
            ═══════════════════════════════════════════════════════ */}
        {ultraMode && (
          <section style={{
            background: "linear-gradient(135deg, #0a0030 0%, #4a1a8a35 30%, #0066ff20 50%, #e9456020 70%, #0a0030 100%)",
            backgroundSize: "300% 300%", animation: "gradientShift 20s ease-in-out infinite",
            padding: "80px 20px", textAlign: "center",
          }}>
            {(() => { const [ref, vis] = useScrollReveal(); return (
              <div ref={ref} style={{ maxWidth: 600, margin: "0 auto",
                opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(40px)", transition: "all 0.8s ease" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #ffd93d, #7c4dff)",
                  margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 30px #ffd93d44, 0 0 60px #7c4dff22", animation: "breathe 3s ease-in-out infinite" }}>
                  <span style={{ fontSize: 28 }}>⚡</span>
                </div>
                <h2 style={{ fontFamily: "'Zen Dots',cursive", fontSize: "clamp(20px,5vw,32px)", color: "#ffd93d",
                  textTransform: "uppercase", letterSpacing: 4, marginBottom: 16,
                  textShadow: "0 0 12px rgba(255,215,61,0.4)" }}>
                  YOU FOUND THE LEGENDARY SECRET
                </h2>
                <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, color: "#d0d0d8", lineHeight: 1.8, marginBottom: 20 }}>
                  You have proven yourself worthy. You cracked the code. You activated Ultra Super Mode.
                  You are now officially part of the Three Greats.
                </p>
                <div style={{ background: "rgba(255,215,61,0.05)", border: "1px solid rgba(255,215,61,0.15)",
                  borderRadius: 12, padding: 24, marginBottom: 24 }}>
                  <p style={{ fontFamily: "'Noto Serif JP',serif", fontStyle: "italic", fontSize: 18, color: "#ffd93d", lineHeight: 1.8 }}>
                    "The strongest power isn't cursed energy or breathing techniques — it's the imagination to create something that has never existed before."
                  </p>
                  <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#7c4dff", textTransform: "uppercase",
                    letterSpacing: 2, marginTop: 10 }}>— Max, The Creative Legend</p>
                </div>
                <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, color: "#a0a0b0", lineHeight: 1.7 }}>
                  Max is an 11-year-old creative powerhouse who channels the energy of Gojo's confidence, Tanjiro's determination, and his own limitless imagination into everything he does. He plays soccer, swims, and builds entire worlds in his mind. This website is proof: creativity IS the ultimate power.
                </p>
                <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  {["Creative", "Legendary", "Unstoppable", "Ultra"].map(t => (
                    <span key={t} style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, textTransform: "uppercase",
                      letterSpacing: 2, color: "#ffd93d", background: "rgba(255,215,61,0.08)", padding: "6px 14px", borderRadius: 20,
                      border: "1px solid rgba(255,215,61,0.2)" }}>{t}</span>
                  ))}
                </div>
              </div>
            );})()}
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            FOOTER — ED SEQUENCE
            ═══════════════════════════════════════════════════════ */}
        <section style={{
          background: "linear-gradient(135deg, #0a0030 0%, #0066ff 25%, #4a1a8a 50%, #e94560 75%, #0a0030 100%)",
          backgroundSize: "300% 300%", animation: "gradientShift 15s ease-in-out infinite", padding: "80px 20px", textAlign: "center", position: "relative",
        }}>
          {/* Stars */}
          {Array.from({ length: 30 }, (_, i) => (
            <div key={i} aria-hidden="true" style={{ position: "absolute",
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 2}px`, height: `${1 + Math.random() * 2}px`,
              borderRadius: "50%", background: "white", opacity: 0.2 + Math.random() * 0.4,
              animation: `breathe ${2 + Math.random() * 3}s ease-in-out infinite` }} />
          ))}

          {(() => { const [ref, vis] = useScrollReveal(); return (
            <div ref={ref} style={{ position: "relative", zIndex: 1,
              opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(40px)", transition: "all 1s ease" }}>
              <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 300, fontSize: 13, color: "#a0a0b0",
                letterSpacing: 1, lineHeight: 2.2, marginBottom: 8 }}>Created with love and late-night anime marathons</p>
              <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 300, fontSize: 12, color: "#707080",
                letterSpacing: 1, marginBottom: 32 }}>React • CSS Animations • SVG Characters • Pure Imagination</p>

              <h3 style={{ fontFamily: "'Zen Dots',cursive", fontSize: 24, color: "#e8e8e8", textTransform: "uppercase",
                letterSpacing: 6, animation: vis ? "titleBloom 1.5s ease-out 0.5s both" : "none" }}>MAX</h3>

              <p style={{ fontFamily: "'Noto Serif JP',serif", fontStyle: "italic", fontSize: 17, color: "#ffd93d",
                marginTop: 20, animation: "breathe 3s ease-in-out 1s infinite", opacity: 0.85 }}>
                To Be Continued...
              </p>

              <a href="#section-0" style={{ display: "inline-block", marginTop: 32, fontFamily: "'Space Mono',monospace",
                fontSize: 11, color: "#707080", textDecoration: "none", textTransform: "uppercase", letterSpacing: 2,
                transition: "color 0.3s" }}
                onMouseEnter={(e) => e.target.style.color = "#e8e8e8"}
                onMouseLeave={(e) => e.target.style.color = "#707080"}>
                ← Back to Episode 01
              </a>
            </div>
          );})()}
        </section>

      </main>
    </>
  );
}
