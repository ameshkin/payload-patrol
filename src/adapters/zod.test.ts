import { describe, it, expect } from "vitest";
import { z } from "zod";
import { zSafeString, zSafeObject, zStripUnsafe } from "./zod";

describe("Zod Adapter - Smoke Tests", () => {
  describe("zSafeString", () => {
    it("should validate clean string", async () => {
      const schema = zSafeString();
      await expect(schema.parseAsync("Hello world")).resolves.toBe("Hello world");
    });

    it("should block XSS", async () => {
      const schema = zSafeString({ blockXSS: true });
      await expect(schema.parseAsync("<script>alert(1)</script>")).rejects.toThrow();
    });

    it("should block SQL injection", async () => {
      const schema = zSafeString({ blockSQLi: true });
      await expect(schema.parseAsync("'; DROP TABLE users;--")).rejects.toThrow();
    });

    it("should block HTML by default", async () => {
      const schema = zSafeString();
      await expect(schema.parseAsync("<div>test</div>")).rejects.toThrow();
    });

    it("should allow HTML when configured", async () => {
      const schema = zSafeString({ allowHTML: true });
      await expect(schema.parseAsync("<b>bold</b>")).resolves.toBe("<b>bold</b>");
    });

    it("should enforce maxLength", async () => {
      const schema = zSafeString({ maxLength: 5 });
      await expect(schema.parseAsync("Hello world")).rejects.toThrow();
      await expect(schema.parseAsync("Hi")).resolves.toBe("Hi");
    });

    it("should enforce minLength", async () => {
      const schema = zSafeString({ minLength: 5 });
      await expect(schema.parseAsync("Hi")).rejects.toThrow();
      await expect(schema.parseAsync("Hello")).resolves.toBe("Hello");
    });

    it("should enforce character limits", async () => {
      const schema = zSafeString({ maxChars: 10 });
      await expect(schema.parseAsync("This is too long")).rejects.toThrow();
    });

    it("should work in object schema", async () => {
      const schema = z.object({
        name: zSafeString({ maxLength: 128 }),
        email: z.string().email(),
      });

      await expect(schema.parseAsync({
        name: "Alice",
        email: "alice@example.com",
      })).resolves.toBeDefined();

      await expect(schema.parseAsync({
        name: "<script>bad</script>",
        email: "alice@example.com",
      })).rejects.toThrow();
    });
  });

  describe("zSafeObject", () => {
    it("should validate clean object", async () => {
      const schema = zSafeObject({
        name: z.string(),
        age: z.number(),
      });

      await expect(schema.parseAsync({
        name: "Alice",
        age: 30,
      })).resolves.toBeDefined();
    });

    it("should block XSS in object fields", async () => {
      const schema = zSafeObject({
        name: z.string(),
        bio: z.string(),
      }, { blockXSS: true });

      await expect(schema.parseAsync({
        name: "Alice",
        bio: "<script>alert(1)</script>",
      })).rejects.toThrow();
    });

    it("should allow safe content", async () => {
      const schema = zSafeObject({
        name: z.string(),
        comment: z.string(),
      });

      await expect(schema.parseAsync({
        name: "Bob",
        comment: "This is a safe comment",
      })).resolves.toBeDefined();
    });
  });

  describe("zStripUnsafe", () => {
    it("should strip scripts", async () => {
      const schema = z.string().transform(zStripUnsafe());
      const result = await schema.parseAsync("<script>bad</script>Hello");
      expect(result).not.toContain("<script>");
      expect(result).toContain("Hello");
    });

    it("should strip scripts from HTML", async () => {
      const schema = z.string().transform(zStripUnsafe({ blockXSS: true }));
      const result = await schema.parseAsync('<div onclick="alert(1)">content</div>');
      // Note: html check doesn't strip, only scripts check does
      expect(result).not.toContain("onclick");
    });

    it("should preserve clean content", async () => {
      const schema = z.string().transform(zStripUnsafe());
      const result = await schema.parseAsync("Hello world");
      expect(result).toBe("Hello world");
    });
  });
});

