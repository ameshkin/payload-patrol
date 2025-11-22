import badwordsSevere from "../../../../data/en/severe.json";
import type { CheckFn } from "../../../types";

// NOTE: Uses English severe profanity by default. Use registerBadwords() to customize.
const defaultBadSet = new Set((badwordsSevere as string[]).map(w => w.toLowerCase()));

// Allow runtime registration of additional profanity
let customBadwords: Set<string> | null = null;

export function registerBadwords(words: string[]) {
  customBadwords = new Set(words.map(w => w.toLowerCase()));
}

export const badwordsCheck: CheckFn = (value, ctx) => {
  // Merge default and custom badwords
  const badSet = customBadwords || defaultBadSet;
  
  const allow = new Set((ctx?.allowlist ?? []).map(w => w.toLowerCase()));
  const tokens = value.toLowerCase().match(/[a-z0-9@.\-_'']+/g) ?? [];
  const hits: string[] = [];
  for (const t of tokens) {
    if (allow.has(t)) continue;
    if (badSet.has(t)) hits.push(t);
  }
  return {
    name: "badwords",
    ok: hits.length === 0,
    message: hits.length ? `Contains blocked terms: ${[...new Set(hits)].slice(0, 5).join(", ")}` : undefined,
    details: hits.length ? { hits } : undefined,
  };
};
