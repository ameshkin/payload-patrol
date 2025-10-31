import type { CheckFn } from "../types";

// Heuristic detection of SQL injection-y patterns.
const suspicious = [
  /\bunion\b\s+\bselect\b/i,
  /\bselect\b.+\bfrom\b/i,
  /(--|#).+$/m,
  /\/\*[\s\S]*?\*\//,
  /\bor\s+1\s*=\s*1\b/i,
  /\bdrop\s+(table|database)\b/i,
  /\binsert\s+into\b/i,
  /\bupdate\b.+\bset\b/i,
  /\bdelete\s+from\b/i,
  /\bsleep\s*\(/i,
  /\bxp_cmdshell\b/i,
  /;{2,}/,
];

export const sqlCheck: CheckFn = (value) => {
  const hits = suspicious.filter(rx => rx.test(value)).map(rx => rx.source).slice(0, 5);
  return {
    name: "sql",
    ok: hits.length === 0,
    message: hits.length ? "Looks like SQL or injection patterns." : undefined,
    details: hits.length ? { rules: hits } : undefined,
  };
};
