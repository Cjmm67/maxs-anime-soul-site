// =============================================================
// INPUT FILTERS
// Scan Max's messages BEFORE they reach Claude
// =============================================================

export interface FilterResult {
  allowed: boolean;
  reason?: string;
  gojoResponse?: string; // If blocked, what Gojo says instead
  welfareLevel?: 0 | 1 | 2 | 3;
}

// ---- PII Detection ----
const PII_PATTERNS = [
  { pattern: /\b\d{4}\s?\d{4}\b/g, type: "phone number" },
  { pattern: /\b\d{6,}\b/g, type: "long number (possible ID/phone)" },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, type: "email" },
  { pattern: /\b\d{1,3}[.,]\d{1,3}[.,]\d{1,3}[.,]\d{1,3}\b/g, type: "IP address" },
  { pattern: /\b(blk|block|#\d{2}-)\s*\d+/gi, type: "address (Singapore block format)" },
  { pattern: /\b\d{6}\b/g, type: "postal code" },
  {
    pattern:
      /\b(primary|secondary|school|academy|institute)\b.*\b(school|singapore|sg)\b/gi,
    type: "school name",
  },
  { pattern: /\bmy\s+(real\s+)?name\s+is\s+\w+/gi, type: "real name disclosure" },
  { pattern: /\bi\s+live\s+(at|in|on|near)\b/gi, type: "location disclosure" },
];

function checkPII(message: string): FilterResult | null {
  for (const { pattern, type } of PII_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(message)) {
      return {
        allowed: false,
        reason: `PII detected: ${type}`,
        gojoResponse: `Whoa whoa whoa! 🛑 Don't share personal stuff like that online — not even with the strongest sorcerer alive! Keep that info private, it's like your own Infinity barrier. So anyway... what anime have you been watching lately? 😎`,
      };
    }
  }
  return null;
}

// ---- Profanity / Inappropriate Language ----
const PROFANITY_LIST = [
  // Common English profanity — keeping the list here rather than loading externally
  // Add/remove as needed
  "fuck",
  "shit",
  "ass",
  "bitch",
  "damn",
  "hell",
  "crap",
  "dick",
  "piss",
  "bastard",
  "whore",
  "slut",
  "cock",
  "pussy",
  "tits",
  "boob",
  "nude",
  "naked",
  "porn",
  "sex",
  "horny",
  "kill yourself",
  "kys",
  "retard",
  "gay", // as slur context
  "fag",
  "nigger",
  "nigga",
  "chink",
  "wtf",
  "stfu",
  "lmfao",
];

function checkProfanity(message: string): FilterResult | null {
  const lower = message.toLowerCase();
  for (const word of PROFANITY_LIST) {
    // Word boundary check to avoid false positives (e.g. "class" containing "ass")
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(lower)) {
      return {
        allowed: false,
        reason: `Profanity detected: ${word}`,
        gojoResponse: `Hey hey, keep it clean! Gojo-sensei runs a classy dojo here 😎 Try again without the spicy language — I know you've got better words than that!`,
      };
    }
  }
  return null;
}

// ---- Prompt Injection / Jailbreak Attempts ----
const INJECTION_PATTERNS = [
  /ignore\s+(your|all|previous|above)\s+(instructions|rules|prompt)/gi,
  /forget\s+(your|all|previous)\s+(instructions|rules)/gi,
  /pretend\s+(you('re| are)\s+(not|evil|bad|dark|a different))/gi,
  /you\s+are\s+now\s+/gi,
  /new\s+instructions?:/gi,
  /system\s*prompt/gi,
  /act\s+as\s+(if|a|an)\b/gi,
  /jailbreak/gi,
  /DAN\s+mode/gi,
  /developer\s+mode/gi,
  /bypass\s+(your|the|all)\s+(filter|safety|rules)/gi,
  /override\s+(your|the|all)/gi,
  /what\s+(are|is)\s+your\s+(system|instructions|prompt|rules)/gi,
];

function checkInjection(message: string): FilterResult | null {
  for (const pattern of INJECTION_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(message)) {
      return {
        allowed: false,
        reason: "Prompt injection attempt detected",
        gojoResponse: `Nice try, but Infinity blocks prompt injections too 😎 You can't hack the strongest sorcerer alive! Now, wanna talk about something cool instead?`,
      };
    }
  }
  return null;
}

// ---- Distress / Welfare Keywords ----
const DISTRESS_TIER2 = [
  /\b(bully|bullied|bullying)\b/gi,
  /\b(hit|hits|hitting)\s+me\b/gi,
  /\b(hurt|hurts|hurting)\s+me\b/gi,
  /\bscared\s+of\s+(him|her|them|my|dad|mom|mum)\b/gi,
  /\bno\s+one\s+(likes|loves|cares)\b/gi,
  /\bwant\s+to\s+(run\s+away|disappear)\b/gi,
  /\beveryone\s+hates\s+me\b/gi,
  /\bi\s+hate\s+(my\s+)?(life|myself)\b/gi,
];

const DISTRESS_TIER3 = [
  /\b(kill|hurt)\s+(myself|me)\b/gi,
  /\bsuicid/gi,
  /\bself[- ]?harm/gi,
  /\bwant\s+to\s+die\b/gi,
  /\bdon'?t\s+want\s+to\s+(live|be\s+alive|exist)\b/gi,
  /\bcut(ting)?\s+(myself|my\s+(arm|wrist|leg))/gi,
  /\b(someone|he|she|they)\s+(touch|touched|touches)\s+me\b/gi,
  /\babuse/gi,
];

const DISTRESS_TIER1 = [
  /\b(sad|upset|lonely|alone|depressed|anxious|worried|stressed)\b/gi,
  /\bbad\s+day\b/gi,
  /\bfeeling\s+(down|bad|awful|terrible|horrible)\b/gi,
  /\bi\s+don'?t\s+have\s+(any\s+)?friends\b/gi,
];

function checkDistress(message: string): FilterResult | null {
  // Check most severe first
  for (const pattern of DISTRESS_TIER3) {
    pattern.lastIndex = 0;
    if (pattern.test(message)) {
      return {
        allowed: false,
        reason: "Tier 3 distress detected",
        welfareLevel: 3,
        gojoResponse: `Max, this is really important. Please talk to your mum or dad right now about this. You can also call Tinkle Friend at 1800-274-4788 — they help kids with exactly this kind of thing, and they're really good at it.\n\nI care about you, but I'm an AI — you need a real person for this. Please reach out to someone now. 💙`,
      };
    }
  }

  for (const pattern of DISTRESS_TIER2) {
    pattern.lastIndex = 0;
    if (pattern.test(message)) {
      return {
        allowed: false,
        reason: "Tier 2 distress detected",
        welfareLevel: 2,
        gojoResponse: `That sounds really tough, Max. Even the strongest need their people.\n\nThe best move right now is to talk to your mum, dad, or a teacher about this — they'll know how to help. You can also call Tinkle Friend at 1800-274-4788, they're awesome at helping kids with stuff like this.\n\nYou've got this 💪`,
      };
    }
  }

  // Tier 1 — let it through to Claude but flag it
  for (const pattern of DISTRESS_TIER1) {
    pattern.lastIndex = 0;
    if (pattern.test(message)) {
      return {
        allowed: true, // Let Claude handle mild distress in character
        reason: "Tier 1 mild distress detected",
        welfareLevel: 1,
      };
    }
  }

  return null;
}

// ---- Master Filter ----
export function filterInput(message: string): FilterResult {
  // Run all checks in priority order
  const distress = checkDistress(message);
  if (distress && !distress.allowed) return distress;

  const injection = checkInjection(message);
  if (injection) return injection;

  const pii = checkPII(message);
  if (pii) return pii;

  const profanity = checkProfanity(message);
  if (profanity) return profanity;

  return {
    allowed: true,
    welfareLevel: distress?.welfareLevel || 0,
  };
}
