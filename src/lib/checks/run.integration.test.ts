import { describe, it, expect, beforeAll } from "vitest";
import { runChecks } from "./run";
import { registerCheck } from "./registry";

describe("runChecks - Integration Tests", () => {
  beforeAll(() => {
    registerCheck("check1", () => ({ name: "check1", ok: true }));
    registerCheck("check2", () => ({ name: "check2", ok: false, message: "Failed" }));
    registerCheck("check3", () => ({ name: "check3", ok: true }));
  });

  describe("Check execution order", () => {
    it("should execute checks in order", async () => {
      const result = await runChecks("test", ["check1", "check2", "check3"], undefined, {
        stopOnFirstBlock: false
      });
      expect(result.results[0].name).toBe("check1");
      expect(result.results[1].name).toBe("check2");
      expect(result.results[2].name).toBe("check3");
    });

    it("should stop on first failure in block mode", async () => {
      const result = await runChecks("test", ["check1", "check2", "check3"], undefined, {
        adapter: "block"
      });
      expect(result.results.length).toBe(2); // check1, check2 (stops here)
      expect(result.ok).toBe(false);
    });
  });

  describe("Value transformation in strip mode", () => {
    it("should apply multiple strips sequentially", async () => {
      registerCheck("strip1", (value) => ({
        name: "strip1",
        ok: false,
        value: value.replace("a", "x")
      }));

      registerCheck("strip2", (value) => ({
        name: "strip2",
        ok: false,
        value: value.replace("b", "y")
      }));

      const result = await runChecks("abc", ["strip1", "strip2"], undefined, {
        adapter: "strip"
      });

      expect(result.value).toBe("xyc");
    });

    it("should use original value if check doesn't provide stripped value", async () => {
      registerCheck("no-strip", () => ({
        name: "no-strip",
        ok: false
      }));

      const result = await runChecks("test", ["no-strip"], undefined, {
        adapter: "strip"
      });

      expect(result.value).toBe("test");
    });
  });

  describe("Context passing", () => {
    it("should pass context to all checks", async () => {
      registerCheck("context-check", (value, ctx) => ({
        name: "context-check",
        ok: ctx?.limit?.maxChars === 100,
        message: ctx?.limit?.maxChars === 100 ? undefined : "Context not passed"
      }));

      const result = await runChecks("test", ["context-check"], {
        limit: { maxChars: 100 }
      });

      expect(result.ok).toBe(true);
    });

    it("should handle undefined context", async () => {
      registerCheck("no-context", (value, ctx) => ({
        name: "no-context",
        ok: ctx === undefined
      }));

      const result = await runChecks("test", ["no-context"]);
      expect(result.ok).toBe(true);
    });
  });

  describe("Error handling", () => {
    it("should handle check that throws", async () => {
      registerCheck("throws", () => {
        throw new Error("Check error");
      });

      // runChecks now catches errors and returns a failure result
      const result = await runChecks("test", ["throws"]);
      expect(result.ok).toBe(false);
      expect(result.results.length).toBe(1);
      expect(result.results[0].ok).toBe(false);
      expect(result.results[0].message).toContain("Check error");
    });

    it("should handle async check that rejects", async () => {
      registerCheck("rejects", async () => {
        throw new Error("Async error");
      });

      // runChecks now catches errors and returns a failure result
      const result = await runChecks("test", ["rejects"]);
      expect(result.ok).toBe(false);
      expect(result.results.length).toBe(1);
      expect(result.results[0].ok).toBe(false);
      expect(result.results[0].message).toContain("Async error");
    });
  });

  describe("Result aggregation", () => {
    it("should aggregate all results in warn mode", async () => {
      const result = await runChecks("test", ["check1", "check2", "check3"], undefined, {
        adapter: "warn",
        stopOnFirstBlock: false
      });

      expect(result.results.length).toBe(3);
      expect(result.ok).toBe(false); // Has failures
    });

    it("should mark as ok in strip mode even with failures", async () => {
      registerCheck("strip-fail", (value) => ({
        name: "strip-fail",
        ok: false,
        value: "cleaned"
      }));

      const result = await runChecks("dirty", ["strip-fail"], undefined, {
        adapter: "strip"
      });

      expect(result.ok).toBe(true);
      expect(result.value).toBe("cleaned");
    });
  });
});

