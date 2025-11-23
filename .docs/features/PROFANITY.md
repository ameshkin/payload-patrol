# Profanity Filtering

Multi-language profanity detection with customizable word lists and severity levels.

## Features

- **Multi-language support** - English, French, Spanish
- **Severity levels** - Separate severe and mild word lists
- **Customizable** - Register your own word lists
- **Allowlist support** - Bypass false positives
- **Case insensitive** - Detects profanity regardless of case

## Basic Usage

```typescript
import { createPatrol } from '@ameshkin/payload-patrol';

const patrol = createPatrol({ checkProfanity: true });
const result = await patrol.scan("You're an asshole");

console.log(result.ok); // false
console.log(result.issues[0].details?.hits); // ["asshole"]
```

## Default Word Lists

The package ships with organized word lists by language:

```
data/
├── en/ (English)
│   ├── severe.json  # 360+ severe terms
│   └── mild.json    # 20 mild terms
├── fr/ (French)
│   ├── severe.json  # 42 severe terms
│   └── mild.json    # 6 mild terms
└── es/ (Spanish)
    ├── severe.json  # 40 severe terms
    └── mild.json    # 7 mild terms
```

## Custom Word Lists

### Register Custom List

```typescript
import { registerProfanityList } from '@ameshkin/payload-patrol';

// Simple list
registerProfanityList(["spam", "scam", "fake"]);

// Load from JSON
import badwords from './data/en/severe.json';
registerProfanityList(badwords);
```

### Multi-Language Support

```typescript
import enSevere from './data/en/severe.json';
import frSevere from './data/fr/severe.json';
import esSevere from './data/es/severe.json';

const multiLang = [...enSevere, ...frSevere, ...esSevere];
registerProfanityList(multiLang);
```

### Severity-Based Lists

```typescript
import severe from './data/en/severe.json';
import mild from './data/en/mild.json';

// Use only severe words
registerProfanityList(severe);

// Or combine both
const allWords = [...severe, ...mild];
registerProfanityList(allWords);
```

## Examples

### Basic Filtering

```typescript
const patrol = createPatrol({ checkProfanity: true });

const result = await patrol.scan("This is a badword");
if (!result.ok) {
  console.log(result.issues[0].message);
  // "Contains blocked terms: badword"
}
```

### With Allowlist

```typescript
const patrol = createPatrol({
  checkProfanity: true,
  allowlist: ["scunthorpe"] // Famous false positive
});

const result = await patrol.scan("Scunthorpe problem");
console.log(result.ok); // true (allowed)
```

### Case Insensitive

```typescript
const patrol = createPatrol({ checkProfanity: true });

// All of these are detected
await patrol.scan("ASSHOLE");  // detected
await patrol.scan("asshole");  // detected
await patrol.scan("AssHole"); // detected
```

### In Objects

```typescript
const result = await patrol.scan({
  name: "Alice",
  comment: "You're an asshole"
});

console.log(result.issues[0].path); // ["comment"]
console.log(result.issues[0].rule); // "badwords"
```

### Strip Mode

```typescript
const patrol = createPatrol({
  checkProfanity: true,
  adapter: "strip" // Note: badwords check doesn't strip, only reports
});

const result = await patrol.scan("badword text");
// Strip mode doesn't remove words, just reports them
```

## Custom Check with Severity

```typescript
import { registerCheck } from '@ameshkin/payload-patrol';
import severe from './data/en/severe.json';
import mild from './data/en/mild.json';

const severeSet = new Set(severe.map(w => w.toLowerCase()));
const mildSet = new Set(mild.map(w => w.toLowerCase()));

registerCheck('profanity-tiered', (value, ctx) => {
  const tokens = value.toLowerCase().match(/[a-z]+/g) || [];
  const severeHits = tokens.filter(t => severeSet.has(t));
  const mildHits = tokens.filter(t => mildSet.has(t));
  
  return {
    name: 'profanity-tiered',
    ok: severeHits.length === 0,
    message: severeHits.length 
      ? `Severe profanity: ${severeHits.join(', ')}`
      : mildHits.length
        ? `Mild profanity: ${mildHits.join(', ')}`
        : undefined,
    details: {
      severity: severeHits.length ? 'severe' : mildHits.length ? 'mild' : 'clean',
      severe: severeHits,
      mild: mildHits
    }
  };
});
```

## Integration Examples

### API Route

```typescript
// Next.js API route
import { createPatrol } from '@ameshkin/payload-patrol';

export async function POST(request: Request) {
  const { comment } = await request.json();
  
  const patrol = createPatrol({ checkProfanity: true });
  const result = await patrol.scan(comment);
  
  if (!result.ok) {
    return Response.json(
      { error: 'Comment contains inappropriate language' },
      { status: 400 }
    );
  }
  
  // Save comment
  return Response.json({ success: true });
}
```

### Form Validation

```typescript
import { createPatrol } from '@ameshkin/payload-patrol';

function validateForm(data: FormData) {
  const patrol = createPatrol({
    checkProfanity: true,
    allowlist: ["scunthorpe"] // Known false positive
  });
  
  return patrol.scan({
    username: data.get('username'),
    bio: data.get('bio')
  });
}
```

### React Hook

```tsx
import { useState, useEffect } from 'react';
import { createPatrol } from '@ameshkin/payload-patrol';

function useProfanityCheck(text: string) {
  const [hasProfanity, setHasProfanity] = useState(false);
  
  useEffect(() => {
    const check = async () => {
      const patrol = createPatrol({ checkProfanity: true });
      const result = await patrol.scan(text);
      setHasProfanity(!result.ok);
    };
    
    if (text) check();
  }, [text]);
  
  return hasProfanity;
}
```

## Best Practices

1. **Register lists early** - Do it at app startup
2. **Use appropriate severity** - Severe for public content, mild for warnings
3. **Maintain allowlists** - Keep false positives in allowlist
4. **Update regularly** - Refresh word lists quarterly
5. **Consider context** - Some words are fine in certain contexts

## Data Files

See [data/README.md](../../data/README.md) for complete documentation on:
- Language codes (ISO 639-1)
- Severity levels
- File structure
- Contributing new languages

