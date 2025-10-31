# @ameshkin/payload-patrol

Minimal, framework-agnostic input defense for web apps and APIs. Detects common SQLi/XSS patterns, supports custom deny rules, optional profanity checks, and integrates with Zod via a tiny adapter.

## Install

```bash
npm i @ameshkin/payload-patrol
# optional peer for the adapter:
npm i zod
```

## Quick start

```ts
import { createPatrol, auditPayload, registerProfanityList } from "@ameshkin/payload-patrol";

registerProfanityList(["dang", "heck"]); // optional

const patrol = createPatrol({ blockSQLi: true, blockXSS: true });

const result = patrol.scan({
  name: "<script>alert(1)</script>",
  comment: "hi -- drop table users;"
});

if (!result.ok) {
  console.log(result.issues); // [{ path: ["name"], rule: "xss", ...}, { path: ["comment"], rule: "sqli", ...}]
}
```

## Zod adapter

```ts
import { z } from "zod";
import { zSafeString } from "@ameshkin/payload-patrol/adapters/zod";

const schema = z.object({
  name: zSafeString({ maxLength: 128 }),
  email: zSafeString({ allowHTML: false })
});

// throws ZodError on violations
schema.parse({ name: "Alice", email: "alice@example.com" });
```