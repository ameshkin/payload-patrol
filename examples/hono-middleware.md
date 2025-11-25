# Hono Middleware Examples

## Global Request Validation

```typescript
import { Hono } from 'hono';
import { patrol } from '@ameshkin/payload-patrol/adapters/hono';

const app = new Hono();

// Apply to all routes
app.use('*', patrol({
  blockSQLi: true,
  blockXSS: true,
  checkProfanity: true,
  adapter: "block"
}));

app.post('/api/users', async (c) => {
  const body = await c.req.json();
  // body is already validated
  return c.json({ success: true, data: body });
});
```

## Route-Specific Validation

```typescript
import { Hono } from 'hono';
import { validateFields } from '@ameshkin/payload-patrol/adapters/hono';

const app = new Hono();

app.post('/api/comments',
  validateFields(['content', 'author'], {
    blockXSS: true,
    checkProfanity: true
  }),
  async (c) => {
    const body = await c.req.json();
    return c.json({ success: true });
  }
);
```

## Edge Runtime (Cloudflare Workers)

```typescript
import { Hono } from 'hono';
import { patrol } from '@ameshkin/payload-patrol/adapters/hono';

const app = new Hono();

app.use('*', patrol({
  blockSQLi: true,
  blockXSS: true,
  adapter: "strip" // Sanitize instead of blocking
}));

export default app;
```

