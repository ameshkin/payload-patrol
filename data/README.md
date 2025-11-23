# Badwords Data Files

Profanity lists organized by language and severity.

## Structure

```
data/
├── en/              # English (ISO 639-1: en)
│   ├── severe.json  # Strong profanity, slurs
│   └── mild.json    # Mild profanity, caution words
├── fr/              # French (ISO 639-1: fr)
│   ├── severe.json
│   └── mild.json
└── es/              # Spanish (ISO 639-1: es)
    ├── severe.json
    └── mild.json
```

## Severity Levels

### Severe (`severe.json`)
- Strong profanity
- Slurs and offensive terms
- Sexual/vulgar content
- **Use case**: Block in all public-facing applications

### Mild (`mild.json`)
- Mild profanity
- Borderline words
- Context-dependent terms
- **Use case**: Warn or allow with flagging

## Usage

### Default (English Severe)

```typescript
import { createPatrol } from '@ameshkin/payload-patrol';

const patrol = createPatrol({ checkProfanity: true });
// Uses default English severe words
```

### Custom Language

```typescript
import { registerProfanityList } from '@ameshkin/payload-patrol';
import frenchSevere from './data/fr/severe.json';

registerProfanityList(frenchSevere);

const patrol = createPatrol({ checkProfanity: true });
```

### Multiple Lists (Severe + Mild)

```typescript
import enSevere from './data/en/severe.json';
import enMild from './data/en/mild.json';

const combined = [...enSevere, ...enMild];
registerProfanityList(combined);
```

### Multi-Language

```typescript
import enSevere from './data/en/severe.json';
import frSevere from './data/fr/severe.json';
import esSevere from './data/es/severe.json';

const multiLang = [...enSevere, ...frSevere, ...esSevere];
registerProfanityList(multiLang);
```

## Severity-Based Filtering

```typescript
import { registerCheck } from '@ameshkin/payload-patrol';
import severe from './data/en/severe.json';
import mild from './data/en/mild.json';

const severeSet = new Set(severe.map(w => w.toLowerCase()));
const mildSet = new Set(mild.map(w => w.toLowerCase()));

registerCheck('profanity-tiered', (value) => {
  const tokens = value.toLowerCase().match(/[a-z]+/g) || [];
  const severeHits = tokens.filter(t => severeSet.has(t));
  const mildHits = tokens.filter(t => mildSet.has(t));
  
  return {
    name: 'profanity-tiered',
    ok: severeHits.length === 0,
    message: severeHits.length 
      ? `Severe profanity detected: ${severeHits.join(', ')}`
      : mildHits.length
        ? `Mild profanity detected: ${mildHits.join(', ')}`
        : undefined,
    details: {
      severity: severeHits.length ? 'severe' : mildHits.length ? 'mild' : 'clean',
      severe: severeHits,
      mild: mildHits
    }
  };
});
```

## Languages

| Code | Language | Severe | Mild |
|------|----------|--------|------|
| `en` | English  | ✅     | ✅   |
| `fr` | French   | ✅     | ✅   |
| `es` | Spanish  | ✅     | ✅   |

## Contributing

To add a new language:

1. Create folder with ISO 639-1 code
2. Add `severe.json` and `mild.json`
3. Follow existing structure
4. Update this README

## Notes

- All words are lowercase
- Includes common variations and misspellings
- Lists are curated for web application use
- Not suitable for all contexts (consider cultural differences)

## Maintenance

Update quarterly or as needed based on:
- New slang and variations
- Community feedback
- Regional differences
- Platform-specific terms

