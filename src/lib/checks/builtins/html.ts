import type { CheckFn } from "../../../types";

// Allow extremely limited markup; otherwise flag.
const ALLOW = new Set(["b", "i", "u", "strong", "em", "br", "span"]);
const TAG_RX = /<\s*\/?\s*([a-z0-9:-]+)[^>]*>/gi;

export const htmlCheck: CheckFn = (value) => {
  let m: RegExpExecArray | null;
  const bad: string[] = [];
  while ((m = TAG_RX.exec(value))) {
    const tag = (m[1] || "").toLowerCase();
    if (!ALLOW.has(tag)) bad.push(tag);
  }
  const uniqueBad = Array.from(new Set(bad));
  return {
    name: "html",
    ok: bad.length === 0,
    message: bad.length ? `HTML not allowed: ${uniqueBad.slice(0, 5).join(", ")}` : undefined,
    details: bad.length ? { tags: uniqueBad } : undefined,
  };
};
