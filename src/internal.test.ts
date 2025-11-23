import { describe, it, expect } from "vitest";
import { registerProfanityList } from "./internal";

describe("Internal Utilities - Smoke Tests", () => {
  describe("registerProfanityList", () => {
    it("should register custom profanity list", () => {
      expect(() => registerProfanityList(["testword", "anotherword"])).not.toThrow();
    });

    it("should accept empty array", () => {
      expect(() => registerProfanityList([])).not.toThrow();
    });

    it("should accept array of strings", () => {
      expect(() => registerProfanityList(["word1", "word2"])).not.toThrow();
    });

    it("should be callable multiple times", () => {
      registerProfanityList(["first"]);
      registerProfanityList(["second"]);
      expect(() => registerProfanityList(["third"])).not.toThrow();
    });
  });
});

