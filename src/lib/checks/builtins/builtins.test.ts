import { describe, it, expect, beforeAll } from "vitest";
import { registerBuiltins } from "./index";
import { badwordsCheck } from "./badwords";
import { sqlCheck } from "./sql";
import { scriptsCheck } from "./scripts";
import { htmlCheck } from "./html";
import { limitCheck } from "./limit";
import { unwrapCheckResult } from "../test-helpers.js";

describe("Built-in Checks - Smoke Tests", () => {
  beforeAll(() => {
    registerBuiltins();
  });

  describe("badwordsCheck", () => {
    it("should pass clean text", async () => {
      const result = await unwrapCheckResult(badwordsCheck("Hello world"));
      expect(result.ok).toBe(true);
      expect(result.name).toBe("badwords");
    });

    it("should detect profanity from badwords.json", async () => {
      // Test with a word we know is in badwords.json
      const result = await unwrapCheckResult(badwordsCheck("You are an asshole"));
      expect(result.ok).toBe(false);
      expect(result.name).toBe("badwords");
      expect(result.message).toContain("blocked terms");
    });

    it("should respect allowlist", async () => {
      const result = await unwrapCheckResult(badwordsCheck("scunthorpe problem", {
        allowlist: ["scunthorpe"],
      }));
      expect(result.ok).toBe(true);
    });

    it("should be case insensitive", async () => {
      const result = await unwrapCheckResult(badwordsCheck("ASSHOLE"));
      expect(result.ok).toBe(false);
    });
  });

  describe("sqlCheck", () => {
    it("should pass clean text", async () => {
      const result = await unwrapCheckResult(sqlCheck("Hello world"));
      expect(result.ok).toBe(true);
      expect(result.name).toBe("sql");
    });

    it("should detect UNION SELECT", async () => {
      const result = await unwrapCheckResult(sqlCheck("1' UNION SELECT * FROM users--"));
      expect(result.ok).toBe(false);
      expect(result.message).toContain("SQL");
    });

    it("should detect DROP TABLE", async () => {
      const result = await unwrapCheckResult(sqlCheck("'; DROP TABLE users;--"));
      expect(result.ok).toBe(false);
    });

    it("should detect OR 1=1", async () => {
      const result = await unwrapCheckResult(sqlCheck("admin' OR 1=1--"));
      expect(result.ok).toBe(false);
    });

    it("should detect SQL comments", async () => {
      const result = await unwrapCheckResult(sqlCheck("test -- comment"));
      expect(result.ok).toBe(false);
    });

    it("should detect sleep injection", async () => {
      const result = await unwrapCheckResult(sqlCheck("1; SELECT SLEEP(10)--"));
      expect(result.ok).toBe(false);
    });
  });

  describe("scriptsCheck", () => {
    it("should pass clean text", async () => {
      const result = await unwrapCheckResult(scriptsCheck("Hello world"));
      expect(result.ok).toBe(true);
      expect(result.name).toBe("scripts");
    });

    it("should detect script tags", async () => {
      const result = await unwrapCheckResult(scriptsCheck("<script>alert('xss')</script>"));
      expect(result.ok).toBe(false);
      expect(result.message).toContain("script");
    });

    it("should detect inline event handlers", async () => {
      const result = await unwrapCheckResult(scriptsCheck('<img src="x" onerror="alert(1)">'));
      expect(result.ok).toBe(false);
    });

    it("should detect javascript: protocol", async () => {
      const result = await unwrapCheckResult(scriptsCheck('<a href="javascript:alert(1)">click</a>'));
      expect(result.ok).toBe(false);
    });

    it("should detect document. references", async () => {
      const result = await unwrapCheckResult(scriptsCheck("document.cookie"));
      expect(result.ok).toBe(false);
    });

    it("should detect window. references", async () => {
      const result = await unwrapCheckResult(scriptsCheck("window.location"));
      expect(result.ok).toBe(false);
    });

    it("should provide stripped value for adapter", async () => {
      const result = await unwrapCheckResult(scriptsCheck("<script>bad</script>Hello"));
      expect(result.ok).toBe(false);
      expect(result.value).toBeDefined();
      expect(result.value).not.toContain("<script>");
    });
  });

  describe("htmlCheck", () => {
    it("should pass clean text", async () => {
      const result = await unwrapCheckResult(htmlCheck("Hello world"));
      expect(result.ok).toBe(true);
      expect(result.name).toBe("html");
    });

    it("should allow safe tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<b>bold</b> <i>italic</i> <strong>strong</strong>"));
      expect(result.ok).toBe(true);
    });

    it("should block dangerous tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<iframe>test</iframe>"));
      expect(result.ok).toBe(false);
      expect(result.message).toContain("HTML not allowed");
      expect(result.details?.tags).toContain("iframe");
    });

    it("should block script tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<script>alert(1)</script>"));
      expect(result.ok).toBe(false);
      expect(result.details?.tags).toContain("script");
    });

    it("should block div tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<div>content</div>"));
      expect(result.ok).toBe(false);
      expect(result.details?.tags).toContain("div");
    });
  });

  describe("limitCheck", () => {
    it("should pass without limits", async () => {
      const result = await unwrapCheckResult(limitCheck("Hello world"));
      expect(result.ok).toBe(true);
      expect(result.name).toBe("limit");
    });

    it("should enforce character limit", async () => {
      const result = await unwrapCheckResult(limitCheck("Hello world", {
        limit: { maxChars: 5 },
      }));
      expect(result.ok).toBe(false);
      expect(result.message).toContain("Too long");
      expect(result.message).toContain("chars");
    });

    it("should pass under character limit", async () => {
      const result = await unwrapCheckResult(limitCheck("Hi", {
        limit: { maxChars: 5 },
      }));
      expect(result.ok).toBe(true);
    });

    it("should enforce word limit", async () => {
      const result = await unwrapCheckResult(limitCheck("one two three four five", {
        limit: { maxWords: 3 },
      }));
      expect(result.ok).toBe(false);
      expect(result.message).toContain("Too many words");
    });

    it("should pass under word limit", async () => {
      const result = await unwrapCheckResult(limitCheck("one two", {
        limit: { maxWords: 3 },
      }));
      expect(result.ok).toBe(true);
    });

    it("should include details", async () => {
      const result = await unwrapCheckResult(limitCheck("Hello world"));
      expect(result.details).toBeDefined();
      expect(result.details?.length).toBe(11);
      expect(result.details?.words).toBe(2);
    });
  });
});

