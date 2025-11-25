# Express Middleware Examples

## Global Request Validation

```typescript
import express from 'express';
import { patrolMiddleware } from '@ameshkin/payload-patrol/adapters/express';

const app = express();
app.use(express.json());

// Apply to all routes
app.use(patrolMiddleware({
  blockSQLi: true,
  blockXSS: true,
  checkProfanity: true,
  adapter: "block"
}));

app.post('/api/users', (req, res) => {
  // req.body is already validated
  res.json({ success: true, data: req.body });
});
```

## Route-Specific Validation

```typescript
import express from 'express';
import { validateFields } from '@ameshkin/payload-patrol/adapters/express';

const app = express();
app.use(express.json());

app.post('/api/comments', 
  validateFields(['content', 'author'], {
    blockXSS: true,
    checkProfanity: true
  }),
  (req, res) => {
    // Only 'content' and 'author' fields are validated
    res.json({ success: true });
  }
);
```

## Custom Error Handling

```typescript
import express from 'express';
import { patrolMiddleware } from '@ameshkin/payload-patrol/adapters/express';

const app = express();
app.use(express.json());

app.use(patrolMiddleware({
  blockSQLi: true,
  blockXSS: true,
  adapter: "block"
}));

// Error handler for validation failures
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.type === 'payload-patrol') {
    return res.status(400).json({
      error: 'Validation failed',
      issues: err.issues
    });
  }
  next(err);
});
```

