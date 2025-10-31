import badwords from "@data/badwords.json"; // tsconfig resolves JSON
import type { CheckFn } from "@types";

// NOTE: badwords.json contains a mix of reserved words and slurs. Keep allowlist for legit cases.
const badSet = new Set((badwords as string[]).map(w => w.toLowerCase()));

export const badwordsCheck: CheckFn = (value, ctx) => {
  const allow = new Set((ctx?.allowlist ?? []).map(w => w.toLowerCase()));
  const tokens = value.toLowerCase().match(/[a-z0-9@.\-_'’]+/g) ?? [];
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
