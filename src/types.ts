export type CheckName = "badwords" | "sql" | "scripts" | "html" | "limit" | "sentiment" | (string & {});
export type AdapterMode = "block" | "warn" | "strip";

export type CheckContext = {
  limit?: { maxChars?: number; maxWords?: number };
  allowlist?: string[];
  locale?: string;
};

export type CheckResult = {
  name: CheckName;
  ok: boolean;
  message?: string;
  details?: Record<string, unknown>;
  value?: string; // optional sanitized value when adapters strip
};

export type CheckFn = (value: string, ctx?: CheckContext) => CheckResult | Promise<CheckResult>;

export type Check = {
  name: CheckName;
  run: CheckFn;
};

export type RunChecksOptions = {
  adapter?: AdapterMode;
  stopOnFirstBlock?: boolean;
};

export type RunChecksResult = {
  ok: boolean;
  results: CheckResult[];
  value: string;
};
