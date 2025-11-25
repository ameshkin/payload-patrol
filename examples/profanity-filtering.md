# Profanity Filtering Examples

## Basic Profanity Check

```typescript
import { createPatrol, registerProfanityList } from '@ameshkin/payload-patrol';

// Register custom profanity list
registerProfanityList(["badword", "anotherword"]);

const patrol = createPatrol({
  checkProfanity: true
});

const result = await patrol.scan("This contains badword");
// result.ok === false
// result.issues[0].rule === "badwords"
```

## Allowlist Configuration

```typescript
import { createPatrol } from '@ameshkin/payload-patrol';

const patrol = createPatrol({
  checkProfanity: true,
  allowlist: ["scunthorpe"] // Allow this word even if in profanity list
});

const result = await patrol.scan("scunthorpe problem");
// result.ok === true (allowed via allowlist)
```

## Multi-Language Support

```typescript
import { createPatrol } from '@ameshkin/payload-patrol';
import { registerBadwords } from '@ameshkin/payload-patrol/lib/checks/builtins/badwords';

// Load French profanity list
import frBadwords from '@ameshkin/payload-patrol/data/fr/severe.json';
registerBadwords(frBadwords);

const patrol = createPatrol({
  checkProfanity: true
});

const result = await patrol.scan("French profanity here");
```

## Custom Profanity Lists

```typescript
import { registerProfanityList, createPatrol } from '@ameshkin/payload-patrol';

// Register multiple lists
registerProfanityList(["word1", "word2"]);
registerProfanityList(["word3", "word4"]); // Merges with previous

const patrol = createPatrol({
  checkProfanity: true
});

const result = await patrol.scan("Contains word1 and word3");
// Detects both words
```

