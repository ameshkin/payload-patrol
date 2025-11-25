# Sentiment Analysis Examples

## Basic Sentiment Detection

```typescript
import { analyzeSentiment } from '@ameshkin/payload-patrol';

const feedback = "I love this product! Great customer service.";
const analysis = analyzeSentiment(feedback);

console.log(analysis.mood);      // "positive"
console.log(analysis.score);     // 2
console.log(analysis.comparative); // 0.4
console.log(analysis.positive);  // ["love", "great"]
```

## Negative Sentiment Detection

```typescript
import { analyzeSentiment } from '@ameshkin/payload-patrol';

const complaint = "I hate this terrible product. Worst experience ever.";
const analysis = analyzeSentiment(complaint);

console.log(analysis.mood);      // "negative"
console.log(analysis.score);     // -3
console.log(analysis.negative);  // ["hate", "terrible", "worst"]
```

## Using with Patrol

```typescript
import { createPatrol } from '@ameshkin/payload-patrol';

const patrol = createPatrol({
  // ... other options
});

const result = await patrol.scan({
  comment: "This is amazing! I love it!"
});

// Sentiment details available in check results
const sentimentCheck = result.issues.find(i => i.rule === "sentiment");
if (sentimentCheck?.details) {
  console.log(sentimentCheck.details.mood); // "positive"
}
```

## Custom Sentiment Thresholds

```typescript
import { analyzeSentiment } from '@ameshkin/payload-patrol';

function checkSentiment(text: string, threshold: number = 0.1) {
  const analysis = analyzeSentiment(text);
  
  if (analysis.comparative > threshold) {
    return { action: "flag_positive", ...analysis };
  } else if (analysis.comparative < -threshold) {
    return { action: "flag_negative", ...analysis };
  }
  
  return { action: "neutral", ...analysis };
}

const result = checkSentiment("This is terrible!");
// { action: "flag_negative", mood: "negative", ... }
```

