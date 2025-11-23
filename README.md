# Payload Patrol

Minimal, framework-agnostic input defense for web apps and APIs, with optional React components (coming soon).

* Detects common **SQLi/XSS** patterns
* **Custom deny rules** and **optional profanity** checks
* **Sentiment analysis** for mood detection
* **Zod adapter** for schema-level validation
* **Express/Hono middleware** for server-side validation
* **Headless core** usable in Node/Edge runtimes
* **Multi-language support** (English, French, Spanish)

> Design principle: **Headless first.** All validation lives in the core; framework adapters are opt-in so you can use any stack.

---

## Install

```bash
npm i @ameshkin/payload-patrol

# Optional peer dependencies
npm i zod  # For Zod adapter
```

---

## 📚 Documentation

All features include complete examples and usage guides:

### Core Features
- **[Core API](.docs/features/CORE-API.md)** - `createPatrol()`, `auditPayload()`, and core functions
- **[Security Checks](.docs/features/CORE-CHECKS.md)** - SQL injection, XSS, HTML filtering, profanity, limits
- **[Sentiment Analysis](.docs/features/SENTIMENT.md)** - Mood detection with React examples
- **[Profanity Filtering](.docs/features/PROFANITY.md)** - Multi-language word lists and customization

### Framework Adapters
- **[Zod Integration](.docs/features/ZOD.md)** - Schema-level validation with examples
- **[Express Middleware](.docs/features/EXPRESS.md)** - Request validation for Express/Connect
- **[Hono Middleware](.docs/features/HONO.md)** - Edge-ready validation for Cloudflare Workers/Bun/Deno

### Data
- **[Badwords Lists](data/README.md)** - Multi-language profanity lists (en, fr, es)

---

## Quick start (headless)

```ts
import { createPatrol } from "@ameshkin/payload-patrol";

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
  // [{ path: ["name"], rule: "scripts", ...}, { path: ["comment"], rule: "sql", ...}]
}
```

### Sentiment Analysis

```ts
import { analyzeSentiment } from "@ameshkin/payload-patrol";

const feedback = "I love this product! Great customer service.";
const analysis = analyzeSentiment(feedback);

console.log(analysis.mood); // "positive"
console.log(analysis.score); // 2
```

---

## Zod adapter

```ts
import { z } from "zod";
import { zSafeString } from "@ameshkin/payload-patrol/adapters/zod";

const schema = z.object({
  name: zSafeString({ maxLength: 128 }),
  email: zSafeString({ allowHTML: false })
});

schema.parse({ name: "Alice", email: "alice@example.com" }); // throws on violations
```

---

## React Components (Coming Soon)

React/MUI components are planned for a future release. For now, you can use the headless core with your own components:

```tsx
import { useState, useEffect } from 'react';
import { createPatrol } from '@ameshkin/payload-patrol';
import { TextField } from '@mui/material';

function SafeTextField({ value, onChange, ...props }) {
  const [error, setError] = useState('');
  const patrol = createPatrol({ blockXSS: true, blockSQLi: true });
  
  useEffect(() => {
    const check = async () => {
      const result = await patrol.scan(value);
      setError(result.ok ? '' : result.issues[0]?.message || 'Invalid input');
    };
    if (value) check();
  }, [value]);
  
  return (
    <TextField 
      {...props}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={error}
    />
  );
}
```

**Planned Components:**
- `<Phone />` - International phone input with libphonenumber-js
- `<Text />` - Text field with validation and profanity filtering
- `<Email />` - Email validation with MX hints
- `<Password />` - Strength meter and breach check
- `<Textarea />` - Word/char counters and auto-sanitize
- `<URL />` - URL validation with allow/deny lists

See [Sentiment Analysis](.docs/features/SENTIMENT.md) for complete React examples.

---

## Architecture

* **Core (headless):** scanning/sanitization (`auditPayload`, `createPatrol`), profanity dictionary loader, adapters (Zod).
* **UI (React/MUI):** very thin wrappers that:

    1. Render an underlying MUI control,
    2. Call headless validation on value changes/blur,
    3. Map results → MUI error/HelperText, optionally mutate value when `adapter="strip"`.

This keeps validation central, enables non-React servers, and avoids lock-in.

### Design Philosophy

* **Headless first:** Core validation is framework-agnostic
* **Opt-in adapters:** Use Zod, Express, Hono, or build your own
* **Minimal dependencies:** Keep bundle sizes small
* **Type-safe:** Full TypeScript support throughout

---

## API surface (core)

```ts
type AdapterMode = "block" | "warn" | "strip";

createPatrol(options?: {
  blockSQLi?: boolean;
  blockXSS?: boolean;
  allowHTML?: boolean;
  limit?: { maxChars?: number; maxWords?: number };
  allowlist?: string[];
  adapter?: AdapterMode; // default "block"
}): { scan(value: unknown, opts?: { adapter?: AdapterMode }): ScanResult };

auditPayload(value: unknown, opts?: { adapter?: AdapterMode; checks?: ...}): ScanResult;

registerProfanityList(words: string[]): void;
```

---

## TypeScript Support

Full type definitions included:

```typescript
import type {
  CheckName,
  CheckResult,
  CheckContext,
  AdapterMode,
  ScanResult,
  SentimentResult
} from '@ameshkin/payload-patrol';
```

---

## Framework Integration

### Next.js API Route

```typescript
import { createPatrol } from '@ameshkin/payload-patrol';

export async function POST(request: Request) {
  const body = await request.json();
  const patrol = createPatrol({ blockSQLi: true, blockXSS: true });
  const result = await patrol.scan(body);
  
  if (!result.ok) {
    return Response.json({ errors: result.issues }, { status: 400 });
  }
  
  // Process safe data
  return Response.json({ success: true });
}
```

### With React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { createPatrol } from '@ameshkin/payload-patrol';

const patrol = createPatrol();

const { register, handleSubmit } = useForm({
  resolver: async (values) => {
    const result = await patrol.scan(values);
    if (!result.ok) {
      return {
        values: {},
        errors: result.issues.reduce((acc, issue) => {
          acc[issue.path.join('.')] = { message: issue.message };
          return acc;
        }, {})
      };
    }
    return { values, errors: {} };
  }
});
```

---

## Extras

### Dictionary files

See [Profanity Filtering](.docs/features/PROFANITY.md) for complete documentation on:
- Loading custom word lists
- Multi-language support
- Severity-based filtering
- Allowlist configuration

---

---

## What's Included

✅ **Core Security Checks**
- SQL injection detection
- XSS/script filtering  
- HTML sanitization
- Profanity filtering (multi-language)
- Length limits

✅ **Sentiment Analysis**
- Real-time mood detection
- Positive/negative word tracking
- Comparative scoring

✅ **Adapters**
- Zod schema validation
- Express middleware
- Hono middleware (edge-ready)

✅ **Multi-Language Support**
- English, French, Spanish badwords
- Severity-based filtering (severe/mild)

## Roadmap

* ✅ Core validation engine
* ✅ Zod adapter
* ✅ Server middleware (Express, Hono)
* ✅ Sentiment analysis
* ✅ Multi-language profanity lists
* 🚧 React hooks (`usePatrolField`, `useSentiment`)
* 📋 MUI components (`<Phone/>`, `<Text/>`, `<Email/>`)
* 📋 Additional language packs
* 📋 Custom check marketplace

---

## FAQ

**Is this just a MUI wrapper?**
No. The **core** is headless and framework-agnostic. The MUI layer is an optional thin wrapper for rapid adoption.

**Can I use this with any UI framework?**
Yes! The core is completely framework-agnostic. Use `createPatrol()` or `auditPayload()` with any React, Vue, Svelte, or vanilla JS component.

**Do I need all the features?**
No. Import only what you need. Tree-shaking ensures unused code is removed from your bundle.

---

---

## Contributing

Contributions welcome! Please see our [Contributing Guide](CONTRIBUTING.md) (coming soon).

## License

MIT © Amir Meshkin
