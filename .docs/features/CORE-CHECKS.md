# Core Security Checks

Built-in validation checks for common security threats.

## Available Checks

### 1. SQL Injection Detection (`sql`)

Detects common SQL injection patterns.

**Patterns detected:**
- `UNION SELECT`
- `DROP TABLE` / `DROP DATABASE`
- SQL comments (`--`, `/* */`)
- `OR 1=1` patterns
- `SLEEP()` / time-based attacks
- `xp_cmdshell` and other dangerous commands

**Example:**
```typescript
import { createPatrol } from '@ameshkin/payload-patrol';

const patrol = createPatrol({ blockSQLi: true });
const result = await patrol.scan("'; DROP TABLE users;--");

console.log(result.ok); // false
console.log(result.issues[0].rule); // "sql"
```

### 2. XSS / Script Detection (`scripts`)

Detects cross-site scripting attempts and inline scripts.

**Patterns detected:**
- `<script>` tags
- Inline event handlers (`onclick=`, `onerror=`, etc.)
- `javascript:` protocol
- `document.` references
- `window.` references
- `eval()` calls

**Example:**
```typescript
const patrol = createPatrol({ blockXSS: true });
const result = await patrol.scan('<img src="x" onerror="alert(1)">');

console.log(result.ok); // false
console.log(result.issues[0].rule); // "scripts"
```

**Strip mode:**
```typescript
const patrol = createPatrol({ 
  blockXSS: true, 
  adapter: "strip" 
});

const result = await patrol.scan("<script>bad</script>Hello");
console.log(result.value); // "Hello"
```

### 3. HTML Tag Detection (`html`)

Restricts HTML to a safe subset of tags.

**Allowed tags (by default):**
- `<b>`, `<i>`, `<u>`, `<strong>`, `<em>`, `<br>`, `<span>`

**Blocked tags:**
- Everything else (div, iframe, img, video, etc.)

**Example:**
```typescript
const patrol = createPatrol({ allowHTML: false });

// Blocks all HTML
const result1 = await patrol.scan("<div>content</div>");
console.log(result1.ok); // false

// Allow HTML with default safe tags
const patrol2 = createPatrol({ allowHTML: true });
const result2 = await patrol2.scan("<b>bold</b>");
console.log(result2.ok); // true
```

### 4. Profanity / Badwords (`badwords`)

Checks against a customizable list of prohibited terms.

**Default list:**
- Ships with `data/badwords.json` (464 terms)
- Includes profanity, slurs, and offensive terms

**Example:**
```typescript
const patrol = createPatrol({ checkProfanity: true });
const result = await patrol.scan("You're an asshole");

console.log(result.ok); // false
console.log(result.issues[0].details?.hits); // ["asshole"]
```

**Custom list:**
```typescript
import { registerProfanityList } from '@ameshkin/payload-patrol';

registerProfanityList(["spam", "scam", "fake"]);

const patrol = createPatrol({ checkProfanity: true });
const result = await patrol.scan("This is a scam");
console.log(result.ok); // false
```

**Allowlist (for false positives):**
```typescript
const patrol = createPatrol({ 
  checkProfanity: true,
  allowlist: ["scunthorpe"] // Famous false positive
});

const result = await patrol.scan("Scunthorpe problem");
console.log(result.ok); // true
```

### 5. Length Limits (`limit`)

Enforces character and word count limits.

**Example:**
```typescript
const patrol = createPatrol({
  limit: { 
    maxChars: 500,
    maxWords: 100 
  }
});

const result = await patrol.scan("short text");
console.log(result.ok); // true

const longText = "word ".repeat(150);
const result2 = await patrol.scan(longText);
console.log(result2.ok); // false
console.log(result2.issues[0].message); 
// "Too many words (150/100)"
```

### 6. Sentiment Analysis (`sentiment`)

Analyzes mood/sentiment in text (informational only).

**Always passes** - never blocks input, just provides data.

See [SENTIMENT.md](./SENTIMENT.md) for details.

## Combining Checks

```typescript
const patrol = createPatrol({
  blockSQLi: true,
  blockXSS: true,
  allowHTML: false,
  checkProfanity: true,
  limit: { maxChars: 1000, maxWords: 200 }
});

const result = await patrol.scan({
  name: "Alice",
  email: "alice@example.com",
  comment: "Great product!"
});

if (!result.ok) {
  result.issues.forEach(issue => {
    console.log(`${issue.path.join('.')}: ${issue.message}`);
  });
}
```

## Adapter Modes

### Block Mode (default)

Stops on first failure, returns error.

```typescript
const patrol = createPatrol({ adapter: "block" });
const result = await patrol.scan("<script>bad</script>");
console.log(result.ok); // false
```

### Warn Mode

Runs all checks, reports issues but doesn't block.

```typescript
const patrol = createPatrol({ adapter: "warn" });
const result = await patrol.scan("<script>bad</script>");
console.log(result.ok); // false (issues found)
console.log(result.issues); // array of all issues
```

### Strip Mode

Sanitizes input by removing dangerous content.

```typescript
const patrol = createPatrol({ adapter: "strip" });
const result = await patrol.scan("<script>bad</script>Hello");
console.log(result.ok); // true (sanitized)
console.log(result.value); // "Hello"
```

## Custom Checks

Register your own validation logic:

```typescript
import { registerCheck } from '@ameshkin/payload-patrol';

registerCheck('no-phone-numbers', (value) => {
  const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
  const hasPhone = phonePattern.test(value);
  
  return {
    name: 'no-phone-numbers',
    ok: !hasPhone,
    message: hasPhone ? 'Phone numbers not allowed' : undefined
  };
});

// Use in patrol
const patrol = createPatrol();
const result = await patrol.scan("Call me at 555-123-4567");
```

## Performance

All checks are:
- **Synchronous** (except when using async custom checks)
- **Lightweight** (no external dependencies for built-in checks)
- **Fast** (regex-based, ~1-2ms per check)

Batch validation of 100 strings: **~50-100ms**

