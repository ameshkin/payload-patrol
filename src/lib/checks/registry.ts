const registry = new Map<string, { name: string; run: (v: string, ctx?: any) => any }>();

export function registerCheck(name: string, run: (value: string, ctx?: any) => any) {
  registry.set(name, { name, run });
}

export function getCheck(name: string) {
  const found = registry.get(name);
  if (!found) throw new Error(`Unknown check: ${name}`);
  return found;
}

export function hasCheck(name: string) {
  return registry.has(name);
}

export function listChecks() {
  return [...registry.keys()];
}
