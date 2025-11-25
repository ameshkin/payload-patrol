# Custom Checks Examples

## Registering a Custom Check

```typescript
import { registerCheck, createPatrol } from '@ameshkin/payload-patrol';

// Register a custom email validation check
registerCheck("no-email", (value) => {
  const hasEmail = /@/.test(value);
  return {
    name: "no-email",
    ok: !hasEmail,
    message: hasEmail ? "Email addresses not allowed" : undefined
  };
});

// Use in patrol
const patrol = createPatrol();
const result = await patrol.scan("Contact me at test@example.com");
```

## Async Custom Check

```typescript
import { registerCheck } from '@ameshkin/payload-patrol';

registerCheck("async-validation", async (value) => {
  // Simulate async validation (e.g., API call)
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const isValid = value.length > 5;
  return {
    name: "async-validation",
    ok: isValid,
    message: isValid ? undefined : "Value too short"
  };
});
```

## Check with Context

```typescript
import { registerCheck } from '@ameshkin/payload-patrol';
import type { CheckContext } from '@ameshkin/payload-patrol';

registerCheck("custom-limit", (value, ctx: CheckContext) => {
  const maxLength = ctx?.customLimit ?? 100;
  return {
    name: "custom-limit",
    ok: value.length <= maxLength,
    message: value.length > maxLength 
      ? `Exceeds custom limit of ${maxLength}` 
      : undefined
  };
});
```

## Using Custom Checks with runChecks

```typescript
import { registerCheck, runChecks } from '@ameshkin/payload-patrol';

registerCheck("uppercase-only", (value) => {
  return {
    name: "uppercase-only",
    ok: value === value.toUpperCase(),
    message: value !== value.toUpperCase() ? "Must be uppercase" : undefined
  };
});

const result = await runChecks("HELLO", ["uppercase-only"]);
// result.ok === true
```

