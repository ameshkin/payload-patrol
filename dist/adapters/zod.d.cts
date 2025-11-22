import { z } from 'zod';
import { A as AdapterMode } from '../types-BiereNHs.cjs';

/**
 * Zod adapter for Payload Patrol
 * Lightweight integration for schema-level validation
 */

interface ZodSafeStringOptions {
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
declare function zSafeString(opts?: ZodSafeStringOptions): z.ZodEffects<z.ZodString, string, string>;
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
declare function zSafeObject<T extends z.ZodRawShape>(shape: T, opts?: Omit<ZodSafeStringOptions, "maxLength" | "minLength">): z.ZodEffects<z.ZodObject<T, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<T>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<T> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<T>, any> extends infer T_3 ? { [k in keyof T_3]: T_3[k]; } : never, z.baseObjectInputType<T> extends infer T_4 ? { [k_1 in keyof T_4]: T_4[k_1]; } : never>;
/**
 * Transform that strips unsafe content instead of blocking
 *
 * @example
 * ```ts
 * const schema = z.string().transform(zStripUnsafe());
 * ```
 */
declare function zStripUnsafe(opts?: Omit<ZodSafeStringOptions, "adapter">): (value: string) => Promise<string>;

export { type ZodSafeStringOptions, zSafeObject, zSafeString, zStripUnsafe };
