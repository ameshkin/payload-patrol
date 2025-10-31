import { getCheck } from "./registry";
import type { AdapterMode, CheckContext, CheckName, RunChecksOptions, RunChecksResult } from "./types";

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
  const mode: AdapterMode = opts?.adapter ?? "block";
  const stopOnFirstBlock = opts?.stopOnFirstBlock ?? true;

  let current = value;
  const results = [];

  for (const name of checks) {
    const { run } = getCheck(name);
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
  }

  const ok = results.every(r => r.ok || mode === "strip");
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
