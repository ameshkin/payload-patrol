# Basic Usage Examples

## Core API

### Creating a Patrol Instance

```typescript
import { createPatrol } from '@ameshkin/payload-patrol';

const patrol = createPatrol({
  blockSQLi: true,
  blockXSS: true,
  allowHTML: false,
  checkProfanity: true,
  limit: { maxChars: 5000, maxWords: 800 }
});

const result = await patrol.scan({
  name: "<script>alert(1)</script>",
  comment: "hi -- drop table users;"
});

if (!result.ok) {
  console.log(result.issues);
  // [
  //   { path: ["name"], rule: "scripts", message: "..." },
  //   { path: ["comment"], rule: "sql", message: "..." }
  // ]
}
```

### Quick Audit

```typescript
import { auditPayload } from '@ameshkin/payload-patrol';

const result = await auditPayload("Hello <script>alert(1)</script>", {
  adapter: "warn",
  checks: ["scripts", "html"]
});

if (!result.ok) {
  result.issues.forEach(issue => {
    console.log(`Issue at ${issue.path.join('.')}: ${issue.message}`);
  });
}
```

### Adapter Modes

```typescript
// Block mode (default) - fails on violations
const blockResult = await patrol.scan("<script>bad</script>");
// blockResult.ok === false

// Warn mode - reports issues but doesn't fail
const warnResult = await patrol.scan("<script>bad</script>", {
  adapter: "warn"
});
// warnResult.ok === false, but value is preserved

// Strip mode - sanitizes and returns clean value
const stripResult = await patrol.scan("<script>bad</script>Hello", {
  adapter: "strip"
});
// stripResult.ok === true
// stripResult.value === "Hello"
```

