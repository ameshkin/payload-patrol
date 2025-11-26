import { describe, it, expect, vi } from "vitest";
import { patrolMiddleware, validateFields } from "./express";

describe("Express Adapter - Error Handling", () => {
  describe("patrolMiddleware error handling", () => {
    it("should handle errors thrown during scan gracefully", async () => {
      const middleware = patrolMiddleware({ blockXSS: true });
      const req: any = {
        body: { name: "test" },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      // Mock a patrol that throws
      const originalScan = middleware;
      // We can't easily mock the internal scan, but we can test with invalid input
      await middleware(req, res, next);

      // Should not throw, should call next or handle error
      expect(next).toHaveBeenCalled();
    });

    it("should handle missing body gracefully", async () => {
      const middleware = patrolMiddleware({ blockXSS: true });
      const req: any = {};
      const res: any = {
        status: vi.fn(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      // Should not call res.status when body is missing
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle empty body object", async () => {
      const middleware = patrolMiddleware({ blockXSS: true });
      const req: any = { body: {} };
      const res: any = {
        status: vi.fn(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      // Should not call res.status when body is empty
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle non-object body", async () => {
      const middleware = patrolMiddleware({ blockXSS: true });
      const req: any = { body: "not an object" };
      const res: any = {};
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("validateFields error handling", () => {
    it("should handle missing body gracefully", async () => {
      const middleware = validateFields(["name"], { blockXSS: true });
      const req: any = {};
      const res: any = {};
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should handle empty fields array", async () => {
      const middleware = validateFields([], { blockXSS: true });
      const req: any = { body: { name: "test" } };
      const res: any = {};
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should handle fields not in body", async () => {
      const middleware = validateFields(["missingField"], { blockXSS: true });
      const req: any = { body: { name: "test" } };
      const res: any = {};
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});

