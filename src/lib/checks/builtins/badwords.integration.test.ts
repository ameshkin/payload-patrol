import { describe, it, expect, beforeEach } from "vitest";
import { registerBadwords } from "./badwords";
import { badwordsCheck } from "./badwords";
import { unwrapCheckResult } from "../test-helpers.js";
import enSevereData from "../../../../data/en/severe.json";

const enSevere = enSevereData as string[];

describe("Badwords Check - Integration Tests", () => {
  beforeEach(() => {
    // Reset to default for each test
    registerBadwords((enSevere as string[]));
  });

  describe("Multi-language support", () => {
    it("should detect English profanity", async () => {
      const result = await unwrapCheckResult(badwordsCheck("You're an asshole"));
      expect(result.ok).toBe(false);
      expect(result.details?.hits).toBeDefined();
    });

    it("should handle custom word list", async () => {
      registerBadwords(["custombadword", "anotherbad"]);
      const result = await unwrapCheckResult(badwordsCheck("This contains custombadword"));
      expect(result.ok).toBe(false);
      expect(result.details?.hits).toContain("custombadword");
    });

    it("should replace previous list when registering new one", async () => {
      registerBadwords(["word1"]);
      registerBadwords(["word2"]);
      
      const result1 = await unwrapCheckResult(badwordsCheck("word1"));
      const result2 = await unwrapCheckResult(badwordsCheck("word2"));
      
      // word1 should not be detected (replaced)
      expect(result1.ok).toBe(true);
      // word2 should be detected
      expect(result2.ok).toBe(false);
    });
  });

  describe("Tokenization edge cases", () => {
    it("should handle punctuation", async () => {
      const result = await unwrapCheckResult(badwordsCheck("You're an asshole!"));
      expect(result.ok).toBe(false);
    });

    it("should handle multiple spaces", async () => {
      const result = await unwrapCheckResult(badwordsCheck("You  are   an    asshole"));
      expect(result.ok).toBe(false);
    });

    it("should handle mixed case", async () => {
      const result = await unwrapCheckResult(badwordsCheck("You're An AsShOlE"));
      expect(result.ok).toBe(false);
    });

    it("should handle numbers in words", async () => {
      registerBadwords(["test123"]);
      const result = await unwrapCheckResult(badwordsCheck("This is test123"));
      expect(result.ok).toBe(false);
    });
  });

  describe("Allowlist functionality", () => {
    it("should bypass allowlist words", async () => {
      const result = await unwrapCheckResult(badwordsCheck("scunthorpe", {
        allowlist: ["scunthorpe"]
      }));
      expect(result.ok).toBe(true);
    });

    it("should handle multiple allowlist words", async () => {
      registerBadwords(["word1", "word2", "word3"]);
      const result = await unwrapCheckResult(badwordsCheck("word1 word2 word3", {
        allowlist: ["word1", "word2"]
      }));
      // word3 should still be detected
      expect(result.ok).toBe(false);
    });

    it("should be case insensitive for allowlist", async () => {
      registerBadwords(["testword"]);
      const result = await unwrapCheckResult(badwordsCheck("TESTWORD", {
        allowlist: ["testword"]
      }));
      expect(result.ok).toBe(true);
    });
  });

  describe("Message formatting", () => {
    it("should limit hits in message", async () => {
      registerBadwords(["word1", "word2", "word3", "word4", "word5", "word6"]);
      const result = await unwrapCheckResult(badwordsCheck("word1 word2 word3 word4 word5 word6"));
      expect(result.ok).toBe(false);
      // Should only show first 5 in message
      if (result.message) {
        const hitsInMessage = result.message.split(":")[1]?.split(",").length || 0;
        expect(hitsInMessage).toBeLessThanOrEqual(5);
      }
    });

    it("should include unique hits only", async () => {
      registerBadwords(["word1"]);
      const result = await unwrapCheckResult(badwordsCheck("word1 word1 word1"));
      expect(result.ok).toBe(false);
      expect(result.details?.hits).toContain("word1");
    });
  });
});

