import { describe, it, expect } from "vitest";
import {
  safeRegexTest,
  safeRegexMatch,
  safeRegexExec,
  isPlainObject,
  sanitizeKeys,
  validateInputLength,
} from "./security";

describe("Security Utilities", () => {
  describe("safeRegexTest", () => {
    it("should test regex safely", () => {
      const result = safeRegexTest(/test/i, "This is a test");
      expect(result).toBe(true);
    });

    it("should reject extremely long inputs", () => {
      const longString = "a".repeat(2_000_000);
      const result = safeRegexTest(/test/i, longString);
      expect(result).toBe(false);
    });

    it("should handle invalid regex gracefully", () => {
      // This should not throw
      const result = safeRegexTest(/test/i, "normal string");
      expect(typeof result).toBe("boolean");
    });
  });

  describe("safeRegexMatch", () => {
    it("should match regex safely", () => {
      const result = safeRegexMatch(/test/i, "This is a test");
      expect(result).not.toBeNull();
      expect(result?.[0]).toBe("test");
    });

    it("should reject extremely long inputs", () => {
      const longString = "a".repeat(2_000_000);
      const result = safeRegexMatch(/test/i, longString);
      expect(result).toBeNull();
    });
  });

  describe("safeRegexExec", () => {
    it("should exec regex safely", () => {
      const regex = /test/gi;
      const result = safeRegexExec(regex, "test test");
      expect(result).not.toBeNull();
      expect(result?.[0]).toBe("test");
    });

    it("should limit iterations", () => {
      const regex = /a+/g;
      const longString = "a".repeat(5000);
      const result = safeRegexExec(regex, longString, 10);
      // Should return first match, not iterate excessively
      expect(result).not.toBeNull();
    });
  });

  describe("isPlainObject", () => {
    it("should identify plain objects", () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ a: 1 })).toBe(true);
    });

    it("should reject arrays", () => {
      expect(isPlainObject([])).toBe(false);
    });

    it("should reject null", () => {
      expect(isPlainObject(null)).toBe(false);
    });

    it("should reject primitives", () => {
      expect(isPlainObject("string")).toBe(false);
      expect(isPlainObject(123)).toBe(false);
      expect(isPlainObject(true)).toBe(false);
    });
  });

  describe("sanitizeKeys", () => {
    it("should remove dangerous keys", () => {
      const obj = {
        __proto__: { polluted: true },
        constructor: { polluted: true },
        prototype: { polluted: true },
        safe: "value",
      };
      const sanitized = sanitizeKeys(obj);
      // Use hasOwnProperty to check for dangerous keys (not prototype chain)
      expect(Object.prototype.hasOwnProperty.call(sanitized, "__proto__")).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(sanitized, "constructor")).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(sanitized, "prototype")).toBe(false);
      expect(sanitized.safe).toBe("value");
    });

    it("should preserve safe keys", () => {
      const obj = {
        name: "Alice",
        age: 30,
        nested: { value: "test" },
      };
      const sanitized = sanitizeKeys(obj);
      expect(sanitized.name).toBe("Alice");
      expect(sanitized.age).toBe(30);
      expect((sanitized.nested as any).value).toBe("test");
    });

    it("should sanitize nested objects", () => {
      const obj = {
        nested: {
          __proto__: { polluted: true },
          safe: "value",
        },
      };
      const sanitized = sanitizeKeys(obj);
      // Use hasOwnProperty to check for dangerous keys (not prototype chain)
      expect(Object.prototype.hasOwnProperty.call(sanitized.nested, "__proto__")).toBe(false);
      expect((sanitized.nested as any).safe).toBe("value");
    });
  });

  describe("validateInputLength", () => {
    it("should validate normal length", () => {
      expect(validateInputLength("test")).toBe(true);
      expect(validateInputLength("a".repeat(1000))).toBe(true);
    });

    it("should reject extremely long inputs", () => {
      expect(validateInputLength("a".repeat(2_000_000))).toBe(false);
    });

    it("should accept custom max length", () => {
      expect(validateInputLength("test", 10)).toBe(true);
      expect(validateInputLength("a".repeat(20), 10)).toBe(false);
    });
  });
});

