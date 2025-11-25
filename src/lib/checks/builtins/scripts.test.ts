import { describe, it, expect } from "vitest";
import { scriptsCheck } from "./scripts";
import { unwrapCheckResult } from "../test-helpers.js";

describe("Scripts Check", () => {
  describe("XSS patterns", () => {
    it("should detect script tags", async () => {
      const result = await unwrapCheckResult(scriptsCheck("<script>alert('xss')</script>"));
      expect(result.ok).toBe(false);
      expect(result.name).toBe("scripts");
    });

    it("should detect event handlers", async () => {
      const result = await unwrapCheckResult(scriptsCheck('<img src="x" onerror="alert(1)">'));
      expect(result.ok).toBe(false);
    });

    it("should detect onclick", async () => {
      const result = await unwrapCheckResult(scriptsCheck('<button onclick="alert(1)">Click</button>'));
      expect(result.ok).toBe(false);
    });

    it("should detect onload", async () => {
      const result = await unwrapCheckResult(scriptsCheck('<body onload="alert(1)">'));
      expect(result.ok).toBe(false);
    });

    it("should detect javascript: protocol", async () => {
      const result = await unwrapCheckResult(scriptsCheck('<a href="javascript:alert(1)">click</a>'));
      expect(result.ok).toBe(false);
    });

    it("should detect document. access", async () => {
      const result = await unwrapCheckResult(scriptsCheck("document.cookie"));
      expect(result.ok).toBe(false);
    });

    it("should detect window. access", async () => {
      const result = await unwrapCheckResult(scriptsCheck("window.location"));
      expect(result.ok).toBe(false);
    });

    it("should detect eval()", async () => {
      const result = await unwrapCheckResult(scriptsCheck("eval('alert(1)')"));
      expect(result.ok).toBe(false);
    });
  });

  describe("Safe inputs", () => {
    it("should allow plain text", async () => {
      const result = await unwrapCheckResult(scriptsCheck("Hello world"));
      expect(result.ok).toBe(true);
    });

    it("should allow HTML without scripts", async () => {
      const result = await unwrapCheckResult(scriptsCheck("<b>bold</b>"));
      expect(result.ok).toBe(true);
    });

    it("should allow URLs", async () => {
      const result = await unwrapCheckResult(scriptsCheck("https://example.com"));
      expect(result.ok).toBe(true);
    });
  });

  describe("Strip functionality", () => {
    it("should strip script tags", async () => {
      const result = await unwrapCheckResult(scriptsCheck("<script>bad</script>Hello"));
      expect(result.value).toBeDefined();
      if (result.value && typeof result.value === "string") {
        expect(result.value).not.toContain("<script>");
        expect(result.value).toContain("Hello");
      }
    });

    it("should strip event handlers", async () => {
      const result = await unwrapCheckResult(scriptsCheck('<img src="x" onerror="alert(1)">'));
      expect(result.value).toBeDefined();
      if (result.value && typeof result.value === "string") {
        expect(result.value).not.toContain("onerror");
      }
    });

    it("should strip javascript: protocol", async () => {
      const result = await unwrapCheckResult(scriptsCheck('<a href="javascript:alert(1)">click</a>'));
      expect(result.value).toBeDefined();
      if (result.value && typeof result.value === "string") {
        expect(result.value).not.toContain("javascript:");
      }
    });
  });

  describe("Edge cases", () => {
    it("should handle empty string", async () => {
      const result = await unwrapCheckResult(scriptsCheck(""));
      expect(result.ok).toBe(true);
    });

    it("should handle case-insensitive detection", async () => {
      const result = await unwrapCheckResult(scriptsCheck("<SCRIPT>alert(1)</SCRIPT>"));
      expect(result.ok).toBe(false);
    });

    it("should handle mixed case", async () => {
      const result = await unwrapCheckResult(scriptsCheck("<ScRiPt>alert(1)</ScRiPt>"));
      expect(result.ok).toBe(false);
    });

    it("should handle multiple script tags", async () => {
      const result = await unwrapCheckResult(
        scriptsCheck("<script>bad1</script><script>bad2</script>Hello")
      );
      expect(result.ok).toBe(false);
      if (result.value && typeof result.value === "string") {
        expect(result.value).not.toContain("<script>");
      }
    });

    it("should provide details on detection", async () => {
      const result = await unwrapCheckResult(scriptsCheck("<script>bad</script>"));
      expect(result.details).toBeDefined();
      if (result.details && "rules" in result.details) {
        const rules = result.details.rules as string[];
        expect(rules.length).toBeGreaterThan(0);
      }
    });
  });
});

