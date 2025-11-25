import { describe, it, expect } from "vitest";
import { limitCheck } from "./limit";
import { unwrapCheckResult } from "../test-helpers.js";
import type { CheckContext } from "../../../types";

describe("Limit Check", () => {
  describe("Character limits", () => {
    it("should pass when under character limit", async () => {
      const ctx: CheckContext = { limit: { maxChars: 100 } };
      const result = await unwrapCheckResult(limitCheck("Hello", ctx));
      expect(result.ok).toBe(true);
    });

    it("should fail when over character limit", async () => {
      const ctx: CheckContext = { limit: { maxChars: 10 } };
      const result = await unwrapCheckResult(limitCheck("This is a very long string", ctx));
      expect(result.ok).toBe(false);
      expect(result.name).toBe("limit");
      expect(result.message).toContain("Too long");
    });

    it("should pass when exactly at character limit", async () => {
      const ctx: CheckContext = { limit: { maxChars: 5 } };
      const result = await unwrapCheckResult(limitCheck("Hello", ctx));
      expect(result.ok).toBe(true);
    });

    it("should include character count in message", async () => {
      const ctx: CheckContext = { limit: { maxChars: 5 } };
      const result = await unwrapCheckResult(limitCheck("Hello World", ctx));
      expect(result.message).toContain("11");
      expect(result.message).toContain("5");
    });
  });

  describe("Word limits", () => {
    it("should pass when under word limit", async () => {
      const ctx: CheckContext = { limit: { maxWords: 10 } };
      const result = await unwrapCheckResult(limitCheck("one two three", ctx));
      expect(result.ok).toBe(true);
    });

    it("should fail when over word limit", async () => {
      const ctx: CheckContext = { limit: { maxWords: 3 } };
      const result = await unwrapCheckResult(limitCheck("one two three four five", ctx));
      expect(result.ok).toBe(false);
      expect(result.message).toContain("Too many words");
    });

    it("should pass when exactly at word limit", async () => {
      const ctx: CheckContext = { limit: { maxWords: 3 } };
      const result = await unwrapCheckResult(limitCheck("one two three", ctx));
      expect(result.ok).toBe(true);
    });

    it("should include word count in message", async () => {
      const ctx: CheckContext = { limit: { maxWords: 3 } };
      const result = await unwrapCheckResult(limitCheck("one two three four", ctx));
      expect(result.message).toContain("4");
      expect(result.message).toContain("3");
    });
  });

  describe("Combined limits", () => {
    it("should fail on character limit even if word limit passes", async () => {
      const ctx: CheckContext = { limit: { maxChars: 10, maxWords: 100 } };
      const result = await unwrapCheckResult(limitCheck("This is a very long string", ctx));
      expect(result.ok).toBe(false);
      expect(result.message).toContain("Too long");
    });

    it("should fail on word limit even if character limit passes", async () => {
      const ctx: CheckContext = { limit: { maxChars: 1000, maxWords: 3 } };
      const result = await unwrapCheckResult(limitCheck("one two three four five", ctx));
      expect(result.ok).toBe(false);
      expect(result.message).toContain("Too many words");
    });

    it("should pass when both limits are satisfied", async () => {
      const ctx: CheckContext = { limit: { maxChars: 100, maxWords: 10 } };
      const result = await unwrapCheckResult(limitCheck("one two three", ctx));
      expect(result.ok).toBe(true);
    });
  });

  describe("No limits", () => {
    it("should pass when no limits are set", async () => {
      const result = await unwrapCheckResult(limitCheck("Any length string here", {}));
      expect(result.ok).toBe(true);
    });

    it("should pass when limit is 0", async () => {
      const ctx: CheckContext = { limit: { maxChars: 0, maxWords: 0 } };
      const result = await unwrapCheckResult(limitCheck("test", ctx));
      expect(result.ok).toBe(true);
    });
  });

  describe("Details", () => {
    it("should include length and word count in details", async () => {
      const ctx: CheckContext = { limit: { maxChars: 100, maxWords: 10 } };
      const result = await unwrapCheckResult(limitCheck("one two three", ctx));
      expect(result.details).toBeDefined();
      if (result.details && "length" in result.details) {
        expect(result.details.length).toBe(13);
        expect(result.details.words).toBe(3);
        expect(result.details.maxChars).toBe(100);
        expect(result.details.maxWords).toBe(10);
      }
    });
  });

  describe("Edge cases", () => {
    it("should handle empty string", async () => {
      const ctx: CheckContext = { limit: { maxChars: 10, maxWords: 5 } };
      const result = await unwrapCheckResult(limitCheck("", ctx));
      expect(result.ok).toBe(true);
    });

    it("should handle whitespace-only string", async () => {
      const ctx: CheckContext = { limit: { maxChars: 10, maxWords: 5 } };
      const result = await unwrapCheckResult(limitCheck("   ", ctx));
      expect(result.ok).toBe(true);
    });

    it("should handle multiple spaces between words", async () => {
      const ctx: CheckContext = { limit: { maxWords: 3 } };
      const result = await unwrapCheckResult(limitCheck("one  two   three", ctx));
      expect(result.ok).toBe(true);
    });

    it("should handle leading/trailing whitespace", async () => {
      const ctx: CheckContext = { limit: { maxWords: 3 } };
      const result = await unwrapCheckResult(limitCheck("  one two three  ", ctx));
      expect(result.ok).toBe(true);
    });
  });
});

