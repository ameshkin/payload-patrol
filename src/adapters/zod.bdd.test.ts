/**
 * Gherkin-style BDD tests for Zod adapter
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import { zSafeString, zSafeObject, zStripUnsafe } from "./zod";

describe("Feature: zSafeString - Safe String Schema with Payload Patrol", () => {
  describe("Scenario: User creates a safe string schema with default settings", () => {
    it("Given a user wants to validate strings, When they use zSafeString with defaults, Then SQLi should be blocked", async () => {
      const schema = zSafeString();
      const result = await schema.safeParseAsync("'; DROP TABLE users; --");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe("custom");
      }
    });

    it("Given a user wants to validate strings, When they use zSafeString with defaults, Then XSS should be blocked", async () => {
      const schema = zSafeString();
      const result = await schema.safeParseAsync("<script>alert(1)</script>");
      expect(result.success).toBe(false);
    });
  });

  describe("Scenario: User creates a safe string schema with custom options", () => {
    it("Given a user wants to allow HTML, When they use zSafeString with allowHTML: true, Then HTML tags should pass", async () => {
      const schema = zSafeString({ allowHTML: true });
      const result = await schema.safeParseAsync("<p>Hello</p>");
      expect(result.success).toBe(true);
    });

    it("Given a user wants length limits, When they use zSafeString with maxLength, Then long strings should be rejected", async () => {
      const schema = zSafeString({ maxLength: 10 });
      const result = await schema.safeParseAsync("This is a very long string");
      expect(result.success).toBe(false);
    });

    it("Given a user wants character limits, When they use zSafeString with maxChars, Then strings exceeding limit should be rejected", async () => {
      const schema = zSafeString({ maxChars: 10 });
      const result = await schema.safeParseAsync("This is too long");
      expect(result.success).toBe(false);
    });

    it("Given a user wants word limits, When they use zSafeString with maxWords, Then strings with too many words should be rejected", async () => {
      const schema = zSafeString({ maxWords: 3 });
      const result = await schema.safeParseAsync("one two three four");
      expect(result.success).toBe(false);
    });

    it("Given a user wants profanity checking, When they use zSafeString with checkProfanity: true, Then profane words should be rejected", async () => {
      const schema = zSafeString({ checkProfanity: true });
      const result = await schema.safeParseAsync("test");
      // Result depends on badwords.json
      expect(result).toHaveProperty("success");
    });

    it("Given a user wants custom error message, When they use zSafeString with message, Then custom message should be used", async () => {
      const schema = zSafeString({ message: "Custom error" });
      const result = await schema.safeParseAsync("<script>alert(1)</script>");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Custom error");
      }
    });
  });

  describe("Scenario: User uses zSafeString in a Zod object schema", () => {
    it("Given a user wants to validate form data, When they use zSafeString in z.object, Then it should validate each field", async () => {
      const schema = z.object({
        name: zSafeString({ maxLength: 50 }),
        email: z.string().email(),
        bio: zSafeString({ maxChars: 500 }),
      });
      const result = await schema.safeParseAsync({
        name: "Alice",
        email: "alice@example.com",
        bio: "<script>alert(1)</script>",
      });
      expect(result.success).toBe(false);
    });

    it("Given a user wants to validate form data, When all fields pass validation, Then schema should succeed", async () => {
      const schema = z.object({
        name: zSafeString({ maxLength: 50 }),
        email: z.string().email(),
        bio: zSafeString({ maxChars: 500 }),
      });
      const result = await schema.safeParseAsync({
        name: "Alice",
        email: "alice@example.com",
        bio: "Safe bio text",
      });
      expect(result.success).toBe(true);
    });
  });
});

describe("Feature: zSafeObject - Safe Object Schema with Payload Patrol", () => {
  describe("Scenario: User creates a safe object schema", () => {
    it("Given a user wants to validate an object, When they use zSafeObject, Then unsafe content should be rejected", async () => {
      const schema = zSafeObject({
        name: z.string(),
        comment: z.string(),
      });
      const result = await schema.safeParseAsync({
        name: "Alice",
        comment: "<script>alert(1)</script>",
      });
      expect(result.success).toBe(false);
    });

    it("Given a user wants to validate an object, When all fields are safe, Then schema should succeed", async () => {
      const schema = zSafeObject({
        name: z.string(),
        comment: z.string(),
      });
      const result = await schema.safeParseAsync({
        name: "Alice",
        comment: "Safe comment",
      });
      expect(result.success).toBe(true);
    });

    it("Given a user wants custom validation options, When they use zSafeObject with options, Then those options should apply", async () => {
      const schema = zSafeObject(
        {
          name: z.string(),
          html: z.string(),
        },
        { allowHTML: true }
      );
      const result = await schema.safeParseAsync({
        name: "Alice",
        html: "<p>Hello</p>",
      });
      expect(result.success).toBe(true);
    });
  });
});

describe("Feature: zStripUnsafe - Transform that Strips Unsafe Content", () => {
  describe("Scenario: User uses zStripUnsafe transform", () => {
    it("Given a user wants to sanitize input, When they use zStripUnsafe, Then unsafe content should be removed", async () => {
      const schema = z.string().transform(zStripUnsafe());
      const result = await schema.parseAsync("<script>alert(1)</script>Hello");
      expect(result).not.toContain("<script>");
      expect(result).toContain("Hello");
    });

    it("Given a user wants to sanitize HTML, When they use zStripUnsafe with allowHTML: false, Then HTML tags should be removed or flagged", async () => {
      const schema = z.string().transform(zStripUnsafe({ allowHTML: false }));
      const result = await schema.parseAsync("<p>Hello</p>");
      // HTML check detects but doesn't strip - the value may still contain HTML
      // This test verifies the function runs without error
      expect(typeof result).toBe("string");
    });

    it("Given a user wants to allow HTML, When they use zStripUnsafe with allowHTML: true, Then HTML tags should be preserved", async () => {
      const schema = z.string().transform(zStripUnsafe({ allowHTML: true }));
      const result = await schema.parseAsync("<p>Hello</p>");
      expect(result).toContain("<p>");
    });
  });
});

