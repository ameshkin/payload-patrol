import { describe, it, expect } from "vitest";

// Import strictly the types so this file remains a type-oriented smoke test.
// If you rely on aliases, ensure vite-tsconfig-paths is enabled in vitest.config.ts.
import type {
  CheckName,
  CheckContext,
  CheckFn,
  CheckResult,
  RunChecksResult,
} from "@lib/types";

describe("types smoke test", () => {
  it("accepts a valid CheckFn and CheckResult shape", () => {
    const fn: CheckFn = (value: string, ctx?: CheckContext): CheckResult => {
      const usedLimit = ctx?.limit?.maxChars ?? 0;
      const ok = value.length <= usedLimit || usedLimit === 0;

      return {
        name: "limit" as CheckName,
        ok,
        message: ok ? undefined : `Too long (${value.length}/${usedLimit})`,
        details: { length: value.length, maxChars: usedLimit },
        // value // optional sanitized string for adapter="strip"
      };
    };

    expect(typeof fn).toBe("function");

    const res = fn("hello", { limit: { maxChars: 3 } });
    expect(res.ok).toBe(false);
    expect(res.name).toBe("limit");
    expect(typeof res.details).toBe("object");
  });

  it("accepts a valid RunChecksResult shape", () => {
    const aggregate: RunChecksResult = {
      ok: false,
      results: [
        {
          name: "badwords",
          ok: false,
          message: "Contains blocked terms: dipshit",
          details: { hits: ["dipshit"] },
        },
        {
          name: "limit",
          ok: true,
          details: { length: 5, maxChars: 200 },
        },
      ],
      value: "hello",
    };

    expect(aggregate.ok).toBe(false);
    expect(Array.isArray(aggregate.results)).toBe(true);
    expect(aggregate.results[0].name).toBe("badwords");
  });
});

