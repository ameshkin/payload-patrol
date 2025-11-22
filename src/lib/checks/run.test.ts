import { describe, it, expect, beforeAll } from "vitest";
import { runChecks } from "./run";
import { registerCheck } from "./registry";

describe("runChecks - Smoke Tests", () => {
  beforeAll(() => {
    // Register test checks
    registerCheck("always-pass", () => ({
      name: "always-pass",
      ok: true,
    }));

    registerCheck("always-fail", () => ({
      name: "always-fail",
      ok: false,
      message: "This check always fails",
    }));

    registerCheck("length-check", (value, ctx) => ({
      name: "length-check",
      ok: value.length <= 10,
      message: value.length > 10 ? "Too long" : undefined,
    }));

    registerCheck("strip-test", (value) => {
      const hasNumbers = /\d/.test(value);
      return {
        name: "strip-test",
        ok: !hasNumbers,
        message: hasNumbers ? "Contains numbers" : undefined,
        value: value.replace(/\d/g, ""), // stripped version
      };
    });
  });

  describe("basic execution", () => {
    it("should run single check", async () => {
      const result = await runChecks("test", ["always-pass"]);
      expect(result.ok).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].name).toBe("always-pass");
    });

    it("should run multiple checks", async () => {
      const result = await runChecks("test", ["always-pass", "length-check"]);
      expect(result.ok).toBe(true);
      expect(result.results).toHaveLength(2);
    });

    it("should preserve original value when all pass", async () => {
      const result = await runChecks("hello", ["always-pass"]);
      expect(result.value).toBe("hello");
    });
  });

  describe("block mode (default)", () => {
    it("should stop on first failure by default", async () => {
      const result = await runChecks("test", ["always-fail", "always-pass"]);
      expect(result.ok).toBe(false);
      expect(result.results).toHaveLength(1); // stopped after first
    });

    it("should return all results with stopOnFirstBlock: false", async () => {
      const result = await runChecks(
        "test",
        ["always-fail", "always-pass"],
        undefined,
        { stopOnFirstBlock: false }
      );
      expect(result.ok).toBe(false);
      expect(result.results).toHaveLength(2);
    });
  });

  describe("warn mode", () => {
    it("should run all checks in warn mode", async () => {
      const result = await runChecks(
        "test",
        ["always-fail", "always-pass"],
        undefined,
        { adapter: "warn" }
      );
      expect(result.results).toHaveLength(2);
    });

    it("should mark as not ok when checks fail", async () => {
      const result = await runChecks("test", ["always-fail"], undefined, {
        adapter: "warn",
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("strip mode", () => {
    it("should apply sanitization from check", async () => {
      const result = await runChecks("hello123world", ["strip-test"], undefined, {
        adapter: "strip",
      });
      expect(result.value).toBe("helloworld");
    });

    it("should continue to next check after stripping", async () => {
      const result = await runChecks(
        "test123",
        ["strip-test", "always-pass"],
        undefined,
        { adapter: "strip" }
      );
      expect(result.results).toHaveLength(2);
      expect(result.value).toBe("test");
    });

    it("should report ok: true even when checks fail in strip mode", async () => {
      const result = await runChecks("123", ["strip-test"], undefined, {
        adapter: "strip",
      });
      expect(result.ok).toBe(true); // strip mode considers sanitization as success
    });
  });

  describe("context passing", () => {
    it("should pass context to checks", async () => {
      const result = await runChecks(
        "this is a very long string",
        ["length-check"],
        undefined
      );
      expect(result.ok).toBe(false);
      expect(result.results[0].message).toContain("Too long");
    });
  });

  describe("async checks", () => {
    beforeAll(() => {
      registerCheck("async-check", async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return {
          name: "async-check",
          ok: true,
        };
      });
    });

    it("should handle async checks", async () => {
      const result = await runChecks("test", ["async-check"]);
      expect(result.ok).toBe(true);
      expect(result.results[0].name).toBe("async-check");
    });
  });
});

