import type { CheckFn } from "../../../types";
import { safeRegexExec, validateInputLength } from "../security";

// Allow extremely limited markup; otherwise flag.
const ALLOW = new Set(["b", "i", "u", "strong", "em", "br", "span"]);
const TAG_RX = /<\s*\/?\s*([a-z0-9:-]+)[^>]*>/gi;

export const htmlCheck: CheckFn = (value) => {
  // Validate input length first
  if (!validateInputLength(value)) {
    return {
      name: "html",
      ok: false,
      message: "Input too long for validation",
      details: { reason: "length_exceeded" },
    };
  }

  const bad: string[] = [];
  let iterations = 0;
  const maxIterations = 1000; // Prevent excessive regex execution
  
  // Reset regex state
  TAG_RX.lastIndex = 0;
  
  let m: RegExpExecArray | null;
  let lastIndex = -1;
  while (iterations < maxIterations) {
    // Use regex.exec directly in the loop to maintain state
    try {
      m = TAG_RX.exec(value);
    } catch (error) {
      break;
    }
    
    if (m === null) {
      break;
    }
    
    iterations++;
    const tag = (m[1] || "").toLowerCase();
    if (!ALLOW.has(tag)) {
      bad.push(tag);
    }
    
    // Prevent infinite loops - if lastIndex didn't advance, break
    if (TAG_RX.lastIndex === lastIndex) {
      TAG_RX.lastIndex++;
    }
    lastIndex = TAG_RX.lastIndex;
    
    // Safety check: if we're stuck, break
    if (TAG_RX.lastIndex >= value.length) {
      break;
    }
  }
  
  const uniqueBad = Array.from(new Set(bad));
  return {
    name: "html",
    ok: bad.length === 0,
    message: bad.length ? `HTML not allowed: ${uniqueBad.slice(0, 5).join(", ")}` : undefined,
    details: bad.length ? { tags: uniqueBad } : undefined,
  };
};
