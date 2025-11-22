import { describe, it, expect, beforeEach } from "vitest";
import { registerCheck, getCheck, hasCheck, listChecks } from "./registry";

describe("Check Registry - Smoke Tests", () => {
  describe("registerCheck", () => {
    it("should register a check", () => {
      const mockCheck = (value: string) => ({ name: "test", ok: true });
      registerCheck("test-check", mockCheck);
      
      expect(hasCheck("test-check")).toBe(true);
    });

    it("should allow retrieving registered check", () => {
      const mockCheck = (value: string) => ({ name: "custom", ok: true });
      registerCheck("custom-check", mockCheck);
      
      const retrieved = getCheck("custom-check");
      expect(retrieved).toBeDefined();
      expect(retrieved.name).toBe("custom-check");
    });
  });

  describe("getCheck", () => {
    it("should throw for unknown check", () => {
      expect(() => getCheck("nonexistent-check-xyz")).toThrow("Unknown check");
    });

    it("should return registered check", () => {
      const mockCheck = (value: string) => ({ name: "foo", ok: true });
      registerCheck("foo-check", mockCheck);
      
      const check = getCheck("foo-check");
      expect(check.run).toBe(mockCheck);
    });
  });

  describe("hasCheck", () => {
    it("should return false for unregistered check", () => {
      expect(hasCheck("definitely-not-registered-xyz")).toBe(false);
    });

    it("should return true for registered check", () => {
      registerCheck("bar-check", () => ({ name: "bar", ok: true }));
      expect(hasCheck("bar-check")).toBe(true);
    });
  });

  describe("listChecks", () => {
    it("should return array of registered check names", () => {
      const checks = listChecks();
      expect(Array.isArray(checks)).toBe(true);
    });

    it("should include registered checks", () => {
      registerCheck("listed-check", () => ({ name: "listed", ok: true }));
      const checks = listChecks();
      expect(checks).toContain("listed-check");
    });
  });
});

