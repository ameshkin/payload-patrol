import { describe, it, expect } from "vitest";
import { createPatrol } from "./index";

describe("Bug Fixes", () => {
  describe("Null handling in arrays and objects", () => {
    it("should handle null values in arrays without unnecessary recursion", async () => {
      const patrol = createPatrol({ blockXSS: true });
      const result = await patrol.scan([null, "test", null, "<script>bad</script>"]);
      
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      // Should only detect issue in the string, not in null values
      expect(result.issues[0].path).toEqual([3]);
    });

    it("should handle null values in objects without unnecessary recursion", async () => {
      const patrol = createPatrol({ blockXSS: true });
      const result = await patrol.scan({
        name: null,
        comment: "<script>bad</script>",
        age: null,
      });
      
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      // Should only detect issue in the string, not in null values
      expect(result.issues[0].path).toEqual(["comment"]);
    });

    it("should preserve null values in strip mode", async () => {
      const patrol = createPatrol({ blockXSS: true, adapter: "strip" });
      const result = await patrol.scan({
        name: null,
        comment: "<script>bad</script>",
      });
      
      // Strip mode sanitizes but still reports issues (ok: false)
      // However, the sanitized value is available
      expect(result.value).toBeDefined();
      const sanitized = result.value as Record<string, unknown>;
      expect(sanitized.name).toBeNull();
      expect(sanitized.comment).not.toContain("<script>");
    });
  });

  describe("Object.create(null) prototype pollution protection", () => {
    it("should detect prototype pollution in Object.create(null) objects", async () => {
      const patrol = createPatrol();
      const maliciousObj = Object.create(null);
      maliciousObj.__proto__ = { isAdmin: true };
      
      const result = await patrol.scan(maliciousObj);
      
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].message?.toLowerCase()).toContain("prototype pollution");
      expect(result.issues[0].details?.reason).toBe("prototype_pollution");
    });

    it("should detect constructor pollution in Object.create(null) objects", async () => {
      const patrol = createPatrol();
      const maliciousObj = Object.create(null);
      maliciousObj.constructor = { prototype: { isAdmin: true } };
      
      const result = await patrol.scan(maliciousObj);
      
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].message?.toLowerCase()).toContain("prototype pollution");
    });

    it("should allow safe Object.create(null) objects", async () => {
      const patrol = createPatrol({ blockXSS: true });
      const safeObj = Object.create(null);
      safeObj.name = "test";
      safeObj.value = "safe string";
      
      const result = await patrol.scan(safeObj);
      
      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe("Nested null handling", () => {
    it("should handle deeply nested null values", async () => {
      const patrol = createPatrol({ blockXSS: true });
      const result = await patrol.scan({
        level1: {
          level2: {
            level3: null,
            value: "<script>bad</script>",
          },
          nullValue: null,
        },
        nullValue: null,
      });
      
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].path).toEqual(["level1", "level2", "value"]);
    });

    it("should handle null in arrays of objects", async () => {
      const patrol = createPatrol({ blockXSS: true });
      const result = await patrol.scan([
        { name: "test1", value: null },
        null,
        { name: "test2", value: "<script>bad</script>" },
      ]);
      
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].path).toEqual([2, "value"]);
    });
  });
});

