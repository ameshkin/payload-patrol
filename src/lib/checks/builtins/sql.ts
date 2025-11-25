import type { CheckFn } from "../../../types";
import { safeRegexTest, validateInputLength } from "../security";

// Heuristic detection of SQL injection-y patterns.
// Patterns are designed to be efficient and avoid ReDoS
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
  // Validate input length first
  if (!validateInputLength(value)) {
    return {
      name: "sql",
      ok: false,
      message: "Input too long for validation",
      details: { reason: "length_exceeded" },
    };
  }

  const hits: string[] = [];
  for (const rx of suspicious) {
    if (safeRegexTest(rx, value)) {
      hits.push(rx.source);
      if (hits.length >= 5) break; // Limit to 5 matches
    }
  }

  return {
    name: "sql",
    ok: hits.length === 0,
    message: hits.length ? "Looks like SQL or injection patterns." : undefined,
    details: hits.length ? { rules: hits } : undefined,
  };
};
