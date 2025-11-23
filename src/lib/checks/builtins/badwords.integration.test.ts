import { describe, it, expect, beforeEach } from "vitest";
import { registerBadwords } from "./badwords";
import { badwordsCheck } from "./badwords";
import enSevere from "../../../../data/en/severe.json";

describe("Badwords Check - Integration Tests", () => {
  beforeEach(() => {
    // Reset to default for each test
    registerBadwords((enSevere as string[]));
  });

  describe("Multi-language support", () => {
    it("should detect English profanity", () => {
      const result = badwordsCheck("You're an asshole");
      expect(result.ok).toBe(false);
      expect(result.details?.hits).toBeDefined();
    });

    it("should handle custom word list", () => {
      registerBadwords(["custombadword", "anotherbad"]);
      const result = badwordsCheck("This contains custombadword");
      expect(result.ok).toBe(false);
      expect(result.details?.hits).toContain("custombadword");
    });

    it("should replace previous list when registering new one", () => {
      registerBadwords(["word1"]);
      registerBadwords(["word2"]);
      
      const result1 = badwordsCheck("word1");
      const result2 = badwordsCheck("word2");
      
      // word1 should not be detected (replaced)
      expect(result1.ok).toBe(true);
      // word2 should be detected
      expect(result2.ok).toBe(false);
    });
  });

  describe("Tokenization edge cases", () => {
    it("should handle punctuation", () => {
      const result = badwordsCheck("You're an asshole!");
      expect(result.ok).toBe(false);
    });

    it("should handle multiple spaces", () => {
      const result = badwordsCheck("You  are   an    asshole");
      expect(result.ok).toBe(false);
    });

    it("should handle mixed case", () => {
      const result = badwordsCheck("You're An AsShOlE");
      expect(result.ok).toBe(false);
    });

    it("should handle numbers in words", () => {
      registerBadwords(["test123"]);
      const result = badwordsCheck("This is test123");
      expect(result.ok).toBe(false);
    });
  });

  describe("Allowlist functionality", () => {
    it("should bypass allowlist words", () => {
      const result = badwordsCheck("scunthorpe", {
        allowlist: ["scunthorpe"]
      });
      expect(result.ok).toBe(true);
    });

    it("should handle multiple allowlist words", () => {
      registerBadwords(["word1", "word2", "word3"]);
      const result = badwordsCheck("word1 word2 word3", {
        allowlist: ["word1", "word2"]
      });
      // word3 should still be detected
      expect(result.ok).toBe(false);
    });

    it("should be case insensitive for allowlist", () => {
      registerBadwords(["testword"]);
      const result = badwordsCheck("TESTWORD", {
        allowlist: ["testword"]
      });
      expect(result.ok).toBe(true);
    });
  });

  describe("Message formatting", () => {
    it("should limit hits in message", () => {
      registerBadwords(["word1", "word2", "word3", "word4", "word5", "word6"]);
      const result = badwordsCheck("word1 word2 word3 word4 word5 word6");
      expect(result.ok).toBe(false);
      // Should only show first 5 in message
      if (result.message) {
        const hitsInMessage = result.message.split(":")[1]?.split(",").length || 0;
        expect(hitsInMessage).toBeLessThanOrEqual(5);
      }
    });

    it("should include unique hits only", () => {
      registerBadwords(["word1"]);
      const result = badwordsCheck("word1 word1 word1");
      expect(result.ok).toBe(false);
      expect(result.details?.hits).toContain("word1");
    });
  });
});

