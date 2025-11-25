import { getCheck } from "./registry";
import type { AdapterMode, CheckContext, CheckName, RunChecksOptions, RunChecksResult } from "../../types";

/**
 * runChecks
 * Inputs: value (string), list of check names, optional context and adapter options.
 * Output: aggregate result with per-check results and possibly sanitized value.
 */
export async function runChecks(
  value: string,
  checks: Array<CheckName>,
  ctx?: CheckContext,
  opts?: RunChecksOptions
): Promise<RunChecksResult> {
  // Validate input type
  if (typeof value !== "string") {
    return {
      ok: false,
      results: [{
        name: "limit" as CheckName,
        ok: false,
        message: "Value must be a string",
      }],
      value,
    };
  }

  // Limit number of checks to prevent DoS
  const maxChecks = 100;
  const limitedChecks = checks.slice(0, maxChecks);

  const mode: AdapterMode = opts?.adapter ?? "block";
  const stopOnFirstBlock = opts?.stopOnFirstBlock ?? true;

  let current = value;
  const results = [];

  for (const name of limitedChecks) {
    try {
      const check = getCheck(name);
      const { run } = check;
      const res = await Promise.resolve(run(current, ctx));
      results.push(res);

      if (!res.ok) {
        if (mode === "strip" && typeof res.value === "string") {
          current = res.value;
          continue;
        }
        if (mode === "block" && stopOnFirstBlock) {
          return { ok: false, results, value: current };
        }
      }
    } catch (error) {
      // If a check throws, record it as a failure
      results.push({
        name,
        ok: false,
        message: error instanceof Error ? error.message : "Check execution failed",
        details: { error: "execution_failed" },
      });
      
      if (mode === "block" && stopOnFirstBlock) {
        return { ok: false, results, value: current };
      }
    }
  }

  // In warn mode, continue processing but still return ok: false if issues found
  // In strip mode, return ok: true if we successfully processed (even if we stripped)
  // In block mode, return ok: false if any check failed
  const ok = mode === "strip" ? true : results.every(r => r.ok);
  return { ok, results, value: current };
}

/**
 * adaptStrip
 * Inputs: original value and regexes to remove.
 * Output: sanitized value with patterns stripped.
 */
export function adaptStrip(value: string, patterns: RegExp[]) {
  let out = value;
  for (const p of patterns) out = out.replace(p, "");
  return out;
}
