# Zod Adapter

Schema-level validation with Payload Patrol security checks.

## Installation

```bash
npm install zod @ameshkin/payload-patrol
```

## Basic Usage

```typescript
import { z } from 'zod';
import { zSafeString } from '@ameshkin/payload-patrol/adapters/zod';

const schema = z.object({
  name: zSafeString({ maxLength: 128 }),
  email: z.string().email(),
  bio: zSafeString({ 
    maxChars: 500,
    checkProfanity: true 
  })
});

// Valid input
const result = await schema.parseAsync({
  name: "Alice",
  email: "alice@example.com",
  bio: "Software engineer"
});

// Invalid - contains XSS
try {
  await schema.parseAsync({
    name: "<script>alert(1)</script>",
    email: "alice@example.com",
    bio: "Hello"
  });
} catch (error) {
  console.log(error.message); // "Input contains unsafe content"
}
```

## API

### `zSafeString(options)`

Create a safe string schema with security validation.

**Options:**
```typescript
{
  maxLength?: number;      // Maximum string length
  minLength?: number;      // Minimum string length
  blockSQLi?: boolean;     // Block SQL injection (default: true)
  blockXSS?: boolean;      // Block XSS (default: true)
  allowHTML?: boolean;     // Allow HTML tags (default: false)
  checkProfanity?: boolean; // Check profanity (default: false)
  maxChars?: number;       // Maximum characters
  maxWords?: number;       // Maximum words
  allowlist?: string[];    // Allowlist for badwords
  adapter?: "block" | "warn" | "strip"; // Validation mode
  message?: string;        // Custom error message
}
```

**Examples:**

```typescript
// Basic safe string
const NameSchema = zSafeString({ maxLength: 100 });

// No HTML allowed
const CommentSchema = zSafeString({ 
  allowHTML: false,
  maxChars: 1000 
});

// With profanity check
const DisplayNameSchema = zSafeString({ 
  checkProfanity: true,
  maxLength: 64
});

// Custom error message
const BioSchema = zSafeString({
  maxChars: 500,
  message: "Bio contains unsafe content"
});
```

### `zSafeObject(shape, options)`

Validate all string fields in an object.

```typescript
import { zSafeObject } from '@ameshkin/payload-patrol/adapters/zod';

const UserSchema = zSafeObject({
  name: z.string(),
  email: z.string().email(),
  age: z.number()
}, {
  blockXSS: true,
  blockSQLi: true,
  checkProfanity: true
});

await UserSchema.parseAsync({
  name: "Alice",
  email: "alice@example.com",
  age: 30
});
```

### `zStripUnsafe(options)`

Transform that sanitizes input by stripping unsafe content.

```typescript
import { zStripUnsafe } from '@ameshkin/payload-patrol/adapters/zod';

const SanitizedSchema = z.string().transform(zStripUnsafe());

const result = await SanitizedSchema.parseAsync(
  "<script>bad</script>Hello world"
);

console.log(result); // "Hello world"
```

**Options:**
```typescript
{
  blockXSS?: boolean;    // Strip scripts (default: true)
  allowHTML?: boolean;   // Allow HTML (default: false)
  allowlist?: string[];  // Allowlist terms
}
```

## Integration Examples

### With React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { zSafeString } from '@ameshkin/payload-patrol/adapters/zod';

const schema = z.object({
  name: zSafeString({ maxLength: 100 }),
  email: z.string().email(),
  message: zSafeString({ 
    maxChars: 1000,
    checkProfanity: true 
  })
});

function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data) => {
    console.log('Safe data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <textarea {...register('message')} />
      {errors.message && <span>{errors.message.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### API Routes (Next.js)

```typescript
import { z } from 'zod';
import { zSafeString, zSafeObject } from '@ameshkin/payload-patrol/adapters/zod';
import { NextRequest, NextResponse } from 'next/server';

const CreateUserSchema = zSafeObject({
  name: z.string().min(1),
  email: z.string().email(),
  bio: z.string().optional()
}, {
  blockXSS: true,
  blockSQLi: true
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = await CreateUserSchema.parseAsync(body);
    
    // Safe to use validated data
    const user = await createUser(validated);
    
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

### tRPC Procedures

```typescript
import { z } from 'zod';
import { zSafeString } from '@ameshkin/payload-patrol/adapters/zod';
import { publicProcedure } from './trpc';

export const createPost = publicProcedure
  .input(z.object({
    title: zSafeString({ maxLength: 200 }),
    content: zSafeString({ 
      maxChars: 5000,
      allowHTML: true 
    }),
    tags: z.array(zSafeString({ maxLength: 50 }))
  }))
  .mutation(async ({ input }) => {
    // input is validated and safe
    return await db.post.create({ data: input });
  });
```

## Nested Validation

```typescript
const BlogPostSchema = z.object({
  title: zSafeString({ maxLength: 200 }),
  author: z.object({
    name: zSafeString({ maxLength: 100 }),
    bio: zSafeString({ maxChars: 500 })
  }),
  content: zSafeString({ 
    maxChars: 10000,
    allowHTML: true // Rich text
  }),
  comments: z.array(z.object({
    author: zSafeString({ maxLength: 100 }),
    text: zSafeString({ 
      maxChars: 500,
      checkProfanity: true 
    })
  }))
});
```

## Performance

- **Async validation**: All security checks are async
- **Cached results**: Zod caches refinement results
- **Fast checks**: ~1-5ms overhead per field

**Benchmark** (1000 validations):
- Simple string: ~50ms
- Complex object: ~200ms

## Error Handling

```typescript
import { ZodError } from 'zod';

try {
  await schema.parseAsync(data);
} catch (error) {
  if (error instanceof ZodError) {
    error.errors.forEach(err => {
      console.log(`${err.path.join('.')}: ${err.message}`);
      
      // Check for security issues
      if (err.params?.code === 'unsafe_content') {
        console.log('Security violation detected');
      }
    });
  }
}
```

## TypeScript Support

Full type inference and autocompletion:

```typescript
const schema = z.object({
  name: zSafeString(),
  age: z.number()
});

type User = z.infer<typeof schema>;
// { name: string; age: number }
```

