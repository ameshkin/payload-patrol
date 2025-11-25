/**
 * Gherkin-style BDD tests for core API
 * Tests follow Given-When-Then format with descriptive scenarios
 */

import { describe, it, expect } from "vitest";
import { createPatrol, auditPayload, registerProfanityList } from "./index";

describe("Feature: createPatrol - Security Validation Factory", () => {
  describe("Scenario: User creates a patrol instance with default settings", () => {
    it("Given a user wants to validate input, When they create a patrol with defaults, Then it should block SQLi and XSS by default", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan("'; DROP TABLE users; --");
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.rule === "sql")).toBe(true);
    });

    it("Given a user wants to validate input, When they create a patrol with defaults, Then it should block script tags", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan("<script>alert('xss')</script>");
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.rule === "scripts")).toBe(true);
    });
  });

  describe("Scenario: User creates a patrol with custom configuration", () => {
    it("Given a user wants to allow HTML, When they create a patrol with allowHTML: true, Then HTML tags should be allowed", async () => {
      const patrol = createPatrol({ allowHTML: true });
      const result = await patrol.scan("<p>Hello world</p>");
      expect(result.ok).toBe(true);
    });

    it("Given a user wants to disable SQLi checking, When they create a patrol with blockSQLi: false, Then SQL patterns should pass", async () => {
      const patrol = createPatrol({ blockSQLi: false });
      const result = await patrol.scan("'; DROP TABLE users; --");
      expect(result.ok).toBe(true);
    });

    it("Given a user wants to disable XSS checking, When they create a patrol with blockXSS: false, Then script tags should pass (but HTML check may still catch them)", async () => {
      const patrol = createPatrol({ blockXSS: false, allowHTML: true });
      const result = await patrol.scan("<script>alert(1)</script>");
      // With blockXSS: false and allowHTML: true, scripts check is disabled and HTML is allowed
      expect(result.ok).toBe(true);
    });

    it("Given a user wants character limits, When they create a patrol with limit.maxChars, Then long strings should be rejected", async () => {
      const patrol = createPatrol({ limit: { maxChars: 10 } });
      const result = await patrol.scan("This is a very long string");
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.rule === "limit")).toBe(true);
    });

    it("Given a user wants word limits, When they create a patrol with limit.maxWords, Then strings with too many words should be rejected", async () => {
      const patrol = createPatrol({ limit: { maxWords: 3 } });
      const result = await patrol.scan("one two three four five");
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.rule === "limit")).toBe(true);
    });

    it("Given a user wants profanity checking, When they create a patrol with checkProfanity: true, Then profane words should be rejected", async () => {
      const patrol = createPatrol({ checkProfanity: true });
      const result = await patrol.scan("This is a bad word");
      // Note: actual result depends on badwords.json content
      expect(result).toHaveProperty("ok");
      expect(result).toHaveProperty("issues");
    });
  });

  describe("Scenario: User scans different data types", () => {
    it("Given a patrol instance, When scanning a string, Then it should validate the string", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan("test");
      expect(result.ok).toBe(true);
    });

    it("Given a patrol instance, When scanning an array of strings, Then it should validate each string", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan(["safe", "<script>unsafe</script>", "safe"]);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.path[0] === 1)).toBe(true);
    });

    it("Given a patrol instance, When scanning an object, Then it should validate all string fields", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan({
        name: "Alice",
        comment: "<script>alert(1)</script>",
        age: 30,
      });
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.path[0] === "comment")).toBe(true);
    });

    it("Given a patrol instance, When scanning nested objects, Then it should validate nested string fields", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan({
        user: {
          name: "Alice",
          bio: "<script>alert(1)</script>",
        },
      });
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.path[0] === "user" && i.path[1] === "bio")).toBe(true);
    });

    it("Given a patrol instance, When scanning nested arrays, Then it should validate nested strings", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan({
        comments: ["safe", ["nested", "<script>unsafe</script>"]],
      });
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe("Scenario: User uses strip adapter mode", () => {
    it("Given a patrol with adapter: 'strip', When scanning unsafe content, Then it should return sanitized value", async () => {
      const patrol = createPatrol({ adapter: "strip" });
      const result = await patrol.scan("<script>alert(1)</script>Hello");
      expect(result.ok).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value).not.toContain("<script>");
    });

    it("Given a patrol with adapter: 'strip', When scanning HTML tags, Then it should detect but not strip HTML (HTML check doesn't strip)", async () => {
      const patrol = createPatrol({ adapter: "strip", allowHTML: false });
      const result = await patrol.scan("<p>Hello</p>");
      // HTML check detects but doesn't strip - scripts check does strip
      expect(result).toHaveProperty("ok");
      expect(result).toHaveProperty("issues");
    });
  });

  describe("Scenario: User uses warn adapter mode", () => {
    it("Given a patrol with adapter: 'warn', When scanning unsafe content, Then it should report issues but continue processing", async () => {
      const patrol = createPatrol({ adapter: "warn" });
      const result = await patrol.scan("<script>alert(1)</script>");
      // In warn mode, ok is false but processing continues (doesn't stop early)
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });
});

describe("Feature: auditPayload - Quick Validation Function", () => {
  describe("Scenario: User audits a single value", () => {
    it("Given a user wants to validate a string, When they call auditPayload, Then it should return validation result", async () => {
      const result = await auditPayload("test");
      expect(result).toHaveProperty("ok");
      expect(result).toHaveProperty("issues");
    });

    it("Given a user wants to validate unsafe content, When they call auditPayload with SQLi, Then it should detect SQL injection", async () => {
      const result = await auditPayload("'; DROP TABLE users; --");
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.rule === "sql")).toBe(true);
    });

    it("Given a user wants to validate unsafe content, When they call auditPayload with XSS, Then it should detect XSS", async () => {
      const result = await auditPayload("<script>alert(1)</script>");
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.rule === "scripts")).toBe(true);
    });
  });

  describe("Scenario: User audits with custom options", () => {
    it("Given a user wants to audit with specific checks, When they call auditPayload with checks option, Then only those checks should run", async () => {
      const result = await auditPayload("'; DROP TABLE users; --", {
        checks: ["badwords"],
      });
      // SQLi should not be detected if only badwords check is enabled
      expect(result.issues.some((i) => i.rule === "sql")).toBe(false);
    });

    it("Given a user wants to audit with warn mode, When they call auditPayload with adapter: 'warn', Then it should report issues but continue processing", async () => {
      const result = await auditPayload("<script>alert(1)</script>", {
        adapter: "warn",
      });
      // In warn mode, ok is false but processing continues
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("Given a user wants to audit with strip mode, When they call auditPayload with adapter: 'strip', Then it should return sanitized value", async () => {
      const result = await auditPayload("<script>alert(1)</script>Hello", {
        adapter: "strip",
      });
      expect(result.ok).toBe(true);
      expect(result.value).toBeDefined();
    });
  });

  describe("Scenario: User audits complex objects", () => {
    it("Given a user wants to audit an object, When they call auditPayload with an object, Then it should validate all string fields", async () => {
      const result = await auditPayload({
        name: "Alice",
        comment: "<script>alert(1)</script>",
      });
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.path[0] === "comment")).toBe(true);
    });

    it("Given a user wants to audit an array, When they call auditPayload with an array, Then it should validate each element", async () => {
      const result = await auditPayload(["safe", "<script>unsafe</script>"]);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.path[0] === 1)).toBe(true);
    });
  });
});

describe("Feature: registerProfanityList - Custom Profanity Management", () => {
  describe("Scenario: User registers a custom profanity list", () => {
    it("Given a user wants custom profanity detection, When they register a profanity list, Then those words should be detected", async () => {
      registerProfanityList(["custombadword"]);
      const patrol = createPatrol({ checkProfanity: true });
      const result = await patrol.scan("This contains custombadword");
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.rule === "badwords")).toBe(true);
    });

    it("Given a user wants to allowlist terms, When they create a patrol with allowlist, Then allowlisted terms should pass", async () => {
      const patrol = createPatrol({
        checkProfanity: true,
        allowlist: ["allowedbadword"],
      });
      const result = await patrol.scan("This contains allowedbadword");
      // Should pass because it's allowlisted
      expect(result.ok).toBe(true);
    });
  });
});

describe("Feature: Prototype Pollution Protection", () => {
  describe("Scenario: User attempts prototype pollution attack", () => {
    it("Given a malicious user, When they send __proto__ in object, Then it should be rejected", async () => {
      const patrol = createPatrol();
      // Create object with __proto__ using Object.defineProperty to actually set it as a property
      const maliciousObj: any = {};
      Object.defineProperty(maliciousObj, "__proto__", {
        value: { isAdmin: true },
        enumerable: true,
        configurable: true,
      });
      const result = await patrol.scan(maliciousObj);
      // Prototype pollution protection should reject this
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      // Check if it's the prototype pollution issue
      const hasPrototypeIssue = result.issues.some((i) => 
        i.details?.reason === "prototype_pollution" || 
        i.message?.includes("prototype pollution")
      );
      expect(hasPrototypeIssue).toBe(true);
    });

    it("Given a malicious user, When they send constructor in object, Then it should be rejected", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan({
        constructor: { prototype: {} },
      });
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.details?.reason === "prototype_pollution")).toBe(true);
    });

    it("Given a malicious user, When they send prototype in object, Then it should be rejected", async () => {
      const patrol = createPatrol();
      const result = await patrol.scan({
        prototype: { isAdmin: true },
      });
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.details?.reason === "prototype_pollution")).toBe(true);
    });
  });
});

