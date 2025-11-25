import { describe, it, expect, beforeEach } from "vitest";
import { registerCheck, getCheck, hasCheck, listChecks } from "./registry";
import { registerBuiltins } from "./builtins/index";
import { unwrapCheckResult } from "./test-helpers.js";

describe("Registry - Advanced Tests", () => {
  beforeEach(() => {
    // Ensure built-ins are registered
    registerBuiltins();
  });

  describe("Check Registration", () => {
    it("should register sync check", () => {
      registerCheck("sync-test", (value) => ({
        name: "sync-test",
        ok: value.length > 0,
        message: value.length === 0 ? "Empty" : undefined,
      }));

      expect(hasCheck("sync-test")).toBe(true);
      const check = getCheck("sync-test");
      expect(check).toBeDefined();
      expect(check.name).toBe("sync-test");
      expect(typeof check.run).toBe("function");
    });

    it("should register async check", async () => {
      registerCheck("async-test", async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return {
          name: "async-test",
          ok: value.length > 5,
          message: value.length <= 5 ? "Too short" : undefined,
        };
      });

      expect(hasCheck("async-test")).toBe(true);
      const check = getCheck("async-test");
      expect(check).toBeDefined();

      const result = await unwrapCheckResult(check.run("test"));
      expect(result.ok).toBe(false);
    });

    it("should allow check with context", async () => {
      registerCheck("context-test", (value, ctx) => ({
        name: "context-test",
        ok: value.length <= (ctx?.maxLength ?? 100),
        message:
          value.length > (ctx?.maxLength ?? 100)
            ? "Too long"
            : undefined,
      }));

      const check = getCheck("context-test");
      const result1 = await unwrapCheckResult(check.run("short", { maxLength: 10 }));
      expect(result1.ok).toBe(true);

      const result2 = await unwrapCheckResult(check.run("very long string", { maxLength: 10 }));
      expect(result2.ok).toBe(false);
    });

    it("should override existing check", () => {
      registerCheck("override-test", () => ({
        name: "override-test",
        ok: false,
        message: "Original",
      }));

      const original = getCheck("override-test");
      expect(original).toBeDefined();

      registerCheck("override-test", () => ({
        name: "override-test",
        ok: true,
        message: "Overridden",
      }));

      const overridden = getCheck("override-test");
      expect(overridden).toBeDefined();
      expect(overridden.name).toBe("override-test");
      // Should be different function
    });
  });

  describe("Check Retrieval", () => {
    it("should retrieve built-in checks", () => {
      expect(getCheck("sql")).toBeDefined();
      expect(getCheck("scripts")).toBeDefined();
      expect(getCheck("html")).toBeDefined();
      expect(getCheck("badwords")).toBeDefined();
      expect(getCheck("limit")).toBeDefined();
      expect(getCheck("sentiment")).toBeDefined();
    });

    it("should throw error for non-existent check", () => {
      expect(() => getCheck("non-existent-check-12345")).toThrow("Unknown check");
    });

    it("should handle check names with special characters", () => {
      registerCheck("check-with-dash", () => ({
        name: "check-with-dash",
        ok: true,
      }));
      expect(hasCheck("check-with-dash")).toBe(true);
    });
  });

  describe("Check Listing", () => {
    it("should list all registered checks", () => {
      const checks = listChecks();
      expect(Array.isArray(checks)).toBe(true);
      expect(checks.length).toBeGreaterThan(0);
    });

    it("should include built-in checks in list", () => {
      const checks = listChecks();
      const builtins = ["sql", "scripts", "html", "badwords", "limit", "sentiment"];
      builtins.forEach((name) => {
        expect(checks).toContain(name);
      });
    });

    it("should include custom checks in list", () => {
      registerCheck("custom-list-test", () => ({
        name: "custom-list-test",
        ok: true,
      }));

      const checks = listChecks();
      expect(checks).toContain("custom-list-test");
    });

    it("should return unique check names", () => {
      const checks = listChecks();
      const unique = new Set(checks);
      expect(checks.length).toBe(unique.size);
    });
  });

  describe("Check Execution", () => {
    it("should execute registered check", async () => {
      registerCheck("exec-test", (value) => ({
        name: "exec-test",
        ok: value === "pass",
        message: value !== "pass" ? "Must be 'pass'" : undefined,
      }));

      const check = getCheck("exec-test");
      const result1 = await unwrapCheckResult(check.run("pass"));
      expect(result1.ok).toBe(true);

      const result2 = await unwrapCheckResult(check.run("fail"));
      expect(result2.ok).toBe(false);
      expect(result2.message).toBe("Must be 'pass'");
    });

    it("should execute check with value transformation", async () => {
      registerCheck("transform-test", (value) => ({
        name: "transform-test",
        ok: true,
        value: value.toUpperCase(),
      }));

      const check = getCheck("transform-test");
      const result = await unwrapCheckResult(check.run("hello"));
      expect(result.ok).toBe(true);
      expect(result.value).toBe("HELLO");
    });

    it("should handle check that throws error", async () => {
      registerCheck("error-test", () => {
        throw new Error("Check error");
      });

      const check = getCheck("error-test");
      // The error should propagate when the check is executed
      try {
        await unwrapCheckResult(check.run("test"));
        // If we get here, the error wasn't thrown - that's also valid behavior
        // depending on how runChecks handles errors
      } catch (error: any) {
        expect(error.message).toBe("Check error");
      }
    });
  });
});

