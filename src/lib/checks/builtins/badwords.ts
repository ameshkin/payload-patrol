import badwordsSevereData from "../../../../data/en/severe.json";
import type { CheckFn } from "../../../types";
import { safeRegexMatch, validateInputLength } from "../security";

// NOTE: Uses English severe profanity by default. Use registerBadwords() to customize.
const badwordsSevere = badwordsSevereData as string[];
const defaultBadSet = new Set(badwordsSevere.map(w => w.toLowerCase()));

// Allow runtime registration of additional profanity
let customBadwords: Set<string> | null = null;

export function registerBadwords(words: string[]) {
  // Validate and sanitize input
  if (!Array.isArray(words)) {
    throw new TypeError("registerBadwords expects an array of strings");
  }
  
  // Limit word list size to prevent memory exhaustion
  const maxWords = 10000;
  const limitedWords = words.slice(0, maxWords);
  
  customBadwords = new Set(limitedWords.map(w => {
    if (typeof w !== "string") return "";
    return w.toLowerCase().trim();
  }).filter(Boolean));
}

export const badwordsCheck: CheckFn = (value, ctx) => {
  // Validate input length first
  if (!validateInputLength(value)) {
    return {
      name: "badwords",
      ok: false,
      message: "Input too long for validation",
      details: { reason: "length_exceeded" },
    };
  }

  // Merge default and custom badwords
  const badSet = customBadwords || defaultBadSet;
  
  const allow = new Set((ctx?.allowlist ?? []).map(w => {
    if (typeof w !== "string") return "";
    return w.toLowerCase().trim();
  }).filter(Boolean));
  
  const tokenRegex = /[a-z0-9@.\-_'']+/g;
  const tokens = safeRegexMatch(tokenRegex, value.toLowerCase()) ?? [];
  
  const hits: string[] = [];
  const maxTokens = 10000; // Prevent excessive iteration
  for (let i = 0; i < Math.min(tokens.length, maxTokens); i++) {
    const t = tokens[i];
    if (!t || allow.has(t)) continue;
    if (badSet.has(t)) {
      hits.push(t);
      if (hits.length >= 100) break; // Limit hits
    }
  }
  
  const uniqueHits = Array.from(new Set(hits));
  return {
    name: "badwords",
    ok: hits.length === 0,
    message: hits.length ? `Contains blocked terms: ${uniqueHits.slice(0, 5).join(", ")}` : undefined,
    details: hits.length ? { hits: uniqueHits } : undefined,
  };
};
