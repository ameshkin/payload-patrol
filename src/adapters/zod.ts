/**
 * Zod adapter for Payload Patrol
 * Lightweight integration for schema-level validation
 */

import { z } from "zod";
import { auditPayload } from "../index";
import type { CheckName, AdapterMode } from "../types";

export interface ZodSafeStringOptions {
  /** Maximum string length */
  maxLength?: number;
  /** Minimum string length */
  minLength?: number;
  /** Block SQL injection patterns (default: true) */
  blockSQLi?: boolean;
  /** Block XSS/script patterns (default: true) */
  blockXSS?: boolean;
  /** Allow HTML tags (default: false) */
  allowHTML?: boolean;
  /** Check profanity (default: false) */
  checkProfanity?: boolean;
  /** Maximum character count */
  maxChars?: number;
  /** Maximum word count */
  maxWords?: number;
  /** Allowlist of terms */
  allowlist?: string[];
  /** Adapter mode (default: "block") */
  adapter?: AdapterMode;
  /** Custom error message */
  message?: string;
}

/**
 * Create a safe string schema with Payload Patrol validation
 * 
 * @example
 * ```ts
 * const schema = z.object({
 *   name: zSafeString({ maxLength: 128 }),
 *   email: zSafeString({ allowHTML: false }),
 *   bio: zSafeString({ maxChars: 500, checkProfanity: true })
 * });
 * ```
 */
export function zSafeString(opts: ZodSafeStringOptions = {}) {
  const {
    maxLength,
    minLength,
    blockSQLi = true,
    blockXSS = true,
    allowHTML = false,
    checkProfanity = false,
    maxChars,
    maxWords,
    allowlist,
    adapter = "block",
    message,
  } = opts;

  let schema = z.string();

  // Apply basic string validations
  if (minLength !== undefined) {
    schema = schema.min(minLength);
  }
  if (maxLength !== undefined) {
    schema = schema.max(maxLength);
  }

  // Add Payload Patrol refinement
  return schema.refine(
    async (value) => {
      const checks: CheckName[] = [];
      
      if (checkProfanity) checks.push("badwords");
      if (blockSQLi) checks.push("sql");
      if (blockXSS) checks.push("scripts");
      if (!allowHTML) checks.push("html");
      if (maxChars || maxWords) checks.push("limit");

      const result = await auditPayload(value, {
        adapter,
        checks,
        context: {
          limit: { maxChars, maxWords },
          allowlist,
        },
      });

      return result.ok;
    },
    {
      message: message || "Input contains unsafe content",
      // Provide detailed error via params
      params: {
        code: "unsafe_content",
      },
    }
  );
}

/**
 * Create a safe object schema that validates all string fields
 * 
 * @example
 * ```ts
 * const schema = zSafeObject({
 *   name: z.string(),
 *   email: z.string().email(),
 *   age: z.number()
 * }, { blockXSS: true, blockSQLi: true });
 * ```
 */
export function zSafeObject<T extends z.ZodRawShape>(
  shape: T,
  opts: Omit<ZodSafeStringOptions, "maxLength" | "minLength"> = {}
) {
  return z.object(shape).refine(
    async (value) => {
      const result = await auditPayload(value, {
        adapter: opts.adapter || "block",
        checks: [
          ...(opts.checkProfanity ? ["badwords" as CheckName] : []),
          ...(opts.blockSQLi !== false ? ["sql" as CheckName] : []),
          ...(opts.blockXSS !== false ? ["scripts" as CheckName] : []),
          ...(opts.allowHTML === false ? ["html" as CheckName] : []),
        ],
        context: {
          limit: { maxChars: opts.maxChars, maxWords: opts.maxWords },
          allowlist: opts.allowlist,
        },
      });
      return result.ok;
    },
    {
      message: opts.message || "Object contains unsafe content",
      params: {
        code: "unsafe_content",
      },
    }
  );
}

/**
 * Transform that strips unsafe content instead of blocking
 * 
 * @example
 * ```ts
 * const schema = z.string().transform(zStripUnsafe());
 * ```
 */
export function zStripUnsafe(opts: Omit<ZodSafeStringOptions, "adapter"> = {}) {
  return async (value: string) => {
    const checks: CheckName[] = [];
    
    if (opts.blockXSS !== false) checks.push("scripts");
    if (!opts.allowHTML) checks.push("html");

    const result = await auditPayload(value, {
      adapter: "strip",
      checks,
      context: {
        allowlist: opts.allowlist,
      },
    });

    return (result.value as string) || value;
  };
}
