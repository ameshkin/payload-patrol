import type { CheckFn } from "../../../types";
import { safeRegexTest, validateInputLength } from "../security";

const rx = [
  /<\s*script\b/i,
  /\bon[a-z]+\s*=/i, // onclick= onload= …
  /\bjavascript\s*:/i,
  /\bdocument\./i,
  /\bwindow\./i,
  /\beval\s*\(/i,
];

export const scriptsCheck: CheckFn = (value) => {
  // Validate input length first
  if (!validateInputLength(value)) {
    return {
      name: "scripts",
      ok: false,
      message: "Input too long for validation",
      details: { reason: "length_exceeded" },
    };
  }

  const hits: string[] = [];
  for (const r of rx) {
    if (safeRegexTest(r, value)) {
      hits.push(r.source);
    }
  }

  // Strip dangerous content safely
  let stripped = value;
  if (hits.length > 0) {
    try {
      const stripRules = [
        /<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi,
        /\bon[a-z]+\s*=\s*["'][^"']*["']/gi,
        /\bjavascript\s*:[^)\s]+/gi
      ];
      for (const rule of stripRules) {
        rule.lastIndex = 0; // Reset regex state
        stripped = stripped.replace(rule, "");
      }
    } catch (error) {
      // If stripping fails, return original value
      stripped = value;
    }
  }

  return {
    name: "scripts",
    ok: hits.length === 0,
    message: hits.length ? "Inline script/event handler detected." : undefined,
    details: hits.length ? { rules: hits } : undefined,
    value: stripped, // enables adapter: 'strip'
  };
};
