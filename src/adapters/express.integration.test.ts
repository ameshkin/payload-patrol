import { describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock Express for testing
const mockRequest = (body: any) => ({
  body,
  headers: {},
});

const mockResponse = () => {
  const res: any = {
    status: (code: number) => {
      res.statusCode = code;
      return res;
    },
    json: (data: any) => {
      res.body = data;
      return res;
    },
    send: (data: any) => {
      res.body = data;
      return res;
    },
  };
  return res;
};


describe("Express Adapter - Integration Tests", () => {
  beforeEach(async () => {
    // Ensure express types are available
  });

  describe("patrolMiddleware", () => {
    it("should pass clean request body", async () => {
      const { patrolMiddleware } = await import("./express");
      const middleware = patrolMiddleware({
        blockXSS: true,
        blockSQLi: true,
      });

      const req = mockRequest({ name: "Alice", comment: "Hello world" });
      const res = mockResponse();

      let nextCalled = false;
      const nextFn = () => { nextCalled = true; };
      await middleware(req as any, res as any, nextFn as any);
      expect(nextCalled).toBe(true); // Should call next() without error
    });

    it("should block XSS in request body", async () => {
      const { patrolMiddleware } = await import("./express");
      const middleware = patrolMiddleware({
        blockXSS: true,
        adapter: "block",
      });

      const req = mockRequest({ name: "<script>alert(1)</script>" });
      const res = mockResponse();
      let error: any = null;
      const next = (err?: any) => {
        error = err;
      };

      await middleware(req as any, res as any, next);
      expect(error).toBeDefined();
      expect(error.type).toBe("payload-patrol");
      expect(error.issues).toBeDefined();
    });

    it("should block SQL injection in request body", async () => {
      const { patrolMiddleware } = await import("./express");
      const middleware = patrolMiddleware({
        blockSQLi: true,
        adapter: "block",
      });

      const req = mockRequest({ query: "'; DROP TABLE users;--" });
      const res = mockResponse();
      let error: any = null;
      const next = (err?: any) => {
        error = err;
      };

      await middleware(req as any, res as any, next);
      expect(error).toBeDefined();
      expect(error.type).toBe("payload-patrol");
    });

    it("should validate nested objects", async () => {
      const { patrolMiddleware } = await import("./express");
      const middleware = patrolMiddleware({
        blockXSS: true,
        adapter: "block",
      });

      const req = mockRequest({
        user: {
          name: "Alice",
          bio: "<script>bad</script>",
        },
      });
      const res = mockResponse();
      let error: any = null;
      const next = (err?: any) => {
        error = err;
      };

      await middleware(req as any, res as any, next);
      expect(error).toBeDefined();
      expect(error.issues[0].path).toContain("user");
      expect(error.issues[0].path).toContain("bio");
    });

    it("should validate arrays in request body", async () => {
      const { patrolMiddleware } = await import("./express");
      const middleware = patrolMiddleware({
        blockXSS: true,
        adapter: "block",
      });

      const req = mockRequest({
        comments: ["clean", "<script>bad</script>"],
      });
      const res = mockResponse();
      let error: any = null;
      const next = (err?: any) => {
        error = err;
      };

      await middleware(req as any, res as any, next);
      expect(error).toBeDefined();
      expect(error.issues[0].path).toContain("comments");
    });
  });

  describe("validateFields", () => {
    it("should validate specific fields only", async () => {
      const { validateFields } = await import("./express");
      const middleware = validateFields(["name", "email"], {
        blockXSS: true,
        adapter: "block",
      });

      const req = mockRequest({
        name: "<script>bad</script>",
        email: "test@example.com",
        other: "<script>also bad</script>", // Should not be validated
      });
      const res = mockResponse();
      let error: any = null;
      const next = (err?: any) => {
        error = err;
      };

      await middleware(req as any, res as any, next);
      // In block mode, onError sends response, so check res.statusCode and res.body
      expect(res.statusCode).toBe(400);
      expect(res.body).toBeDefined();
      expect(res.body.issues).toBeDefined();
      expect(Array.isArray(res.body.issues)).toBe(true);
      expect(res.body.issues.length).toBeGreaterThan(0);
      // Should only report issue for 'name', not 'other'
      const nameIssue = res.body.issues.find((issue: any) => 
        issue.path && (issue.path.includes("name") || issue.path === "name")
      );
      expect(nameIssue).toBeDefined();
      // Should NOT have an issue for 'other' field
      const otherIssue = res.body.issues.find((issue: any) => 
        issue.path && issue.path.includes("other")
      );
      expect(otherIssue).toBeUndefined();
    });

    it("should pass when specified fields are clean", async () => {
      const { validateFields } = await import("./express");
      const middleware = validateFields(["name"], {
        blockXSS: true,
      });

      const req = mockRequest({
        name: "Alice",
        other: "<script>bad</script>", // Not validated
      });
      const res = mockResponse();

      let nextCalled = false;
      const nextFn = () => { nextCalled = true; };
      await middleware(req as any, res as any, nextFn as any);
      expect(nextCalled).toBe(true); // Should pass
    });

    it("should handle missing fields gracefully", async () => {
      const { validateFields } = await import("./express");
      const middleware = validateFields(["name", "email"], {
        blockXSS: true,
      });

      const req = mockRequest({}); // Empty body
      const res = mockResponse();

      let nextCalled = false;
      const nextFn = () => { nextCalled = true; };
      await middleware(req as any, res as any, nextFn as any);
      // Should not throw, just skip missing fields
      expect(nextCalled).toBe(true);
    });
  });
});

