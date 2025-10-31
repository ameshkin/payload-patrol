import { Issue } from "./types";

let PROFANITY: Set<string> | null = null;

export function registerProfanityList(words: string[]) {
  PROFANITY = new Set(words.map(w => w.toLowerCase()));
}

export function containsProfanity(s: string): boolean {
  if (!PROFANITY) return false;
  const tokens = s.toLowerCase().split(/[^a-z0-9]+/);
  return tokens.some(t => t && PROFANITY!.has(t));
}

export function preview(v: string, max = 50) {
  return v.length > max ? v.slice(0, max) + "…" : v;
}

const sqliPatterns: RegExp[] = [
  /(?:')?\s*or\s+(?:'1'='1|1=1)\s*/i,
  /;\s*(?:drop|truncate|shutdown|exec|insert|update|delete)\b/i,
  /--|\/\*/,
  /\bunion\s+select\b/i,
  /\bsleep\s*\(\s*\d+\s*\)/i
];

export function detectSQLi(s: string): boolean {
  return sqliPatterns.some(rx => rx.test(s));
}

const xssPatterns: RegExp[] = [
  /<\s*script\b/i,
  /\bon\w+\s*=/i,
  /\bjavascript\s*:/i,
  /<\s*img\b[^>]*\bonerror\s*=/i
];

export function detectXSS(s: string): boolean {
  return xssPatterns.some(rx => rx.test(s));
}

export function* walkStrings(value: unknown, path: (string|number)[] = []): Generator<{path:(string|number)[], value:string}> {
  if (typeof value === "string") {
    yield { path, value };
    return;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      yield* walkStrings(value[i], path.concat(i));
    }
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      yield* walkStrings(v, path.concat(k));
    }
  }
}

export function sanitizeString(input: string, opts: { collapseWhitespace?: boolean; stripControls?: boolean; normalize?: boolean; stripHTML?: boolean } = {}) {
  const { collapseWhitespace = true, stripControls = true, normalize = true, stripHTML = false } = opts;
  let s = String(input);
  if (normalize && s.normalize) s = s.normalize("NFC");
  if (stripControls) s = s.replace(/[\u0000-\u001F\u007F]/g, " ");
  if (collapseWhitespace) s = s.replace(/\s+/g, " ").trim();
  if (stripHTML) s = s.replace(/<[^>]+>/g, "");
  return s;
}