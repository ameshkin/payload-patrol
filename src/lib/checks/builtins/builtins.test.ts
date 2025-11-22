import { describe, it, expect, beforeAll } from "vitest";
import { registerBuiltins } from "./index";
import { badwordsCheck } from "./badwords";
import { sqlCheck } from "./sql";
import { scriptsCheck } from "./scripts";
import { htmlCheck } from "./html";
import { limitCheck } from "./limit";

describe("Built-in Checks - Smoke Tests", () => {
  beforeAll(() => {
    registerBuiltins();
  });

  describe("badwordsCheck", () => {
    it("should pass clean text", () => {
      const result = badwordsCheck("Hello world");
      expect(result.ok).toBe(true);
      expect(result.name).toBe("badwords");
    });

    it("should detect profanity from badwords.json", () => {
      // Test with a word we know is in badwords.json
      const result = badwordsCheck("You are an asshole");
      expect(result.ok).toBe(false);
      expect(result.name).toBe("badwords");
      expect(result.message).toContain("blocked terms");
    });

    it("should respect allowlist", () => {
      const result = badwordsCheck("scunthorpe problem", {
        allowlist: ["scunthorpe"],
      });
      expect(result.ok).toBe(true);
    });

    it("should be case insensitive", () => {
      const result = badwordsCheck("ASSHOLE");
      expect(result.ok).toBe(false);
    });
  });

  describe("sqlCheck", () => {
    it("should pass clean text", () => {
      const result = sqlCheck("Hello world");
      expect(result.ok).toBe(true);
      expect(result.name).toBe("sql");
    });

    it("should detect UNION SELECT", () => {
      const result = sqlCheck("1' UNION SELECT * FROM users--");
      expect(result.ok).toBe(false);
      expect(result.message).toContain("SQL");
    });

    it("should detect DROP TABLE", () => {
      const result = sqlCheck("'; DROP TABLE users;--");
      expect(result.ok).toBe(false);
    });

    it("should detect OR 1=1", () => {
      const result = sqlCheck("admin' OR 1=1--");
      expect(result.ok).toBe(false);
    });

    it("should detect SQL comments", () => {
      const result = sqlCheck("test -- comment");
      expect(result.ok).toBe(false);
    });

    it("should detect sleep injection", () => {
      const result = sqlCheck("1; SELECT SLEEP(10)--");
      expect(result.ok).toBe(false);
    });
  });

  describe("scriptsCheck", () => {
    it("should pass clean text", () => {
      const result = scriptsCheck("Hello world");
      expect(result.ok).toBe(true);
      expect(result.name).toBe("scripts");
    });

    it("should detect script tags", () => {
      const result = scriptsCheck("<script>alert('xss')</script>");
      expect(result.ok).toBe(false);
      expect(result.message).toContain("script");
    });

    it("should detect inline event handlers", () => {
      const result = scriptsCheck('<img src="x" onerror="alert(1)">');
      expect(result.ok).toBe(false);
    });

    it("should detect javascript: protocol", () => {
      const result = scriptsCheck('<a href="javascript:alert(1)">click</a>');
      expect(result.ok).toBe(false);
    });

    it("should detect document. references", () => {
      const result = scriptsCheck("document.cookie");
      expect(result.ok).toBe(false);
    });

    it("should detect window. references", () => {
      const result = scriptsCheck("window.location");
      expect(result.ok).toBe(false);
    });

    it("should provide stripped value for adapter", () => {
      const result = scriptsCheck("<script>bad</script>Hello");
      expect(result.ok).toBe(false);
      expect(result.value).toBeDefined();
      expect(result.value).not.toContain("<script>");
    });
  });

  describe("htmlCheck", () => {
    it("should pass clean text", () => {
      const result = htmlCheck("Hello world");
      expect(result.ok).toBe(true);
      expect(result.name).toBe("html");
    });

    it("should allow safe tags", () => {
      const result = htmlCheck("<b>bold</b> <i>italic</i> <strong>strong</strong>");
      expect(result.ok).toBe(true);
    });

    it("should block dangerous tags", () => {
      const result = htmlCheck("<iframe>test</iframe>");
      expect(result.ok).toBe(false);
      expect(result.message).toContain("HTML not allowed");
      expect(result.details?.tags).toContain("iframe");
    });

    it("should block script tags", () => {
      const result = htmlCheck("<script>alert(1)</script>");
      expect(result.ok).toBe(false);
      expect(result.details?.tags).toContain("script");
    });

    it("should block div tags", () => {
      const result = htmlCheck("<div>content</div>");
      expect(result.ok).toBe(false);
      expect(result.details?.tags).toContain("div");
    });
  });

  describe("limitCheck", () => {
    it("should pass without limits", () => {
      const result = limitCheck("Hello world");
      expect(result.ok).toBe(true);
      expect(result.name).toBe("limit");
    });

    it("should enforce character limit", () => {
      const result = limitCheck("Hello world", {
        limit: { maxChars: 5 },
      });
      expect(result.ok).toBe(false);
      expect(result.message).toContain("Too long");
      expect(result.message).toContain("chars");
    });

    it("should pass under character limit", () => {
      const result = limitCheck("Hi", {
        limit: { maxChars: 5 },
      });
      expect(result.ok).toBe(true);
    });

    it("should enforce word limit", () => {
      const result = limitCheck("one two three four five", {
        limit: { maxWords: 3 },
      });
      expect(result.ok).toBe(false);
      expect(result.message).toContain("Too many words");
    });

    it("should pass under word limit", () => {
      const result = limitCheck("one two", {
        limit: { maxWords: 3 },
      });
      expect(result.ok).toBe(true);
    });

    it("should include details", () => {
      const result = limitCheck("Hello world");
      expect(result.details).toBeDefined();
      expect(result.details?.length).toBe(11);
      expect(result.details?.words).toBe(2);
    });
  });
});

