"use client";

import * as React from "react";
import type { CheckContext, CheckName, RunChecksOptions, RunChecksResult } from "../../types";
import { runChecks } from "./run";

/**
 * useChecks
 * Inputs: value, checks array, ctx and options.
 * Output: latest RunChecksResult and busy flag.
 */
export function useChecks(
  value: string,
  checks: CheckName[] = [],
  ctx?: CheckContext,
  opts?: RunChecksOptions
) {
  const [result, setResult] = React.useState<RunChecksResult>({ ok: true, results: [], value });
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let stop = false;
    (async () => {
      setBusy(true);
      try {
        const r = await runChecks(value, checks, ctx, opts);
        if (!stop) setResult(r);
      } finally {
        setBusy(false);
      }
    })();
    return () => {
      stop = true;
    };
  }, [value, JSON.stringify(checks), JSON.stringify(ctx), JSON.stringify(opts)]);

  return { result, busy };
}

/**
 * withChecks
 * Inputs: A Text-like component that receives value/onChange and a checks prop.
 * Output: Component that displays error/warning state based on checks.
 */
export function withChecks<T extends { value: string; onChange: (v: string) => void; error?: boolean; helperText?: React.ReactNode; checks?: CheckName[]; ctx?: CheckContext; adapter?: "block" | "warn" | "strip"; }>(
  FieldComponent: React.ComponentType<T>
) {
  return function CheckedField(props: T) {
    const { checks = [], ctx, adapter, value } = props;
    const { result } = useChecks(value ?? "", checks, ctx, { adapter });

    const error = adapter !== "warn" ? !result.ok : false;
    const helperText = !result.ok
      ? result.results.find(r => !r.ok)?.message
      : undefined;

    return (
      <FieldComponent
        {...props}
        error={error}
        helperText={helperText}
      />
    );
  };
}
