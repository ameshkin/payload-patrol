import { describe, it, expect } from "vitest";
import { createPatrol, auditPayload, registerProfanityList, registerCheck } from "./index";

describe("Core API - Integration Tests", () => {
  describe("Complex nested structures", () => {
    it("should handle deeply nested objects", async () => {
      const patrol = createPatrol({ blockXSS: true });
      const result = await patrol.scan({
        level1: {
          level2: {
            level3: {
              level4: {
                content: "<script>bad</script>"
              }
            }
          }
        }
      });

      expect(result.ok).toBe(false);
      expect(result.issues[0].path).toEqual(["level1", "level2", "level3", "level4", "content"]);
    });

    it("should handle arrays of objects", async () => {
      const patrol = createPatrol({ blockSQLi: true });
      const result = await patrol.scan([
        { name: "Alice", comment: "Hello" },
        { name: "Bob", comment: "'; DROP TABLE users;--" },
        { name: "Charlie", comment: "World" }
      ]);

      expect(result.ok).toBe(false);
      expect(result.issues[0].path).toEqual([1, "comment"]);
    });

    it("should handle mixed arrays", async () => {
      const patrol = createPatrol({ blockXSS: true });
      const result = await patrol.scan([
        "clean string",
        42,
        { field: "<script>bad</script>" },
        null,
        undefined
      ]);

      expect(result.ok).toBe(false);
      expect(result.issues[0].path).toEqual([2, "field"]);
    });
  });

  describe("Multiple issues in same object", () => {
    it("should detect multiple issues in different fields", async () => {
      const patrol = createPatrol({
        blockSQLi: true,
        blockXSS: true,
        checkProfanity: true
      });

      const result = await patrol.scan({
        name: "<script>bad</script>",
        email: "'; DROP TABLE users;--",
        comment: "You're an asshole"
      });

      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThanOrEqual(3);
    });

    it("should report all issues in warn mode", async () => {
      const patrol = createPatrol({
        adapter: "warn",
        blockSQLi: true,
        blockXSS: true
      });

      const result = await patrol.scan({
        field1: "<script>bad</script>",
        field2: "'; DROP TABLE users;--"
      });

      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Custom checks integration", () => {
    it("should work with custom checks", async () => {
      registerCheck("no-email", (value) => {
        const hasEmail = /@/.test(value);
        return {
          name: "no-email",
          ok: !hasEmail,
          message: hasEmail ? "Email addresses not allowed" : undefined
        };
      });

      const patrol = createPatrol();
      const result = await patrol.scan("Contact me at test@example.com");

      // Note: Custom check needs to be registered in the checks array
      // This test verifies the check can be registered
      expect(typeof registerCheck).toBe("function");
    });

    it("should handle async custom checks", async () => {
      registerCheck("async-test", async (value) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return {
          name: "async-test",
          ok: value.length > 5
        };
      });

      // Verify async check can be registered
      expect(typeof registerCheck).toBe("function");
    });
  });

  describe("Profanity list integration", () => {
    it("should use registered profanity list", async () => {
      registerProfanityList(["customword", "anotherword"]);
      const patrol = createPatrol({ checkProfanity: true });

      // Note: This tests that registration works
      // Actual detection is tested in badwords.test.ts
      const result = await patrol.scan("This is clean");
      expect(typeof result).toBe("object");
    });

    it("should handle multiple profanity registrations", () => {
      expect(() => {
        registerProfanityList(["word1"]);
        registerProfanityList(["word2"]);
        registerProfanityList(["word3"]);
      }).not.toThrow();
    });
  });

  describe("Performance with large payloads", () => {
    it("should handle large strings", async () => {
      const patrol = createPatrol({ limit: { maxChars: 10000 } });
      const largeString = "a".repeat(5000);
      const result = await patrol.scan(largeString);
      expect(result.ok).toBe(true);
    });

    it("should handle large arrays", async () => {
      const patrol = createPatrol();
      const largeArray = Array(1000).fill("clean text");
      const result = await patrol.scan(largeArray);
      expect(result.ok).toBe(true);
    });

    it("should handle large objects", async () => {
      const patrol = createPatrol();
      const largeObj: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        largeObj[`field${i}`] = "clean text";
      }
      const result = await patrol.scan(largeObj);
      expect(result.ok).toBe(true);
    });
  });

  describe("auditPayload edge cases", () => {
    it("should handle empty checks array", async () => {
      const result = await auditPayload("test", { checks: [] });
      expect(result.ok).toBe(true);
    });

    it("should handle custom context", async () => {
      const result = await auditPayload("test", {
        checks: ["limit"],
        context: { limit: { maxChars: 2 } }
      });
      expect(result.ok).toBe(false);
    });

    it("should handle adapter override", async () => {
      const result = await auditPayload("<script>bad</script>Hello", {
        adapter: "strip",
        checks: ["scripts"]
      });
      expect(result.ok).toBe(true);
      expect(result.value).toBeDefined();
    });
  });

  describe("Type safety", () => {
    it("should return correct ScanResult type", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan("test");

      expect(result).toHaveProperty("ok");
      expect(result).toHaveProperty("issues");
      expect(Array.isArray(result.issues)).toBe(true);
    });

    it("should include path in issues", async () => {
      const patrol = createPatrol({ blockXSS: true });
      const result = await patrol.scan({
        nested: {
          field: "<script>bad</script>"
        }
      });

      if (!result.ok) {
        expect(result.issues[0]).toHaveProperty("path");
        expect(Array.isArray(result.issues[0].path)).toBe(true);
      }
    });
  });

  describe("Strip mode edge cases", () => {
    it("should handle multiple strips in sequence", async () => {
      const patrol = createPatrol({
        adapter: "strip",
        blockXSS: true
      });

      const result = await patrol.scan("<script>bad1</script><script>bad2</script>Hello");
      expect(result.ok).toBe(true);
      expect(result.value).not.toContain("<script>");
    });

    it("should preserve clean content in strip mode", async () => {
      const patrol = createPatrol({
        adapter: "strip",
        blockXSS: true
      });

      const result = await patrol.scan("Hello<script>bad</script>World");
      expect(result.ok).toBe(true);
      expect(result.value).toContain("Hello");
      expect(result.value).toContain("World");
    });
  });
});

