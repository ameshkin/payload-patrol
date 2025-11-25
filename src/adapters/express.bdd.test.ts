/**
 * Gherkin-style BDD tests for Express adapter
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { patrolMiddleware, validateFields } from "./express";

describe("Feature: patrolMiddleware - Express Middleware for Request Validation", () => {
  describe("Scenario: User applies middleware to Express app", () => {
    it("Given an Express app, When middleware is applied with default settings, Then SQLi should be blocked", async () => {
      const onError = vi.fn();
      const middleware = patrolMiddleware({ onError });
      const req: any = {
        body: {
          query: "'; DROP TABLE users; --",
        },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await middleware(req, res, next);

      expect(onError).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("Given an Express app, When middleware is applied with default settings, Then XSS should be blocked", async () => {
      const onError = vi.fn();
      const middleware = patrolMiddleware({ onError });
      const req: any = {
        body: {
          comment: "<script>alert(1)</script>",
        },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await middleware(req, res, next);

      expect(onError).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("Given an Express app, When middleware is applied and body is safe, Then request should proceed", async () => {
      const middleware = patrolMiddleware();
      const req: any = {
        body: {
          name: "Alice",
          email: "alice@example.com",
        },
      };
      const res: any = {};
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("Given an Express app, When middleware is applied with empty body, Then request should proceed", async () => {
      const middleware = patrolMiddleware();
      const req: any = {
        body: {},
      };
      const res: any = {};
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("Given an Express app, When middleware is applied with no body, Then request should proceed", async () => {
      const middleware = patrolMiddleware();
      const req: any = {};
      const res: any = {};
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("Scenario: User uses strip adapter mode", () => {
    it("Given an Express app with strip mode, When unsafe content is detected, Then body should be sanitized", async () => {
      const middleware = patrolMiddleware({ adapter: "strip" });
      const req: any = {
        body: {
          comment: "<script>alert(1)</script>Hello",
        },
      };
      const res: any = {};
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body.comment).toBeDefined();
    });
  });

  describe("Scenario: User provides custom error handler", () => {
    it("Given a user wants custom error handling, When they provide onError callback, Then it should be called on validation failure", async () => {
      const onError = vi.fn();
      const middleware = patrolMiddleware({
        onError,
      });
      const req: any = {
        body: {
          comment: "<script>alert(1)</script>",
        },
      };
      const res: any = {};
      const next = vi.fn();

      await middleware(req, res, next);

      expect(onError).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });
});

describe("Feature: validateFields - Validate Specific Fields in Request", () => {
  describe("Scenario: User validates specific fields", () => {
    it("Given an Express app, When validateFields is used, Then only specified fields should be validated", async () => {
      const middleware = validateFields(["name", "comment"]);
      const req: any = {
        body: {
          name: "Alice",
          comment: "<script>alert(1)</script>",
          email: "'; DROP TABLE users; --", // Should be ignored
        },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it("Given an Express app, When validateFields is used and all fields are safe, Then request should proceed", async () => {
      const middleware = validateFields(["name", "comment"]);
      const req: any = {
        body: {
          name: "Alice",
          comment: "Safe comment",
        },
      };
      const res: any = {};
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("Given an Express app, When validateFields is used with missing fields, Then request should proceed", async () => {
      const middleware = validateFields(["name", "comment"]);
      const req: any = {
        body: {
          email: "alice@example.com",
        },
      };
      const res: any = {};
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("Given an Express app, When validateFields is used with no body, Then request should proceed", async () => {
      const middleware = validateFields(["name"]);
      const req: any = {};
      const res: any = {};
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("Scenario: User uses strip adapter with validateFields", () => {
    it("Given an Express app with strip mode, When validateFields sanitizes content, Then sanitized values should be applied to body", async () => {
      const middleware = validateFields(["comment"], { adapter: "strip" });
      const req: any = {
        body: {
          comment: "<script>alert(1)</script>Hello",
        },
      };
      const res: any = {};
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body.comment).toBeDefined();
    });
  });
});

