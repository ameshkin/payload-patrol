# Zod Integration Examples

## Basic String Validation

```typescript
import { z } from 'zod';
import { zSafeString } from '@ameshkin/payload-patrol/adapters/zod';

const schema = z.object({
  name: zSafeString({ maxLength: 128 }),
  email: zSafeString({ allowHTML: false }),
  bio: zSafeString({ 
    maxLength: 500,
    allowHTML: false,
    blockXSS: true
  })
});

// Valid input
const valid = schema.parse({
  name: "Alice",
  email: "alice@example.com",
  bio: "Software developer"
});

// Invalid input (XSS attempt)
try {
  schema.parse({
    name: "Alice",
    email: "alice@example.com",
    bio: "<script>alert('xss')</script>"
  });
} catch (error) {
  // Zod validation error with payload-patrol details
}
```

## Object-Level Validation

```typescript
import { z } from 'zod';
import { zSafeObject } from '@ameshkin/payload-patrol/adapters/zod';

const userSchema = z.object({
  username: z.string(),
  password: z.string()
});

const safeSchema = zSafeObject(userSchema, {
  blockSQLi: true,
  blockXSS: true,
  checkProfanity: true
});

const result = safeSchema.parse({
  username: "admin' OR 1=1--",
  password: "password123"
});
// Throws ZodError with payload-patrol validation details
```

## Sanitization with Transform

```typescript
import { z } from 'zod';
import { zStripUnsafe } from '@ameshkin/payload-patrol/adapters/zod';

const schema = z.object({
  content: z.string().transform(zStripUnsafe({
    blockXSS: true,
    allowHTML: false
  }))
});

const result = schema.parse({
  content: "<script>bad</script>Hello World"
});
// result.content === "Hello World" (sanitized)
```

