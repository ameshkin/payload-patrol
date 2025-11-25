/**
 * Payload Patrol - Headless input defense
 * Framework-agnostic validation for web apps and APIs
 */

import { registerBuiltins } from "./lib/checks/builtins/index";
import { runChecks } from "./lib/checks/run";
import type {
  CheckName,
  CheckContext,
  CheckResult,
  RunChecksOptions,
  RunChecksResult,
  AdapterMode,
} from "./types";

// Auto-register built-in checks on module load
registerBuiltins();

// Re-export types
export type {
  CheckName,
  CheckContext,
  CheckResult,
  RunChecksOptions,
  RunChecksResult,
  AdapterMode,
};

// Re-export from internal for profanity management
export { registerProfanityList } from "./internal";

// Re-export registry for custom checks
export { registerCheck, getCheck, hasCheck, listChecks } from "./lib/checks/registry";

// Re-export sentiment analysis
export { analyzeSentiment } from "./lib/checks/builtins/index";
export type { SentimentResult } from "./lib/checks/builtins/index";

// Re-export runChecks for direct use
export { runChecks };

/**
 * Options for creating a patrol instance
 */
export interface PatrolOptions {
  /** Block SQL injection patterns (default: true) */
  blockSQLi?: boolean;
  /** Block XSS/script patterns (default: true) */
  blockXSS?: boolean;
  /** Allow HTML tags (default: false) */
  allowHTML?: boolean;
  /** Character and word limits */
  limit?: { maxChars?: number; maxWords?: number };
  /** Allowlist of terms that bypass badwords check */
  allowlist?: string[];
  /** Adapter mode: block, warn, or strip (default: "block") */
  adapter?: AdapterMode;
  /** Enable profanity checking (default: false) */
  checkProfanity?: boolean;
}

/**
 * Result of scanning a payload
 */
export interface ScanResult {
  /** Whether the payload passed all checks */
  ok: boolean;
  /** Array of issues found (path + check result) */
  issues: Array<{
    path: (string | number)[];
    rule: CheckName;
    message?: string;
    details?: Record<string, unknown>;
  }>;
  /** Sanitized value (when adapter="strip") */
  value?: unknown;
}

/**
 * Create a patrol instance with specific configuration
 * 
 * @example
 * ```ts
 * const patrol = createPatrol({
 *   blockSQLi: true,
 *   blockXSS: true,
 *   allowHTML: false,
 *   limit: { maxChars: 5000, maxWords: 800 }
 * });
 * 
 * const result = await patrol.scan({ name: "Alice", comment: "Hello world" });
 * if (!result.ok) {
 *   console.log(result.issues);
 * }
 * ```
 */
export function createPatrol(options: PatrolOptions = {}) {
  const {
    blockSQLi = true,
    blockXSS = true,
    allowHTML = false,
    limit,
    allowlist,
    adapter = "block",
    checkProfanity = false,
  } = options;

  // Build the checks array based on options
  const checks: CheckName[] = [];
  
  if (checkProfanity) {
    checks.push("badwords");
  }
  if (blockSQLi) {
    checks.push("sql");
  }
  if (blockXSS) {
    checks.push("scripts");
  }
  if (!allowHTML) {
    checks.push("html");
  }
  if (limit) {
    checks.push("limit");
  }

  const context: CheckContext = {
    limit,
    allowlist,
  };

  const runOptions: RunChecksOptions = {
    adapter,
    stopOnFirstBlock: adapter === "block",
  };

  /**
   * Scan a value or object for security issues
   * @param value - String, object, or array to scan
   * @param opts - Override options for this scan
   */
  async function scan(
    value: unknown,
    opts?: { adapter?: AdapterMode }
  ): Promise<ScanResult> {
    // Protect against prototype pollution at top level only
    if (value && typeof value === "object" && !Array.isArray(value) && value.constructor === Object) {
      const obj = value as Record<string, unknown>;
      // Check for dangerous keys using hasOwnProperty to catch direct properties
      // __proto__ is a special property that might not be enumerable, so we check directly
      const keys = Object.keys(obj);
      const hasProto = Object.prototype.hasOwnProperty.call(obj, "__proto__") || keys.includes("__proto__");
      const hasConstructor = Object.prototype.hasOwnProperty.call(obj, "constructor") || keys.includes("constructor");
      const hasPrototype = Object.prototype.hasOwnProperty.call(obj, "prototype") || keys.includes("prototype");
      
      if (hasProto || hasConstructor || hasPrototype) {
        return {
          ok: false,
          issues: [{
            path: [],
            rule: "scripts" as CheckName,
            message: "Prototype pollution attempt detected",
            details: { reason: "prototype_pollution" },
          }],
        };
      }
    }
    const scanAdapter = opts?.adapter ?? adapter;
    const scanOptions: RunChecksOptions = {
      ...runOptions,
      adapter: scanAdapter,
    };

    const issues: ScanResult["issues"] = [];

    // Handle different value types
    if (typeof value === "string") {
      const result = await runChecks(value, checks, context, scanOptions);
      // Collect all failed checks as issues (even in warn mode)
      for (const r of result.results) {
        if (!r.ok) {
          issues.push({
            path: [],
            rule: r.name,
            message: r.message,
            details: r.details,
          });
        }
      }
      return {
        ok: result.ok,
        issues,
        value: scanAdapter === "strip" ? result.value : undefined,
      };
    }

    // Handle arrays
    if (Array.isArray(value)) {
      let allOk = true;
      const scannedArray: unknown[] = [];

      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] === "string") {
          const result = await runChecks(value[i], checks, context, scanOptions);
          // Collect all failed checks as issues
          for (const r of result.results) {
            if (!r.ok) {
              allOk = false;
              issues.push({
                path: [i],
                rule: r.name,
                message: r.message,
                details: r.details,
              });
            }
          }
          scannedArray.push(scanAdapter === "strip" ? result.value : value[i]);
        } else if (typeof value[i] === "object") {
          const nested = await scan(value[i], opts);
          if (!nested.ok) {
            allOk = false;
            for (const issue of nested.issues) {
              issues.push({
                ...issue,
                path: [i, ...issue.path],
              });
            }
          }
          scannedArray.push(scanAdapter === "strip" ? nested.value : value[i]);
        } else {
          scannedArray.push(value[i]);
        }
      }

      return {
        ok: allOk,
        issues,
        value: scanAdapter === "strip" ? scannedArray : undefined,
      };
    }

    // Handle objects
    if (value && typeof value === "object") {
      let allOk = true;
      const scannedObj: Record<string, unknown> = {};

      for (const [key, val] of Object.entries(value)) {
        if (typeof val === "string") {
          const result = await runChecks(val, checks, context, scanOptions);
          // Collect all failed checks as issues
          for (const r of result.results) {
            if (!r.ok) {
              allOk = false;
              issues.push({
                path: [key],
                rule: r.name,
                message: r.message,
                details: r.details,
              });
            }
          }
          scannedObj[key] = scanAdapter === "strip" ? result.value : val;
        } else if (typeof val === "object") {
          const nested = await scan(val, opts);
          if (!nested.ok) {
            allOk = false;
            for (const issue of nested.issues) {
              issues.push({
                ...issue,
                path: [key, ...issue.path],
              });
            }
          }
          scannedObj[key] = scanAdapter === "strip" ? nested.value : val;
        } else {
          scannedObj[key] = val;
        }
      }

      return {
        ok: allOk,
        issues,
        value: scanAdapter === "strip" ? scannedObj : undefined,
      };
    }

    // Non-string, non-object values pass through
    return {
      ok: true,
      issues: [],
      value: scanAdapter === "strip" ? value : undefined,
    };
  }

  return {
    scan,
  };
}

/**
 * Quick audit of a single value without creating a patrol instance
 * Useful for one-off validations
 * 
 * @example
 * ```ts
 * const result = await auditPayload("Hello <script>alert(1)</script>", {
 *   adapter: "warn",
 *   checks: ["scripts", "html"]
 * });
 * ```
 */
export async function auditPayload(
  value: unknown,
  options: {
    adapter?: AdapterMode;
    checks?: CheckName[];
    context?: CheckContext;
  } = {}
): Promise<ScanResult> {
  const {
    adapter = "block",
    checks = ["badwords", "sql", "scripts", "html"],
    context = {},
  } = options;

  const patrol = createPatrol({
    adapter,
    blockSQLi: checks.includes("sql"),
    blockXSS: checks.includes("scripts"),
    allowHTML: !checks.includes("html"),
    checkProfanity: checks.includes("badwords"),
    limit: context.limit,
    allowlist: context.allowlist,
  });

  return patrol.scan(value, { adapter });
}
