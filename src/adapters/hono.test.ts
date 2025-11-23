import { describe, it, expect } from "vitest";

describe("Hono Adapter - Smoke Tests", () => {
  it("should export patrol function", async () => {
    const { patrol } = await import("./hono");
    expect(typeof patrol).toBe("function");
  });

  it("should export validateFields", async () => {
    const { validateFields } = await import("./hono");
    expect(typeof validateFields).toBe("function");
  });

  // Note: Full integration tests require hono to be installed
  // These are smoke tests to verify exports work
});

