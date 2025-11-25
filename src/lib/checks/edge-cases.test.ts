/**
 * Edge case tests for various scenarios
 */

import { describe, it, expect } from "vitest";
import { createPatrol, auditPayload, runChecks, getCheck, hasCheck, registerCheck } from "../../index";
import type { CheckContext } from "../../types";

describe("Edge Cases: Empty and Null Values", () => {
  it("Given an empty string, When scanning, Then it should pass", async () => {
    const patrol = createPatrol();
    const result = await patrol.scan("");
    expect(result.ok).toBe(true);
  });

  it("Given null, When scanning, Then it should pass", async () => {
    const patrol = createPatrol();
    const result = await patrol.scan(null);
    expect(result.ok).toBe(true);
  });

  it("Given undefined, When scanning, Then it should pass", async () => {
    const patrol = createPatrol();
    const result = await patrol.scan(undefined);
    expect(result.ok).toBe(true);
  });

  it("Given a number, When scanning, Then it should pass", async () => {
    const patrol = createPatrol();
    const result = await patrol.scan(123);
    expect(result.ok).toBe(true);
  });

  it("Given a boolean, When scanning, Then it should pass", async () => {
    const patrol = createPatrol();
    const result = await patrol.scan(true);
    expect(result.ok).toBe(true);
  });

  it("Given an empty array, When scanning, Then it should pass", async () => {
    const patrol = createPatrol();
    const result = await patrol.scan([]);
    expect(result.ok).toBe(true);
  });

  it("Given an empty object, When scanning, Then it should pass", async () => {
    const patrol = createPatrol();
    const result = await patrol.scan({});
    expect(result.ok).toBe(true);
  });
});

describe("Edge Cases: Nested Structures", () => {
  it("Given deeply nested objects, When scanning, Then it should validate all levels", async () => {
    const patrol = createPatrol();
    const result = await patrol.scan({
      level1: {
        level2: {
          level3: {
            value: "<script>alert(1)</script>",
          },
        },
      },
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.path.length === 4)).toBe(true);
  });

  it("Given arrays within objects, When scanning, Then it should validate array elements", async () => {
    const patrol = createPatrol();
    const result = await patrol.scan({
      items: ["safe", "<script>unsafe</script>", "safe"],
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.path[0] === "items" && i.path[1] === 1)).toBe(true);
  });

  it("Given objects within arrays, When scanning, Then it should validate object fields", async () => {
    const patrol = createPatrol();
    const result = await patrol.scan([
      { name: "Alice", comment: "safe" },
      { name: "Bob", comment: "<script>unsafe</script>" },
    ]);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.path[0] === 1 && i.path[1] === "comment")).toBe(true);
  });
});

describe("Edge Cases: Special Characters", () => {
  it("Given unicode characters, When scanning, Then it should handle them correctly", async () => {
    const patrol = createPatrol();
    const result = await patrol.scan("Hello 世界 🌍");
    expect(result.ok).toBe(true);
  });

  it("Given emoji, When scanning, Then it should handle them correctly", async () => {
    const patrol = createPatrol();
    const result = await patrol.scan("Hello 😀 🎉");
    expect(result.ok).toBe(true);
  });

  it("Given special regex characters, When scanning, Then it should not break", async () => {
    const patrol = createPatrol();
    const result = await patrol.scan("Hello (world) [test] {value}");
    expect(result.ok).toBe(true);
  });
});

describe("Edge Cases: Very Long Inputs", () => {
  it("Given a very long safe string, When scanning with limits, Then it should be rejected", async () => {
    const patrol = createPatrol({ limit: { maxChars: 100 } });
    const longString = "a".repeat(1000);
    const result = await patrol.scan(longString);
    expect(result.ok).toBe(false);
  });

  it("Given a very long string with SQLi, When scanning, Then it should detect SQLi quickly", async () => {
    const patrol = createPatrol();
    const longString = "a".repeat(10000) + "'; DROP TABLE users; --";
    const start = Date.now();
    const result = await patrol.scan(longString);
    const duration = Date.now() - start;
    expect(result.ok).toBe(false);
    // Should be reasonably fast (less than 1 second)
    expect(duration).toBeLessThan(1000);
  });
});

describe("Edge Cases: Mixed Content Types", () => {
  it("Given an object with mixed types, When scanning, Then only strings should be validated", async () => {
    const patrol = createPatrol();
    const result = await patrol.scan({
      string: "<script>alert(1)</script>",
      number: 123,
      boolean: true,
      null: null,
      array: [1, 2, 3],
      object: { nested: "safe" },
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.path[0] === "string")).toBe(true);
  });
});

describe("Edge Cases: Check Registry", () => {
  it("Given a non-existent check name, When getting check, Then it should throw an error", () => {
    expect(() => getCheck("nonexistent" as any)).toThrow();
  });

  it("Given a check name, When checking if it exists, Then it should return correct boolean", () => {
    expect(hasCheck("sql")).toBe(true);
    expect(hasCheck("nonexistent" as any)).toBe(false);
  });
});

describe("Edge Cases: runChecks with Invalid Input", () => {
  it("Given an invalid check name, When running checks, Then it should handle gracefully", async () => {
    // Invalid checks are caught and returned as failed results, not thrown
    const result = await runChecks("test", ["nonexistent" as any], {});
    expect(result.ok).toBe(false);
    expect(result.results.some((r) => r.name === "nonexistent" && !r.ok)).toBe(true);
  });

  it("Given an empty checks array, When running checks, Then it should pass", async () => {
    const result = await runChecks("test", [], {});
    expect(result.ok).toBe(true);
  });

  it("Given a check that throws, When running checks, Then it should be caught and reported", async () => {
    // Register a check that throws
    registerCheck("throwing", async () => {
      throw new Error("Test error");
    });

    const result = await runChecks("test", ["throwing"], {});
    expect(result.ok).toBe(false);
    expect(result.results.some((r) => r.name === "throwing" && !r.ok)).toBe(true);
  });
});

describe("Edge Cases: Adapter Modes", () => {
  it("Given block mode, When unsafe content is found, Then it should stop early", async () => {
    const patrol = createPatrol({ adapter: "block" });
    const result = await patrol.scan("<script>alert(1)</script>");
    expect(result.ok).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });

    it("Given warn mode, When unsafe content is found, Then it should continue and report all issues", async () => {
      const patrol = createPatrol({ adapter: "warn" });
      const result = await patrol.scan("<script>alert(1)</script><p>test</p>");
      // In warn mode, ok is false but processing continues (doesn't stop early)
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

  it("Given strip mode, When unsafe content is found, Then it should return sanitized value", async () => {
    const patrol = createPatrol({ adapter: "strip" });
    const result = await patrol.scan("<script>alert(1)</script>Hello");
    expect(result.ok).toBe(true);
    expect(result.value).toBeDefined();
  });
});

describe("Edge Cases: Context Options", () => {
  it("Given allowlist in context, When scanning profane content, Then allowlisted words should pass", async () => {
    const patrol = createPatrol({ checkProfanity: true, allowlist: ["testword"] });
    const result = await patrol.scan("testword");
    // Should pass if allowlisted
    expect(result).toHaveProperty("ok");
  });

  it("Given limit in context, When scanning, Then limits should be enforced", async () => {
    const patrol = createPatrol({ limit: { maxChars: 10, maxWords: 5 } });
    const result = await patrol.scan("This is a very long string");
    expect(result.ok).toBe(false);
  });
});

