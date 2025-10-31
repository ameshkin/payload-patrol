import type { CheckFn } from "../types";

const rx = [
  /<\s*script\b/i,
  /\bon[a-z]+\s*=/i, // onclick= onload= …
  /\bjavascript\s*:/i,
  /\bdocument\./i,
  /\bwindow\./i,
  /\beval\s*\(/i,
];

export const scriptsCheck: CheckFn = (value) => {
  const hits = rx.filter(r => r.test(value)).map(r => r.source);
// inside scriptsCheck
  const stripRules = [/<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, /\bon[a-z]+\s*=\s*["'][^"']*["']/gi, /\bjavascript\s*:[^)\s]+/gi];
  const stripped = value.replace(stripRules[0], "").replace(stripRules[1], "").replace(stripRules[2], "");
  return {
    name: "scripts",
    ok: hits.length === 0,
    message: hits.length ? "Inline script/event handler detected." : undefined,
    details: hits.length ? { rules: hits } : undefined,
    value: stripped, // enables adapter: 'strip'
  };

};
