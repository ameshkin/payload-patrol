import { describe, it, expect, vi } from "vitest";

// Mock express types - express is optional peer dependency
// Type definitions will be available if @types/express is installed

describe("Express Adapter - Smoke Tests", () => {
  it("should export patrolMiddleware", async () => {
    const { patrolMiddleware } = await import("./express");
    expect(typeof patrolMiddleware).toBe("function");
  });

  it("should export validateFields", async () => {
    const { validateFields } = await import("./express");
    expect(typeof validateFields).toBe("function");
  });

  // Note: Full integration tests require express to be installed
  // These are smoke tests to verify exports work
});

