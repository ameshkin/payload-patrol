import { describe, it, expect } from "vitest";
import { htmlCheck } from "./html";
import { unwrapCheckResult } from "../test-helpers.js";

describe("HTML Check", () => {
  describe("Allowed tags", () => {
    it("should allow basic formatting tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<b>bold</b>"));
      expect(result.ok).toBe(true);
    });

    it("should allow italic tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<i>italic</i>"));
      expect(result.ok).toBe(true);
    });

    it("should allow underline tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<u>underline</u>"));
      expect(result.ok).toBe(true);
    });

    it("should allow strong tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<strong>strong</strong>"));
      expect(result.ok).toBe(true);
    });

    it("should allow em tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<em>emphasis</em>"));
      expect(result.ok).toBe(true);
    });

    it("should allow br tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("Line 1<br>Line 2"));
      expect(result.ok).toBe(true);
    });

    it("should allow span tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<span>text</span>"));
      expect(result.ok).toBe(true);
    });

    it("should allow multiple allowed tags", async () => {
      const result = await unwrapCheckResult(
        htmlCheck("<b>bold</b> <i>italic</i> <strong>strong</strong>")
      );
      expect(result.ok).toBe(true);
    });
  });

  describe("Blocked tags", () => {
    it("should block script tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<script>alert(1)</script>"));
      expect(result.ok).toBe(false);
      expect(result.name).toBe("html");
      expect(result.message).toContain("script");
    });

    it("should block div tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<div>content</div>"));
      expect(result.ok).toBe(false);
      expect(result.message).toContain("div");
    });

    it("should block iframe tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<iframe src='evil.com'></iframe>"));
      expect(result.ok).toBe(false);
      expect(result.message).toContain("iframe");
    });

    it("should block img tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<img src='test.jpg'>"));
      expect(result.ok).toBe(false);
      expect(result.message).toContain("img");
    });

    it("should block a tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<a href='test'>link</a>"));
      expect(result.ok).toBe(false);
      expect(result.message).toContain("a");
    });

    it("should block style tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<style>body { color: red; }</style>"));
      expect(result.ok).toBe(false);
      expect(result.message).toContain("style");
    });

    it("should block multiple disallowed tags", async () => {
      const result = await unwrapCheckResult(
        htmlCheck("<div>content</div><iframe>test</iframe>")
      );
      expect(result.ok).toBe(false);
      expect(result.details).toBeDefined();
      if (result.details && "tags" in result.details) {
        const tags = result.details.tags as string[];
        expect(tags.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe("Edge cases", () => {
    it("should handle empty string", async () => {
      const result = await unwrapCheckResult(htmlCheck(""));
      expect(result.ok).toBe(true);
    });

    it("should handle plain text", async () => {
      const result = await unwrapCheckResult(htmlCheck("Hello world"));
      expect(result.ok).toBe(true);
    });

    it("should handle malformed tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<div>unclosed"));
      expect(result.ok).toBe(false);
    });

    it("should handle tags with attributes", async () => {
      const result = await unwrapCheckResult(htmlCheck("<div class='test'>content</div>"));
      expect(result.ok).toBe(false);
    });

    it("should handle self-closing tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<br/>"));
      expect(result.ok).toBe(true);
    });

    it("should handle uppercase tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<DIV>content</DIV>"));
      expect(result.ok).toBe(false);
    });

    it("should handle mixed case tags", async () => {
      const result = await unwrapCheckResult(htmlCheck("<DiV>content</DiV>"));
      expect(result.ok).toBe(false);
    });

    it("should handle tags with whitespace", async () => {
      const result = await unwrapCheckResult(htmlCheck("< div >content</ div >"));
      expect(result.ok).toBe(false);
    });
  });
});

