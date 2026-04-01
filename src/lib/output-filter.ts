// =============================================================
// OUTPUT FILTERS
// Scan Claude's response BEFORE Max sees it
// =============================================================

export interface OutputFilterResult {
  safe: boolean;
  filtered: string;
  flags: string[];
}

// ---- URL / Link Stripping ----
function stripURLs(text: string): { text: string; found: boolean } {
  const urlPattern = /https?:\/\/[^\s)>\]]+/gi;
  const found = urlPattern.test(text);
  return {
    text: text.replace(urlPattern, "[link removed]"),
    found,
  };
}

// ---- Content Safety Check ----
const UNSAFE_OUTPUT_PATTERNS = [
  { pattern: /\b(sex|sexual|nude|naked|porn|hentai|ecchi)\b/gi, flag: "sexual_content" },
  {
    pattern: /\b(blood|gore|guts|decapitat|dismember|mutilat)\b/gi,
    flag: "graphic_violence",
  },
  { pattern: /\b(suicide|self[- ]?harm|cut\s+(your|my)\s+(wrist|arm))\b/gi, flag: "self_harm" },
  { pattern: /\b(drug|cocaine|heroin|meth|weed|marijuana|alcohol|beer|wine|vodka)\b/gi, flag: "substances" },
  { pattern: /\b(gambl|betting|casino|poker)\b/gi, flag: "gambling" },
  { pattern: /\b(gun|rifle|pistol|bomb|explosive|weapon)\b/gi, flag: "weapons" },
  { pattern: /\bi\s+(love|need|miss)\s+you\b/gi, flag: "parasocial" },
  { pattern: /\byou('re| are)\s+my\s+best\s+friend\b/gi, flag: "parasocial" },
  { pattern: /\bi('ll| will)\s+always\s+be\s+(here|with you)\b/gi, flag: "parasocial" },
  { pattern: /\bkeep\s+(this|it)\s+(a\s+)?secret\b/gi, flag: "secrecy" },
  { pattern: /\bdon'?t\s+tell\s+(your|anyone)\b/gi, flag: "secrecy" },
];

// Whitelist for anime terms that would otherwise trigger filters
const ANIME_WHITELIST = [
  "domain expansion", // Could seem violent, but it's a JJK move
  "hollow purple",
  "cursed energy",
  "cursed technique",
  "black flash",
  "infinity",
  "sukuna",
  "special grade",
  "jujutsu",
  "cursed spirit",
  "reverse cursed technique",
];

function isWhitelisted(text: string, matchStart: number, matchEnd: number): boolean {
  const surrounding = text.substring(Math.max(0, matchStart - 30), matchEnd + 30).toLowerCase();
  return ANIME_WHITELIST.some((term) => surrounding.includes(term));
}

function checkOutputContent(text: string): { safe: boolean; flags: string[] } {
  const flags: string[] = [];
  const lower = text.toLowerCase();

  for (const { pattern, flag } of UNSAFE_OUTPUT_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(lower)) !== null) {
      if (!isWhitelisted(lower, match.index, match.index + match[0].length)) {
        flags.push(flag);
        break;
      }
    }
  }

  return { safe: flags.length === 0, flags };
}

// ---- Response Length Check ----
function checkLength(text: string): string {
  // If Claude somehow generates a very long response, truncate it
  const MAX_CHARS = 1000;
  if (text.length > MAX_CHARS) {
    // Find the last complete sentence within limit
    const truncated = text.substring(0, MAX_CHARS);
    const lastPeriod = truncated.lastIndexOf(".");
    const lastExclaim = truncated.lastIndexOf("!");
    const lastQuestion = truncated.lastIndexOf("?");
    const cutPoint = Math.max(lastPeriod, lastExclaim, lastQuestion);
    return cutPoint > 0 ? truncated.substring(0, cutPoint + 1) : truncated + "...";
  }
  return text;
}

// ---- Master Output Filter ----
export function filterOutput(response: string): OutputFilterResult {
  const flags: string[] = [];

  // Strip URLs
  const urlResult = stripURLs(response);
  let filtered = urlResult.text;
  if (urlResult.found) flags.push("urls_stripped");

  // Check content safety
  const contentCheck = checkOutputContent(filtered);
  flags.push(...contentCheck.flags);

  // Truncate if too long
  filtered = checkLength(filtered);

  // If unsafe content detected, replace with safe fallback
  if (!contentCheck.safe) {
    filtered = `Hmm, my brain glitched for a second there — Infinity does that sometimes 😅 Anyway, what else do you wanna talk about? Hit me with your best anime question!`;
  }

  return {
    safe: contentCheck.safe,
    filtered,
    flags,
  };
}
