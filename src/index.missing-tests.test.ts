import { describe, it, expect } from "vitest";
import { createPatrol, auditPayload } from "./index";

describe("Missing Test Coverage", () => {
  describe("auditPayload edge cases", () => {
    it("should handle empty checks array", async () => {
      const result = await auditPayload("test", { checks: [] });
      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should handle custom context", async () => {
      const result = await auditPayload("test", {
        checks: ["limit"],
        context: { limit: { maxChars: 2 } },
      });
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe("createPatrol with all options", () => {
    it("should create patrol with all options enabled", async () => {
      const patrol = createPatrol({
        blockSQLi: true,
        blockXSS: true,
        allowHTML: false,
        checkProfanity: true,
        limit: { maxChars: 100, maxWords: 20 },
        allowlist: ["test"],
        adapter: "warn",
      });

      expect(patrol).toBeDefined();
      expect(typeof patrol.scan).toBe("function");
      
      const result = await patrol.scan("test string");
      expect(result).toBeDefined();
      expect(result).toHaveProperty("ok");
    });

    it("should create patrol with minimal options", async () => {
      const patrol = createPatrol({});
      const result = await patrol.scan("test");
      expect(result.ok).toBe(true);
    });
  });

  describe("nested array edge cases", () => {
    it("should handle deeply nested arrays", async () => {
      const patrol = createPatrol({ blockXSS: true });
      const result = await patrol.scan([
        [
          [
            ["<script>bad</script>"],
          ],
        ],
      ]);
      expect(result.ok).toBe(false);
      expect(result.issues[0].path.length).toBeGreaterThan(0);
    });

    it("should handle mixed nested structures", async () => {
      const patrol = createPatrol({ blockXSS: true });
      const result = await patrol.scan({
        arr: [
          { nested: { value: "<script>bad</script>" } },
        ],
      });
      expect(result.ok).toBe(false);
      expect(result.issues[0].path).toContain("arr");
    });
  });

  describe("strip mode edge cases", () => {
    it("should handle strip mode with nested objects", async () => {
      const patrol = createPatrol({ blockXSS: true, adapter: "strip" });
      const result = await patrol.scan({
        name: "test",
        comment: "<script>bad</script>",
        nested: {
          value: "<script>also bad</script>",
        },
      });
      expect(result.value).toBeDefined();
      const sanitized = result.value as Record<string, unknown>;
      expect(sanitized.comment).not.toContain("<script>");
      expect((sanitized.nested as Record<string, unknown>).value).not.toContain("<script>");
    });
  });

  describe("warn mode behavior", () => {
    it("should collect all issues in warn mode", async () => {
      const patrol = createPatrol({ blockXSS: true, blockSQLi: true, adapter: "warn" });
      const result = await patrol.scan({
        xss: "<script>bad</script>",
        sql: "'; DROP TABLE users;--",
      });
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThanOrEqual(2);
    });
  });
});

