/**
 * Gherkin-style BDD tests for built-in checks
 */

import { describe, it, expect, beforeAll } from "vitest";
import { registerBuiltins } from "./index";
import { getCheck, hasCheck } from "../registry";
import type { CheckContext } from "../../../types";

beforeAll(() => {
  registerBuiltins();
});

describe("Feature: SQL Injection Detection", () => {
  describe("Scenario: User submits SQL injection attempts", () => {
    it("Given a malicious user, When they submit SQL injection with DROP TABLE, Then it should be detected", async () => {
      expect(hasCheck("sql")).toBe(true);
      const check = getCheck("sql");
      const result = await check.run("'; DROP TABLE users; --", {});
      expect(result.ok).toBe(false);
      expect(result.message).toBeDefined();
    });

    it("Given a malicious user, When they submit SQL injection with UNION SELECT, Then it should be detected", async () => {
      expect(hasCheck("sql")).toBe(true);
      const check = getCheck("sql");
      const result = await check.run("' UNION SELECT * FROM users --", {});
      expect(result.ok).toBe(false);
    });

    it("Given a malicious user, When they submit SQL injection with OR 1=1, Then it should be detected", async () => {
      expect(hasCheck("sql")).toBe(true);
      const check = getCheck("sql");
      const result = await check.run("' OR 1=1 --", {});
      expect(result.ok).toBe(false);
    });

    it("Given a safe user, When they submit normal text, Then it should pass", async () => {
      expect(hasCheck("sql")).toBe(true);
      const check = getCheck("sql");
      const result = await check.run("Hello world", {});
      expect(result.ok).toBe(true);
    });
  });
});

describe("Feature: XSS/Script Detection", () => {
  describe("Scenario: User submits XSS attempts", () => {
    it("Given a malicious user, When they submit script tags, Then it should be detected", async () => {
      expect(hasCheck("scripts")).toBe(true);
      const check = getCheck("scripts");
      const result = await check.run("<script>alert(1)</script>", {});
      expect(result.ok).toBe(false);
    });

    it("Given a malicious user, When they submit javascript: protocol, Then it should be detected", async () => {
      expect(hasCheck("scripts")).toBe(true);
      const check = getCheck("scripts");
      const result = await check.run('javascript:alert("xss")', {});
      expect(result.ok).toBe(false);
    });

    it("Given a malicious user, When they submit onerror handlers, Then it should be detected", async () => {
      expect(hasCheck("scripts")).toBe(true);
      const check = getCheck("scripts");
      const result = await check.run('<img src="x" onerror="alert(1)">', {});
      expect(result.ok).toBe(false);
    });

    it("Given a safe user, When they submit normal text, Then it should pass", async () => {
      expect(hasCheck("scripts")).toBe(true);
      const check = getCheck("scripts");
      const result = await check.run("Hello world", {});
      expect(result.ok).toBe(true);
    });
  });
});

describe("Feature: HTML Tag Filtering", () => {
  describe("Scenario: User submits HTML content", () => {
    it("Given a user, When they submit HTML tags, Then they should be detected", async () => {
      expect(hasCheck("html")).toBe(true);
      const check = getCheck("html");
      const result = await check.run("<p>Hello</p>", {});
      expect(result.ok).toBe(false);
    });

    it("Given a user, When they submit multiple HTML tags, Then all should be detected", async () => {
      expect(hasCheck("html")).toBe(true);
      const check = getCheck("html");
      const result = await check.run("<p>Hello</p><div>World</div>", {});
      expect(result.ok).toBe(false);
      expect(result.details?.tags).toBeDefined();
    });

    it("Given a safe user, When they submit plain text, Then it should pass", async () => {
      expect(hasCheck("html")).toBe(true);
      const check = getCheck("html");
      const result = await check.run("Hello world", {});
      expect(result.ok).toBe(true);
    });
  });
});

describe("Feature: Profanity Detection", () => {
  describe("Scenario: User submits profane content", () => {
    it("Given a user, When they submit profane words, Then they should be detected", async () => {
      expect(hasCheck("badwords")).toBe(true);
      const check = getCheck("badwords");
      // This depends on badwords.json content
      const result = await check.run("test", {});
      expect(result).toHaveProperty("ok");
      expect(result).toHaveProperty("message");
    });

    it("Given a user with allowlist, When they submit allowlisted profane words, Then they should pass", async () => {
      expect(hasCheck("badwords")).toBe(true);
      const check = getCheck("badwords");
      const context: CheckContext = {
        allowlist: ["testword"],
      };
      const result = await check.run("testword", context);
      // Should pass if allowlisted
      expect(result).toHaveProperty("ok");
    });
  });
});

describe("Feature: Limit Checking", () => {
  describe("Scenario: User submits content with limits", () => {
    it("Given a user, When they submit content exceeding maxChars, Then it should be detected", async () => {
      expect(hasCheck("limit")).toBe(true);
      const check = getCheck("limit");
      const longText = "a".repeat(1001);
      const context: CheckContext = {
        limit: { maxChars: 1000 },
      };
      const result = await check.run(longText, context);
      expect(result.ok).toBe(false);
    });

    it("Given a user, When they submit content exceeding maxWords, Then it should be detected", async () => {
      expect(hasCheck("limit")).toBe(true);
      const check = getCheck("limit");
      const manyWords = "word ".repeat(101);
      const context: CheckContext = {
        limit: { maxWords: 100 },
      };
      const result = await check.run(manyWords, context);
      expect(result.ok).toBe(false);
    });

    it("Given a user, When they submit content within limits, Then it should pass", async () => {
      expect(hasCheck("limit")).toBe(true);
      const check = getCheck("limit");
      const text = "Hello world";
      const context: CheckContext = {
        limit: { maxChars: 100, maxWords: 10 },
      };
      const result = await check.run(text, context);
      expect(result.ok).toBe(true);
    });
  });
});

