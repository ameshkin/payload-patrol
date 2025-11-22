import { describe, it, expect } from "vitest";
import { createPatrol, auditPayload, registerProfanityList } from "./index";

describe("Core API - Smoke Tests", () => {
  describe("createPatrol", () => {
    it("should create a patrol instance", () => {
      const patrol = createPatrol();
      expect(patrol).toBeDefined();
      expect(typeof patrol.scan).toBe("function");
    });

    it("should scan clean string and pass", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan("Hello world");
      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should detect SQL injection", async () => {
      const patrol = createPatrol({ blockSQLi: true });
      const result = await patrol.scan("'; DROP TABLE users;--");
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].rule).toBe("sql");
    });

    it("should detect XSS", async () => {
      const patrol = createPatrol({ blockXSS: true });
      const result = await patrol.scan("<script>alert(1)</script>");
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should scan objects", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan({
        name: "Alice",
        comment: "<script>bad</script>",
      });
      expect(result.ok).toBe(false);
      expect(result.issues[0].path).toContain("comment");
    });

    it("should scan arrays", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan([
        "clean text",
        "<script>bad</script>",
      ]);
      expect(result.ok).toBe(false);
      expect(result.issues[0].path).toContain(1);
    });

    it("should scan nested objects", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan({
        user: {
          name: "Alice",
          bio: "'; DROP TABLE users;--",
        },
      });
      expect(result.ok).toBe(false);
      expect(result.issues[0].path).toEqual(["user", "bio"]);
    });

    it("should respect character limits", async () => {
      const patrol = createPatrol({ limit: { maxChars: 10 } });
      const result = await patrol.scan("This is a very long string");
      expect(result.ok).toBe(false);
      expect(result.issues[0].rule).toBe("limit");
    });

    it("should allow HTML when configured", async () => {
      const patrol = createPatrol({ allowHTML: true });
      const result = await patrol.scan("<b>bold</b>");
      expect(result.ok).toBe(true);
    });

    it("should block HTML by default", async () => {
      const patrol = createPatrol({ allowHTML: false });
      const result = await patrol.scan("<div>test</div>");
      expect(result.ok).toBe(false);
      expect(result.issues[0].rule).toBe("html");
    });
  });

  describe("createPatrol - adapter modes", () => {
    it("should strip dangerous content in strip mode", async () => {
      const patrol = createPatrol({ adapter: "strip", blockXSS: true });
      const result = await patrol.scan("<script>bad</script>Hello");
      expect(result.ok).toBe(true); // strip mode passes after sanitizing
      expect(result.value).toBeDefined();
      expect(result.value).not.toContain("<script>");
    });

    it("should warn in warn mode", async () => {
      const patrol = createPatrol({ adapter: "warn" });
      const result = await patrol.scan("<script>bad</script>");
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should allow adapter override in scan", async () => {
      const patrol = createPatrol({ adapter: "block" });
      const result = await patrol.scan("<script>bad</script>", {
        adapter: "strip",
      });
      expect(result.ok).toBe(true);
    });
  });

  describe("createPatrol - profanity", () => {
    it("should check profanity when enabled", async () => {
      registerProfanityList(["badword"]);
      const patrol = createPatrol({ checkProfanity: true });
      const result = await patrol.scan("This is a badword");
      expect(result.ok).toBe(false);
      expect(result.issues[0].rule).toBe("badwords");
    });

    it("should not check profanity by default", async () => {
      registerProfanityList(["badword"]);
      const patrol = createPatrol({ checkProfanity: false });
      const result = await patrol.scan("This is a badword");
      // Should not fail on badwords since profanity check is disabled
      // (will only fail if it triggers other checks)
      const hasBadwordIssue = result.issues.some((i) => i.rule === "badwords");
      expect(hasBadwordIssue).toBe(false);
    });

    it("should respect allowlist", async () => {
      registerProfanityList(["scunthorpe"]);
      const patrol = createPatrol({
        checkProfanity: true,
        allowlist: ["scunthorpe"],
      });
      const result = await patrol.scan("scunthorpe problem");
      expect(result.ok).toBe(true);
    });
  });

  describe("auditPayload", () => {
    it("should audit a single value", async () => {
      const result = await auditPayload("Hello world");
      expect(result.ok).toBe(true);
    });

    it("should detect issues", async () => {
      const result = await auditPayload("<script>alert(1)</script>");
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should accept custom checks", async () => {
      const result = await auditPayload("test", {
        checks: ["limit"],
        context: { limit: { maxChars: 2 } },
      });
      expect(result.ok).toBe(false);
      expect(result.issues[0].rule).toBe("limit");
    });

    it("should work with objects", async () => {
      const result = await auditPayload({
        name: "Alice",
        email: "test@example.com",
        comment: "'; DROP TABLE users;--",
      });
      expect(result.ok).toBe(false);
    });

    it("should support strip mode", async () => {
      const result = await auditPayload("<script>bad</script>Good", {
        adapter: "strip",
        checks: ["scripts"],
      });
      expect(result.ok).toBe(true);
      expect(result.value).not.toContain("<script>");
    });
  });

  describe("edge cases", () => {
    it("should handle null gracefully", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan(null);
      expect(result.ok).toBe(true);
    });

    it("should handle undefined gracefully", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan(undefined);
      expect(result.ok).toBe(true);
    });

    it("should handle numbers gracefully", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan(42);
      expect(result.ok).toBe(true);
    });

    it("should handle empty string", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan("");
      expect(result.ok).toBe(true);
    });

    it("should handle empty object", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan({});
      expect(result.ok).toBe(true);
    });

    it("should handle empty array", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan([]);
      expect(result.ok).toBe(true);
    });
  });
});

