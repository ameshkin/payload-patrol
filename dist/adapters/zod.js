import {
  auditPayload
} from "../chunk-5OUZV3ZB.js";

// src/adapters/zod.ts
import { z } from "zod";
function zSafeString(opts = {}) {
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
    message
  } = opts;
  let schema = z.string();
  if (minLength !== void 0) {
    schema = schema.min(minLength);
  }
  if (maxLength !== void 0) {
    schema = schema.max(maxLength);
  }
  return schema.refine(
    async (value) => {
      const checks = [];
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
          allowlist
        }
      });
      return result.ok;
    },
    {
      message: message || "Input contains unsafe content",
      // Provide detailed error via params
      params: {
        code: "unsafe_content"
      }
    }
  );
}
function zSafeObject(shape, opts = {}) {
  return z.object(shape).refine(
    async (value) => {
      const result = await auditPayload(value, {
        adapter: opts.adapter || "block",
        checks: [
          ...opts.checkProfanity ? ["badwords"] : [],
          ...opts.blockSQLi !== false ? ["sql"] : [],
          ...opts.blockXSS !== false ? ["scripts"] : [],
          ...opts.allowHTML === false ? ["html"] : []
        ],
        context: {
          limit: { maxChars: opts.maxChars, maxWords: opts.maxWords },
          allowlist: opts.allowlist
        }
      });
      return result.ok;
    },
    {
      message: opts.message || "Object contains unsafe content",
      params: {
        code: "unsafe_content"
      }
    }
  );
}
function zStripUnsafe(opts = {}) {
  return async (value) => {
    const checks = [];
    if (opts.blockXSS !== false) checks.push("scripts");
    if (!opts.allowHTML) checks.push("html");
    const result = await auditPayload(value, {
      adapter: "strip",
      checks,
      context: {
        allowlist: opts.allowlist
      }
    });
    return result.value || value;
  };
}
export {
  zSafeObject,
  zSafeString,
  zStripUnsafe
};
//# sourceMappingURL=zod.js.map