import { C as CheckName, a as CheckContext, R as RunChecksOptions, b as RunChecksResult, A as AdapterMode } from './types-BiereNHs.cjs';
export { c as CheckResult } from './types-BiereNHs.cjs';

/**
 * runChecks
 * Inputs: value (string), list of check names, optional context and adapter options.
 * Output: aggregate result with per-check results and possibly sanitized value.
 */
declare function runChecks(value: string, checks: Array<CheckName>, ctx?: CheckContext, opts?: RunChecksOptions): Promise<RunChecksResult>;

/**
 * Register a custom profanity/badwords list
 * This replaces the default badwords.json list
 *
 * @example
 * ```ts
 * import { registerProfanityList } from '@ameshkin/payload-patrol';
 *
 * // Use custom English words
 * registerProfanityList(['spam', 'scam', 'fake']);
 *
 * // Or load from JSON
 * import badwords from './data/en/severe.json';
 * registerProfanityList(badwords);
 * ```
 */
declare function registerProfanityList(words: string[]): void;

declare function registerCheck(name: string, run: (value: string, ctx?: any) => any): void;
declare function getCheck(name: string): {
    name: string;
    run: (v: string, ctx?: any) => any;
};
declare function hasCheck(name: string): boolean;
declare function listChecks(): string[];

interface SentimentResult {
    score: number;
    comparative: number;
    mood: "negative" | "neutral" | "positive";
    tokens: number;
    positive: string[];
    negative: string[];
}
/**
 * Analyze sentiment of text and return detailed results
 */
declare function analyzeSentiment(text: string): SentimentResult;

/**
 * Payload Patrol - Headless input defense
 * Framework-agnostic validation for web apps and APIs
 */

/**
 * Options for creating a patrol instance
 */
interface PatrolOptions {
    /** Block SQL injection patterns (default: true) */
    blockSQLi?: boolean;
    /** Block XSS/script patterns (default: true) */
    blockXSS?: boolean;
    /** Allow HTML tags (default: false) */
    allowHTML?: boolean;
    /** Character and word limits */
    limit?: {
        maxChars?: number;
        maxWords?: number;
    };
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
interface ScanResult {
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
declare function createPatrol(options?: PatrolOptions): {
    scan: (value: unknown, opts?: {
        adapter?: AdapterMode;
    }) => Promise<ScanResult>;
};
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
declare function auditPayload(value: unknown, options?: {
    adapter?: AdapterMode;
    checks?: CheckName[];
    context?: CheckContext;
}): Promise<ScanResult>;

export { AdapterMode, CheckContext, CheckName, type PatrolOptions, RunChecksOptions, RunChecksResult, type ScanResult, type SentimentResult, analyzeSentiment, auditPayload, createPatrol, getCheck, hasCheck, listChecks, registerCheck, registerProfanityList, runChecks };
