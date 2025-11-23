# Hono Middleware

Edge-ready validation for Hono framework (Cloudflare Workers, Bun, Deno).

## Installation

```bash
npm install hono @ameshkin/payload-patrol
```

## Basic Usage

```typescript
import { Hono } from 'hono';
import { patrol } from '@ameshkin/payload-patrol/adapters/hono';

const app = new Hono();

// Apply validation globally
app.use('*', patrol({
  blockSQLi: true,
  blockXSS: true,
  allowHTML: false
}));

app.post('/api/user', async (c) => {
  const body = c.get('sanitizedBody');
  return c.json({ success: true });
});

export default app;
```

## API

### `patrol(options)`

Middleware that validates JSON request bodies.

**Options:** `PatrolOptions` + `{ status?: number }`

```typescript
app.use('/api/*', patrol({
  blockSQLi: true,
  blockXSS: true,
  checkProfanity: true,
  status: 422 // Custom status code
}));
```

### `validateFields(fields, options)`

Validate specific fields only.

```typescript
import { validateFields } from '@ameshkin/payload-patrol/adapters/hono';

app.post('/api/comment',
  validateFields(['title', 'content'], {
    blockXSS: true,
    limit: { maxChars: 1000 }
  }),
  async (c) => {
    const body = c.get('sanitizedBody');
    return c.json({ success: true });
  }
);
```

## Cloudflare Workers

```typescript
import { Hono } from 'hono';
import { patrol } from '@ameshkin/payload-patrol/adapters/hono';

const app = new Hono();

app.use('*', patrol({
  blockSQLi: true,
  blockXSS: true
}));

app.post('/api/feedback', async (c) => {
  const body = c.get('sanitizedBody');
  
  // Store in KV or D1
  await c.env.KV.put('feedback', JSON.stringify(body));
  
  return c.json({ received: true });
});

export default app;
```

## Bun

```typescript
import { Hono } from 'hono';
import { patrol } from '@ameshkin/payload-patrol/adapters/hono';

const app = new Hono();

app.use('*', patrol({
  blockXSS: true,
  adapter: 'strip' // Sanitize instead of block
}));

export default {
  port: 3000,
  fetch: app.fetch,
};
```

## Deno

```typescript
import { Hono } from 'https://deno.land/x/hono/mod.ts';
import { patrol } from '@ameshkin/payload-patrol/adapters/hono';

const app = new Hono();

app.use('*', patrol({
  blockSQLi: true,
  blockXSS: true
}));

Deno.serve(app.fetch);
```

## Strip Mode

Automatically sanitize:

```typescript
app.use('*', patrol({
  adapter: 'strip',
  blockXSS: true
}));

app.post('/api/post', async (c) => {
  const body = c.get('sanitizedBody');
  // Scripts already removed
  return c.json(body);
});
```

## Examples

### API with Validation

```typescript
const app = new Hono();

app.use('/api/*', patrol({
  blockSQLi: true,
  blockXSS: true,
  checkProfanity: true
}));

app.post('/api/users', async (c) => {
  const user = c.get('sanitizedBody');
  // Save user
  return c.json({ id: 1, ...user });
});

app.post('/api/posts', 
  validateFields(['title', 'content'], {
    limit: { maxChars: 5000 }
  }),
  async (c) => {
    const post = c.get('sanitizedBody');
    return c.json(post);
  }
);
```

### Multi-Language Support

```typescript
import frenchBadwords from './data/fr/severe.json';
import { registerProfanityList } from '@ameshkin/payload-patrol';

registerProfanityList(frenchBadwords);

app.use('*', patrol({
  checkProfanity: true
}));
```

## Error Response

Default (400):

```json
{
  "error": "Invalid input",
  "issues": [
    {
      "path": ["content"],
      "rule": "scripts",
      "message": "Inline script/event handler detected."
    }
  ]
}
```

## Performance

- **Edge-optimized**: Minimal overhead
- **Fast**: ~1-3ms per request
- **Lightweight**: No heavy dependencies
- **Async**: Non-blocking

## Testing

```typescript
import { Hono } from 'hono';
import { patrol } from '@ameshkin/payload-patrol/adapters/hono';

describe('Hono validation', () => {
  const app = new Hono();
  app.use('*', patrol({ blockXSS: true }));
  app.post('/test', (c) => c.json(c.get('sanitizedBody')));

  it('should block XSS', async () => {
    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '<script>alert(1)</script>' })
    });
    
    expect(res.status).toBe(400);
  });

  it('should allow clean input', async () => {
    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Hello' })
    });
    
    expect(res.status).toBe(200);
  });
});
```

