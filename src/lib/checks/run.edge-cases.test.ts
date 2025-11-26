import { describe, it, expect, beforeAll } from "vitest";
import { runChecks } from "./run";
import { registerCheck } from "./registry";

describe("runChecks - Edge Cases", () => {
  beforeAll(() => {
    registerCheck("test-check", () => ({
      name: "test-check",
      ok: true,
    }));
  });

  describe("empty checks array", () => {
    it("should return ok: true with empty results when no checks provided", async () => {
      const result = await runChecks("test", []);
      expect(result.ok).toBe(true);
      expect(result.results).toHaveLength(0);
      expect(result.value).toBe("test");
    });
  });

  describe("very long strings", () => {
    it("should handle very long strings", async () => {
      const longString = "a".repeat(100000);
      const result = await runChecks(longString, ["test-check"]);
      expect(result.ok).toBe(true);
      expect(result.value).toBe(longString);
    });
  });

  describe("special characters", () => {
    it("should handle strings with special characters", async () => {
      const special = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
      const result = await runChecks(special, ["test-check"]);
      expect(result.ok).toBe(true);
      expect(result.value).toBe(special);
    });

    it("should handle unicode characters", async () => {
      const unicode = "Hello 世界 🌍";
      const result = await runChecks(unicode, ["test-check"]);
      expect(result.ok).toBe(true);
      expect(result.value).toBe(unicode);
    });

    it("should handle emoji", async () => {
      const emoji = "Hello 😀 🎉 🚀";
      const result = await runChecks(emoji, ["test-check"]);
      expect(result.ok).toBe(true);
      expect(result.value).toBe(emoji);
    });
  });

  describe("check limit enforcement", () => {
    it("should limit number of checks to prevent DoS", async () => {
      const manyChecks = Array(200).fill("test-check");
      const result = await runChecks("test", manyChecks);
      // Should only process first 100 checks
      expect(result.results.length).toBeLessThanOrEqual(100);
    });
  });

  describe("strip mode with multiple checks", () => {
    beforeAll(() => {
      registerCheck("strip-numbers", (value) => ({
        name: "strip-numbers",
        ok: !/\d/.test(value),
        value: value.replace(/\d/g, ""),
      }));
      registerCheck("strip-spaces", (value) => ({
        name: "strip-spaces",
        ok: !/\s/.test(value),
        value: value.replace(/\s/g, ""),
      }));
    });

    it("should chain strip operations", async () => {
      const result = await runChecks("test 123", ["strip-numbers", "strip-spaces"], undefined, {
        adapter: "strip",
      });
      expect(result.ok).toBe(true);
      expect(result.value).toBe("test");
    });
  });
});

