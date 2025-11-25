import { describe, it, expect } from "vitest";

describe("Hono Adapter - Integration Tests", () => {
  describe("patrol middleware", () => {
    it("should export patrol function", async () => {
      const { patrol } = await import("./hono");
      expect(typeof patrol).toBe("function");
    });

    it("should create middleware with options", async () => {
      const { patrol } = await import("./hono");
      const middleware = patrol({
        blockXSS: true,
        blockSQLi: true,
      });
      expect(typeof middleware).toBe("function");
    });

    it("should handle block mode configuration", async () => {
      const { patrol } = await import("./hono");
      const middleware = patrol({
        blockXSS: true,
        adapter: "block",
      });
      expect(typeof middleware).toBe("function");
    });
  });

  describe("validateFields", () => {
    it("should export validateFields function", async () => {
      const { validateFields } = await import("./hono");
      expect(typeof validateFields).toBe("function");
    });

    it("should create middleware for specific fields", async () => {
      const { validateFields } = await import("./hono");
      const middleware = validateFields(["name", "email"], {
        blockXSS: true,
        adapter: "block",
      });
      expect(typeof middleware).toBe("function");
    });

    it("should accept field validation options", async () => {
      const { validateFields } = await import("./hono");
      const middleware = validateFields(["name"], {
        blockXSS: true,
        checkProfanity: true,
      });
      expect(typeof middleware).toBe("function");
    });
  });

  // Note: Full integration tests require Hono framework to be installed
  // These tests verify the functions are exported and can be called
});

