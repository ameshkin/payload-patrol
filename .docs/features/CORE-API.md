# Core API

The main API for creating patrol instances and scanning payloads.

## createPatrol()

Create a patrol instance with specific configuration.

```typescript
import { createPatrol } from '@ameshkin/payload-patrol';

const patrol = createPatrol({
  blockSQLi: true,
  blockXSS: true,
  allowHTML: false,
  checkProfanity: true,
  limit: { maxChars: 5000, maxWords: 800 }
});
```

### Options

```typescript
interface PatrolOptions {
  blockSQLi?: boolean;        // Block SQL injection (default: true)
  blockXSS?: boolean;         // Block XSS/scripts (default: true)
  allowHTML?: boolean;        // Allow HTML tags (default: false)
  limit?: {                   // Character and word limits
    maxChars?: number;
    maxWords?: number;
  };
  allowlist?: string[];       // Terms that bypass badwords check
  adapter?: "block" | "warn" | "strip";  // Validation mode (default: "block")
  checkProfanity?: boolean;   // Enable profanity checking (default: false)
}
```

### Examples

#### Basic Usage

```typescript
const patrol = createPatrol({
  blockSQLi: true,
  blockXSS: true
});

const result = await patrol.scan("Hello world");
console.log(result.ok); // true
```

#### Scanning Objects

```typescript
const patrol = createPatrol({ blockXSS: true });

const result = await patrol.scan({
  name: "Alice",
  email: "alice@example.com",
  comment: "<script>alert(1)</script>"
});

if (!result.ok) {
  result.issues.forEach(issue => {
    console.log(`${issue.path.join('.')}: ${issue.message}`);
    // comment: Inline script/event handler detected.
  });
}
```

#### Scanning Arrays

```typescript
const patrol = createPatrol({ blockSQLi: true });

const result = await patrol.scan([
  "clean text",
  "'; DROP TABLE users;--"
]);

if (!result.ok) {
  console.log(result.issues[0].path); // [1]
  console.log(result.issues[0].rule);  // "sql"
}
```

#### Nested Objects

```typescript
const result = await patrol.scan({
  user: {
    name: "Alice",
    bio: "'; DROP TABLE users;--"
  }
});

console.log(result.issues[0].path); // ["user", "bio"]
```

#### Strip Mode

```typescript
const patrol = createPatrol({
  adapter: "strip",
  blockXSS: true
});

const result = await patrol.scan("<script>bad</script>Hello");
console.log(result.ok); // true (sanitized)
console.log(result.value); // "Hello"
```

## auditPayload()

Quick audit of a single value without creating a patrol instance.

```typescript
import { auditPayload } from '@ameshkin/payload-patrol';

const result = await auditPayload("Hello <script>alert(1)</script>", {
  adapter: "warn",
  checks: ["scripts", "html"]
});

if (!result.ok) {
  console.log(result.issues);
}
```

### Options

```typescript
{
  adapter?: "block" | "warn" | "strip";
  checks?: CheckName[];  // Default: ["badwords", "sql", "scripts", "html"]
  context?: CheckContext; // { limit?, allowlist? }
}
```

### Examples

#### Quick Validation

```typescript
const result = await auditPayload(userInput, {
  checks: ["sql", "scripts"]
});
```

#### With Custom Context

```typescript
const result = await auditPayload(comment, {
  checks: ["badwords", "limit"],
  context: {
    limit: { maxChars: 500 },
    allowlist: ["scunthorpe"]
  }
});
```

## registerProfanityList()

Register a custom profanity/badwords list.

```typescript
import { registerProfanityList } from '@ameshkin/payload-patrol';

// Use custom list
registerProfanityList(["spam", "scam", "fake"]);

// Or load from JSON
import badwords from './data/en/severe.json';
registerProfanityList(badwords);
```

### Examples

#### Custom Terms

```typescript
registerProfanityList(["spam", "scam", "fake"]);

const patrol = createPatrol({ checkProfanity: true });
const result = await patrol.scan("This is a scam");
console.log(result.ok); // false
```

#### Multi-Language

```typescript
import enSevere from './data/en/severe.json';
import frSevere from './data/fr/severe.json';

const combined = [...enSevere, ...frSevere];
registerProfanityList(combined);
```

## registerCheck()

Register custom validation checks.

```typescript
import { registerCheck } from '@ameshkin/payload-patrol';

registerCheck('no-phone-numbers', (value) => {
  const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
  return {
    name: 'no-phone-numbers',
    ok: !phonePattern.test(value),
    message: phonePattern.test(value) ? 'Phone numbers not allowed' : undefined
  };
});
```

### Examples

#### Email Validation

```typescript
registerCheck('valid-email', (value) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    name: 'valid-email',
    ok: emailPattern.test(value),
    message: emailPattern.test(value) ? undefined : 'Invalid email format'
  };
});
```

#### Async Check

```typescript
registerCheck('async-validation', async (value) => {
  const isValid = await checkExternalAPI(value);
  return {
    name: 'async-validation',
    ok: isValid,
    message: isValid ? undefined : 'Failed external validation'
  };
});
```

## Type Definitions

```typescript
interface ScanResult {
  ok: boolean;
  issues: Array<{
    path: (string | number)[];
    rule: CheckName;
    message?: string;
    details?: Record<string, unknown>;
  }>;
  value?: unknown; // Sanitized value (when adapter="strip")
}

type CheckName = "badwords" | "sql" | "scripts" | "html" | "limit" | "sentiment" | string;
type AdapterMode = "block" | "warn" | "strip";
```

## Error Handling

```typescript
try {
  const result = await patrol.scan(userInput);
  
  if (!result.ok) {
    // Handle validation errors
    result.issues.forEach(issue => {
      console.error(`Error at ${issue.path.join('.')}: ${issue.message}`);
    });
  } else {
    // Input is safe
    processInput(result.value || userInput);
  }
} catch (error) {
  // Handle unexpected errors
  console.error('Validation failed:', error);
}
```

## Performance Tips

1. **Reuse patrol instances** - Don't create new ones for each validation
2. **Use appropriate checks** - Only enable what you need
3. **Strip mode for sanitization** - Faster than manual cleaning
4. **Batch validation** - Scan multiple items in one call

```typescript
// Good: Reuse instance
const patrol = createPatrol({ blockXSS: true });
for (const input of inputs) {
  await patrol.scan(input);
}

// Better: Batch scan
await patrol.scan(inputs); // Handles arrays automatically
```

