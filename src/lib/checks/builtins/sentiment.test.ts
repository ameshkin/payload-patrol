import { describe, it, expect } from "vitest";
import { analyzeSentiment, sentimentCheck } from "./sentiment";
import { unwrapCheckResult } from "../test-helpers.js";

describe("Sentiment Analysis - Smoke Tests", () => {
  describe("analyzeSentiment", () => {
    it("should detect positive sentiment", () => {
      const result = analyzeSentiment("I love this product! It's amazing and wonderful!");
      expect(result.mood).toBe("positive");
      expect(result.score).toBeGreaterThan(0);
      expect(result.positive.length).toBeGreaterThan(0);
    });

    it("should detect negative sentiment", () => {
      const result = analyzeSentiment("I hate this. It's terrible and awful.");
      expect(result.mood).toBe("negative");
      expect(result.score).toBeLessThan(0);
      expect(result.negative.length).toBeGreaterThan(0);
    });

    it("should detect neutral sentiment", () => {
      const result = analyzeSentiment("This is a thing.");
      expect(result.mood).toBe("neutral");
      expect(Math.abs(result.comparative)).toBeLessThan(0.1);
    });

    it("should handle empty string", () => {
      const result = analyzeSentiment("");
      expect(result.mood).toBe("neutral");
      expect(result.tokens).toBe(0);
      expect(result.score).toBe(0);
    });

    it("should count tokens", () => {
      const result = analyzeSentiment("hello world test");
      expect(result.tokens).toBe(3);
    });

    it("should calculate comparative score", () => {
      const result = analyzeSentiment("good");
      expect(result.comparative).toBe(result.score / result.tokens);
    });

    it("should handle negation", () => {
      const positive = analyzeSentiment("good");
      const negated = analyzeSentiment("not good");
      
      expect(positive.score).toBeGreaterThan(0);
      expect(negated.score).toBeLessThanOrEqual(0);
    });

    it("should handle intensifiers", () => {
      const normal = analyzeSentiment("good");
      const intensified = analyzeSentiment("very good");
      
      expect(Math.abs(intensified.score)).toBeGreaterThan(Math.abs(normal.score));
    });

    it("should identify positive words", () => {
      const result = analyzeSentiment("I love and enjoy this");
      expect(result.positive).toContain("love");
      expect(result.positive).toContain("enjoy");
    });

    it("should identify negative words", () => {
      const result = analyzeSentiment("This is bad and terrible");
      expect(result.negative).toContain("bad");
      expect(result.negative).toContain("terrible");
    });

    it("should be case insensitive", () => {
      const lower = analyzeSentiment("good");
      const upper = analyzeSentiment("GOOD");
      expect(lower.score).toBe(upper.score);
    });

    it("should handle mixed sentiment", () => {
      const result = analyzeSentiment("I love the design but hate the price");
      expect(result.positive.length).toBeGreaterThan(0);
      expect(result.negative.length).toBeGreaterThan(0);
    });

    it("should handle real user feedback", () => {
      const feedback = "The customer service was excellent and the product quality exceeded my expectations!";
      const result = analyzeSentiment(feedback);
      expect(result.mood).toBe("positive");
      expect(result.score).toBeGreaterThan(0);
    });

    it("should handle complaint", () => {
      const complaint = "Disappointed with the product. Poor quality and terrible support.";
      const result = analyzeSentiment(complaint);
      expect(result.mood).toBe("negative");
      expect(result.score).toBeLessThan(0);
    });

    it("should handle neutral review", () => {
      const review = "The product arrived on time. It works as described in the manual.";
      const result = analyzeSentiment(review);
      expect(result.mood).toBe("neutral");
    });
  });

  describe("sentimentCheck", () => {
    it("should always pass (informational only)", async () => {
      const result = await unwrapCheckResult(sentimentCheck("I hate this terrible product"));
      expect(result.ok).toBe(true);
      expect(result.name).toBe("sentiment");
    });

    it("should provide detailed results", async () => {
      const result = await unwrapCheckResult(sentimentCheck("I love this amazing product!"));
      expect(result.details).toBeDefined();
      expect(result.details?.mood).toBe("positive");
      expect(result.details?.score).toBeDefined();
      expect(result.details?.comparative).toBeDefined();
    });

    it("should include word lists in details", async () => {
      const result = await unwrapCheckResult(sentimentCheck("I love this but hate that"));
      expect(result.details?.positive).toBeDefined();
      expect(result.details?.negative).toBeDefined();
      expect(Array.isArray(result.details?.positive)).toBe(true);
      expect(Array.isArray(result.details?.negative)).toBe(true);
    });

    it("should include token count", async () => {
      const result = await unwrapCheckResult(sentimentCheck("hello world"));
      expect(result.details?.tokens).toBe(2);
    });

    it("should work with empty string", async () => {
      const result = await unwrapCheckResult(sentimentCheck(""));
      expect(result.ok).toBe(true);
      expect(result.details?.mood).toBe("neutral");
    });
  });
});

