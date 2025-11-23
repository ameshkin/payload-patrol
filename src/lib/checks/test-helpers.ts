import type { CheckResult } from "../../types";

/**
 * Helper to unwrap CheckResult (handles both sync and async)
 */
export async function unwrapCheckResult(
  result: CheckResult | Promise<CheckResult>
): Promise<CheckResult> {
  return await result;
}

