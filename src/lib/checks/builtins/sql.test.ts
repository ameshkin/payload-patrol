import { describe, it, expect } from "vitest";
import { sqlCheck } from "./sql";
import { unwrapCheckResult } from "../test-helpers.js";

describe("SQL Check", () => {
  describe("SQL injection patterns", () => {
    it("should detect UNION SELECT", async () => {
      const result = await unwrapCheckResult(sqlCheck("1' UNION SELECT * FROM users--"));
      expect(result.ok).toBe(false);
      expect(result.name).toBe("sql");
    });

    it("should detect SELECT FROM", async () => {
      const result = await unwrapCheckResult(sqlCheck("SELECT * FROM users"));
      expect(result.ok).toBe(false);
    });

    it("should detect SQL comments (--)", async () => {
      const result = await unwrapCheckResult(sqlCheck("test -- comment"));
      expect(result.ok).toBe(false);
    });

    it("should detect SQL comments (#)", async () => {
      const result = await unwrapCheckResult(sqlCheck("test # comment"));
      expect(result.ok).toBe(false);
    });

    it("should detect multi-line comments", async () => {
      const result = await unwrapCheckResult(sqlCheck("test /* comment */"));
      expect(result.ok).toBe(false);
    });

    it("should detect OR 1=1", async () => {
      const result = await unwrapCheckResult(sqlCheck("admin' OR 1=1--"));
      expect(result.ok).toBe(false);
    });

    it("should detect DROP TABLE", async () => {
      const result = await unwrapCheckResult(sqlCheck("'; DROP TABLE users;--"));
      expect(result.ok).toBe(false);
    });

    it("should detect DROP DATABASE", async () => {
      const result = await unwrapCheckResult(sqlCheck("DROP DATABASE test"));
      expect(result.ok).toBe(false);
    });

    it("should detect INSERT INTO", async () => {
      const result = await unwrapCheckResult(sqlCheck("INSERT INTO users VALUES"));
      expect(result.ok).toBe(false);
    });

    it("should detect UPDATE SET", async () => {
      const result = await unwrapCheckResult(sqlCheck("UPDATE users SET password=''"));
      expect(result.ok).toBe(false);
    });

    it("should detect DELETE FROM", async () => {
      const result = await unwrapCheckResult(sqlCheck("DELETE FROM users"));
      expect(result.ok).toBe(false);
    });

    it("should detect SLEEP function", async () => {
      const result = await unwrapCheckResult(sqlCheck("1; SELECT SLEEP(10)--"));
      expect(result.ok).toBe(false);
    });

    it("should detect xp_cmdshell", async () => {
      const result = await unwrapCheckResult(sqlCheck("xp_cmdshell('dir')"));
      expect(result.ok).toBe(false);
    });

    it("should detect double semicolons", async () => {
      const result = await unwrapCheckResult(sqlCheck("test;; SELECT * FROM users"));
      expect(result.ok).toBe(false);
    });
  });

  describe("Safe inputs", () => {
    it("should allow plain text", async () => {
      const result = await unwrapCheckResult(sqlCheck("Hello world"));
      expect(result.ok).toBe(true);
    });

    it("should allow normal queries in quotes", async () => {
      const result = await unwrapCheckResult(sqlCheck('User said "hello"'));
      expect(result.ok).toBe(true);
    });

    it("should allow email addresses", async () => {
      const result = await unwrapCheckResult(sqlCheck("user@example.com"));
      expect(result.ok).toBe(true);
    });

    it("should allow URLs", async () => {
      const result = await unwrapCheckResult(sqlCheck("https://example.com"));
      expect(result.ok).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty string", async () => {
      const result = await unwrapCheckResult(sqlCheck(""));
      expect(result.ok).toBe(true);
    });

    it("should handle case-insensitive detection", async () => {
      const result = await unwrapCheckResult(sqlCheck("union select * from users"));
      expect(result.ok).toBe(false);
    });

    it("should handle mixed case", async () => {
      const result = await unwrapCheckResult(sqlCheck("UnIoN SeLeCt * FrOm UsErS"));
      expect(result.ok).toBe(false);
    });

    it("should provide details on detection", async () => {
      const result = await unwrapCheckResult(sqlCheck("1' UNION SELECT * FROM users--"));
      expect(result.details).toBeDefined();
      if (result.details && "rules" in result.details) {
        const rules = result.details.rules as string[];
        expect(rules.length).toBeGreaterThan(0);
      }
    });
  });
});

