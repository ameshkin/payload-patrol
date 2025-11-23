# Sentiment Analysis / Mood Detection

Lightweight sentiment analysis to detect user mood in text input.

## Features

- **No external dependencies** - Built-in word lists
- **Mood detection** - Negative, neutral, or positive
- **Detailed scoring** - Normalized sentiment scores
- **Negation handling** - Detects "not good", etc.
- **Intensifier support** - Handles "very", "extremely", etc.
- **Always passes** - Informational only, never blocks input

## Basic Usage

```typescript
import { analyzeSentiment } from '@ameshkin/payload-patrol';

const result = analyzeSentiment("I really love this product!");

console.log(result);
// {
//   score: 2,
//   comparative: 0.4,
//   mood: "positive",
//   tokens: 5,
//   positive: ["love"],
//   negative: []
// }
```

## Mood Thresholds

- **Negative**: comparative < -0.1
- **Neutral**: -0.1 <= comparative <= 0.1  
- **Positive**: comparative > 0.1

## Using with Checks

```typescript
import { createPatrol } from '@ameshkin/payload-patrol';

const patrol = createPatrol();
const result = await patrol.scan("I hate this bug", {
  adapter: "warn"
});

// Check sentiment details
const sentimentResult = result.issues.find(i => i.rule === "sentiment");
if (sentimentResult) {
  console.log(sentimentResult.details?.mood); // "negative"
}
```

## Examples

### Basic React Component

```tsx
import { useState, useEffect } from 'react';
import { analyzeSentiment } from '@ameshkin/payload-patrol';

export function MoodDetectorBasic() {
  const [text, setText] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (text.length > 10) {
      const analysis = analyzeSentiment(text);
      setMood(analysis.mood);
      setScore(analysis.score);
    } else {
      setMood(null);
      setScore(0);
    }
  }, [text]);

  const getMoodColor = () => {
    if (!mood) return '#e0e0e0';
    switch (mood) {
      case 'positive': return '#4caf50';
      case 'negative': return '#f44336';
      default: return '#2196f3';
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto' }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something to analyze the mood..."
        style={{
          width: '100%',
          minHeight: '150px',
          padding: '12px',
          fontSize: '16px',
          borderRadius: '8px',
          border: '2px solid #ddd',
          fontFamily: 'system-ui'
        }}
      />
      {mood && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            background: getMoodColor(),
            color: 'white',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          Mood: {mood.toUpperCase()} (Score: {score > 0 ? '+' : ''}{score})
        </div>
      )}
    </div>
  );
}
```

### Material-UI Version

```tsx
import { useState, useEffect } from 'react';
import { TextField, Chip, Box, Typography } from '@mui/material';
import {
  SentimentVeryDissatisfied,
  SentimentSatisfied,
  SentimentNeutral
} from '@mui/icons-material';
import { analyzeSentiment, type SentimentResult } from '@ameshkin/payload-patrol';

export function MoodDetectorMUI() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<SentimentResult | null>(null);

  useEffect(() => {
    if (text.length > 10) {
      const result = analyzeSentiment(text);
      setAnalysis(result);
    } else {
      setAnalysis(null);
    }
  }, [text]);

  const getMoodIcon = () => {
    if (!analysis) return null;
    switch (analysis.mood) {
      case 'positive': return <SentimentSatisfied />;
      case 'negative': return <SentimentVeryDissatisfied />;
      default: return <SentimentNeutral />;
    }
  };

  const getMoodColor = () => {
    if (!analysis) return 'default' as const;
    switch (analysis.mood) {
      case 'positive': return 'success' as const;
      case 'negative': return 'error' as const;
      default: return 'info' as const;
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <TextField
        multiline
        rows={6}
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something to analyze the mood..."
        variant="outlined"
      />
      
      {analysis && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            icon={getMoodIcon()}
            label={`Mood: ${analysis.mood}`}
            color={getMoodColor()}
            size="medium"
          />
          <Typography variant="body2" color="text.secondary">
            Score: {analysis.score > 0 ? '+' : ''}{analysis.score} 
            ({analysis.comparative.toFixed(3)})
          </Typography>
        </Box>
      )}

      {analysis && analysis.positive.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="success.main">
            Positive words: {analysis.positive.join(', ')}
          </Typography>
        </Box>
      )}

      {analysis && analysis.negative.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="error.main">
            Negative words: {analysis.negative.join(', ')}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
```

### Debounced Version (Performance)

```tsx
import { useState, useEffect } from 'react';
import { analyzeSentiment } from '@ameshkin/payload-patrol';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function MoodDetectorDebounced() {
  const [text, setText] = useState('');
  const debouncedText = useDebounce(text, 500);
  const [mood, setMood] = useState<string | null>(null);

  useEffect(() => {
    if (debouncedText.length > 10) {
      const analysis = analyzeSentiment(debouncedText);
      setMood(analysis.mood);
    } else {
      setMood(null);
    }
  }, [debouncedText]);

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing... (analysis happens after you stop typing)"
      />
      {mood && <div>Current mood: {mood}</div>}
    </div>
  );
}
```

### Support Ticket Prioritization

```typescript
import { analyzeSentiment } from '@ameshkin/payload-patrol';

interface Ticket {
  id: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
}

export function prioritizeTicket(ticket: Ticket): Ticket {
  const analysis = analyzeSentiment(ticket.message);
  
  if (analysis.mood === 'negative' && analysis.score < -3) {
    return { ...ticket, priority: 'high' };
  } else if (analysis.mood === 'negative') {
    return { ...ticket, priority: 'medium' };
  } else {
    return { ...ticket, priority: 'low' };
  }
}
```

### Next.js API Route

```typescript
// app/api/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { analyzeSentiment } from '@ameshkin/payload-patrol';

export async function POST(request: NextRequest) {
  const { feedback } = await request.json();
  const analysis = analyzeSentiment(feedback);
  
  await db.feedback.create({
    data: {
      text: feedback,
      mood: analysis.mood,
      sentimentScore: analysis.score
    }
  });
  
  if (analysis.mood === 'negative' && analysis.score < -3) {
    await notifySupport({ message: feedback, severity: 'urgent' });
  }
  
  return NextResponse.json({ success: true, mood: analysis.mood });
}
```

## Advanced: Custom Word Lists

```typescript
import { registerCheck } from '@ameshkin/payload-patrol';
import Sentiment from 'sentiment'; // npm package

const sentiment = new Sentiment();

registerCheck('advanced-sentiment', (value) => {
  const result = sentiment.analyze(value);
  return {
    name: 'advanced-sentiment',
    ok: true,
    details: {
      mood: result.score > 0 ? 'positive' : result.score < 0 ? 'negative' : 'neutral',
      score: result.score,
      comparative: result.comparative
    }
  };
});
```

## Use Cases

1. **Customer feedback analysis** - Detect unhappy customers
2. **Support ticket prioritization** - Route negative sentiment faster
3. **Content moderation** - Flag potentially hostile messages
4. **UX research** - Track user sentiment during onboarding
5. **Chat applications** - Add emoji suggestions based on mood

## Limitations

- English language only (for built-in analyzer)
- Simple word-based scoring (no context understanding)
- Sarcasm not detected
- Short texts may be unreliable

For production sentiment analysis, consider:
- AWS Comprehend
- Google Cloud Natural Language
- Azure Text Analytics
- `sentiment` npm package
