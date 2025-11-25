/**
 * Gherkin-style BDD tests for Hono adapter
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { patrol, validateFields } from "./hono";

describe("Feature: patrol - Hono Middleware for Request Validation", () => {
  describe("Scenario: User applies middleware to Hono app", () => {
    it("Given a Hono app, When middleware is applied with default settings, Then SQLi should be blocked", async () => {
      const middleware = patrol();
      const c: any = {
        req: {
          header: vi.fn().mockReturnValue("application/json"),
          json: vi.fn().mockResolvedValue({
            query: "'; DROP TABLE users; --",
          }),
        },
        json: vi.fn(),
      };
      const next = vi.fn().mockResolvedValue(undefined);

      await middleware(c, next);

      expect(c.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Invalid input",
        }),
        400
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("Given a Hono app, When middleware is applied with default settings, Then XSS should be blocked", async () => {
      const middleware = patrol();
      const c: any = {
        req: {
          header: vi.fn().mockReturnValue("application/json"),
          json: vi.fn().mockResolvedValue({
            comment: "<script>alert(1)</script>",
          }),
        },
        json: vi.fn(),
      };
      const next = vi.fn().mockResolvedValue(undefined);

      await middleware(c, next);

      expect(c.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("Given a Hono app, When middleware is applied and body is safe, Then request should proceed", async () => {
      const middleware = patrol();
      const c: any = {
        req: {
          header: vi.fn().mockReturnValue("application/json"),
          json: vi.fn().mockResolvedValue({
            name: "Alice",
            email: "alice@example.com",
          }),
        },
        set: vi.fn(),
      };
      const next = vi.fn().mockResolvedValue(undefined);

      await middleware(c, next);

      expect(next).toHaveBeenCalled();
    });

    it("Given a Hono app, When middleware is applied with non-JSON content type, Then request should proceed without validation", async () => {
      const middleware = patrol();
      const c: any = {
        req: {
          header: vi.fn().mockReturnValue("text/plain"),
        },
      };
      const next = vi.fn().mockResolvedValue(undefined);

      await middleware(c, next);

      expect(next).toHaveBeenCalled();
    });

    it("Given a Hono app, When middleware is applied with empty body, Then request should proceed", async () => {
      const middleware = patrol();
      const c: any = {
        req: {
          header: vi.fn().mockReturnValue("application/json"),
          json: vi.fn().mockResolvedValue({}),
        },
        set: vi.fn(),
      };
      const next = vi.fn().mockResolvedValue(undefined);

      await middleware(c, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("Scenario: User uses strip adapter mode", () => {
    it("Given a Hono app with strip mode, When unsafe content is detected, Then sanitized body should be stored", async () => {
      const middleware = patrol({ adapter: "strip" });
      const originalBody = {
        comment: "<script>alert(1)</script>Hello",
      };
      const c: any = {
        req: {
          header: vi.fn().mockReturnValue("application/json"),
          json: vi.fn().mockResolvedValue(originalBody),
        },
        set: vi.fn(),
      };
      const next = vi.fn().mockResolvedValue(undefined);

      await middleware(c, next);

      // In strip mode, sanitizedBody should be set (either sanitized or original)
      expect(c.set).toHaveBeenCalledWith("sanitizedBody", expect.anything());
      expect(next).toHaveBeenCalled();
    });
  });

  describe("Scenario: User provides custom status code", () => {
    it("Given a user wants custom status code, When they provide status option, Then it should be used on validation failure", async () => {
      const middleware = patrol({ status: 422 });
      const c: any = {
        req: {
          header: vi.fn().mockReturnValue("application/json"),
          json: vi.fn().mockResolvedValue({
            comment: "<script>alert(1)</script>",
          }),
        },
        json: vi.fn(),
      };
      const next = vi.fn().mockResolvedValue(undefined);

      await middleware(c, next);

      expect(c.json).toHaveBeenCalledWith(expect.anything(), 422);
    });
  });
});

describe("Feature: validateFields - Validate Specific Fields in Hono Request", () => {
  describe("Scenario: User validates specific fields", () => {
    it("Given a Hono app, When validateFields is used, Then only specified fields should be validated", async () => {
      const middleware = validateFields(["name", "comment"]);
      const c: any = {
        req: {
          header: vi.fn().mockReturnValue("application/json"),
          json: vi.fn().mockResolvedValue({
            name: "Alice",
            comment: "<script>alert(1)</script>",
            email: "'; DROP TABLE users; --", // Should be ignored
          }),
        },
        json: vi.fn(),
      };
      const next = vi.fn().mockResolvedValue(undefined);

      await middleware(c, next);

      expect(c.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("Given a Hono app, When validateFields is used and all fields are safe, Then request should proceed", async () => {
      const middleware = validateFields(["name", "comment"]);
      const c: any = {
        req: {
          header: vi.fn().mockReturnValue("application/json"),
          json: vi.fn().mockResolvedValue({
            name: "Alice",
            comment: "Safe comment",
          }),
        },
        set: vi.fn(),
      };
      const next = vi.fn().mockResolvedValue(undefined);

      await middleware(c, next);

      expect(next).toHaveBeenCalled();
    });

    it("Given a Hono app, When validateFields is used with missing fields, Then request should proceed", async () => {
      const middleware = validateFields(["name", "comment"]);
      const c: any = {
        req: {
          header: vi.fn().mockReturnValue("application/json"),
          json: vi.fn().mockResolvedValue({
            email: "alice@example.com",
          }),
        },
        set: vi.fn(),
      };
      const next = vi.fn().mockResolvedValue(undefined);

      await middleware(c, next);

      expect(next).toHaveBeenCalled();
    });

    it("Given a Hono app, When validateFields is used with no body, Then request should proceed", async () => {
      const middleware = validateFields(["name"]);
      const c: any = {
        req: {
          header: vi.fn().mockReturnValue("application/json"),
          json: vi.fn().mockResolvedValue(null),
        },
        set: vi.fn(),
      };
      const next = vi.fn().mockResolvedValue(undefined);

      await middleware(c, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("Scenario: User uses strip adapter with validateFields", () => {
    it("Given a Hono app with strip mode, When validateFields sanitizes content, Then sanitized values should be stored", async () => {
      const middleware = validateFields(["comment"], { adapter: "strip" });
      const c: any = {
        req: {
          header: vi.fn().mockReturnValue("application/json"),
          json: vi.fn().mockResolvedValue({
            comment: "<script>alert(1)</script>Hello",
            name: "Alice",
          }),
        },
        set: vi.fn(),
      };
      const next = vi.fn().mockResolvedValue(undefined);

      await middleware(c, next);

      expect(c.set).toHaveBeenCalledWith("sanitizedBody", expect.anything());
      expect(next).toHaveBeenCalled();
    });
  });
});

