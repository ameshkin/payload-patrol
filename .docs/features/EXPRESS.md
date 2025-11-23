# Express Middleware

Lightweight request validation for Express and Connect-compatible frameworks.

## Installation

```bash
npm install express @ameshkin/payload-patrol
```

## Basic Usage

```typescript
import express from 'express';
import { patrolMiddleware } from '@ameshkin/payload-patrol/adapters/express';

const app = express();
app.use(express.json());

// Apply validation to all routes
app.use(patrolMiddleware({
  blockSQLi: true,
  blockXSS: true,
  allowHTML: false
}));

app.post('/api/user', (req, res) => {
  // req.body is validated
  res.json({ success: true });
});
```

## API

### `patrolMiddleware(options)`

Global middleware that validates all request bodies.

**Options:** Extends `PatrolOptions` with:
- `onError?: (result, req, res) => void` - Custom error handler

**Example with custom error handler:**

```typescript
app.use(patrolMiddleware({
  blockSQLi: true,
  blockXSS: true,
  onError: (result, req, res) => {
    // Custom error response
    res.status(422).json({
      error: 'Validation failed',
      message: 'Your input contains unsafe content',
      issues: result.issues.map(i => ({
        field: i.path.join('.'),
        type: i.rule
      }))
    });
  }
}));
```

### `validateFields(fields, options)`

Route-specific middleware that validates only specified fields.

```typescript
import { validateFields } from '@ameshkin/payload-patrol/adapters/express';

app.post('/api/comment',
  validateFields(['title', 'content', 'author'], {
    blockXSS: true,
    checkProfanity: true,
    limit: { maxChars: 1000 }
  }),
  (req, res) => {
    // Only title, content, author were validated
    res.json({ success: true });
  }
);
```

## Strip Mode

Automatically sanitize input instead of blocking:

```typescript
app.use(patrolMiddleware({
  adapter: 'strip',
  blockXSS: true
}));

app.post('/api/post', (req, res) => {
  // req.body has been sanitized
  // Scripts removed automatically
  console.log(req.body.content); // Clean content
});
```

## Examples

### User Registration

```typescript
app.post('/api/register',
  validateFields(['username', 'email', 'bio'], {
    blockSQLi: true,
    blockXSS: true,
    checkProfanity: true,
    limit: { maxChars: 500 }
  }),
  async (req, res) => {
    const user = await createUser(req.body);
    res.json(user);
  }
);
```

### Comment System

```typescript
app.post('/api/comments',
  validateFields(['author', 'text'], {
    blockXSS: true,
    checkProfanity: true,
    allowHTML: false,
    limit: { maxChars: 1000, maxWords: 200 }
  }),
  async (req, res) => {
    const comment = await saveComment(req.body);
    res.json(comment);
  }
);
```

### Multi-Tenant with Custom Lists

```typescript
import { registerProfanityList } from '@ameshkin/payload-patrol';
import customBadwords from './badwords.json';

registerProfanityList(customBadwords);

app.use('/api/tenant/:id', (req, res, next) => {
  // Load tenant-specific config
  next();
}, patrolMiddleware({
  checkProfanity: true,
  blockSQLi: true
}));
```

## Error Handling

Default error response (400):

```json
{
  "error": "Invalid input",
  "issues": [
    {
      "path": ["comment"],
      "rule": "scripts",
      "message": "Inline script/event handler detected."
    }
  ]
}
```

## Performance

- **Async validation**: Non-blocking
- **Selective validation**: Only validates JSON bodies
- **Fast**: ~1-5ms overhead per request
- **Memory efficient**: Shared check instances

## Integration with Other Middleware

### With Helmet

```typescript
import helmet from 'helmet';

app.use(helmet());
app.use(express.json());
app.use(patrolMiddleware({
  blockSQLi: true,
  blockXSS: true
}));
```

### With Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);
app.use(patrolMiddleware());
```

### With CORS

```typescript
import cors from 'cors';

app.use(cors());
app.use(express.json());
app.use(patrolMiddleware());
```

## Testing

```typescript
import request from 'supertest';
import express from 'express';
import { patrolMiddleware } from '@ameshkin/payload-patrol/adapters/express';

describe('API validation', () => {
  const app = express();
  app.use(express.json());
  app.use(patrolMiddleware({ blockXSS: true }));
  app.post('/test', (req, res) => res.json(req.body));

  it('should block XSS', async () => {
    const res = await request(app)
      .post('/test')
      .send({ content: '<script>alert(1)</script>' })
      .expect(400);
    
    expect(res.body.error).toBe('Invalid input');
  });

  it('should allow clean input', async () => {
    const res = await request(app)
      .post('/test')
      .send({ content: 'Hello world' })
      .expect(200);
    
    expect(res.body.content).toBe('Hello world');
  });
});
```

