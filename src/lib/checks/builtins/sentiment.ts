import type { CheckFn } from "../../../types";

// Lightweight sentiment analysis without external dependencies
// Uses AFINN-inspired word lists for basic sentiment scoring

const POSITIVE_WORDS = new Set([
  "good", "great", "excellent", "amazing", "wonderful", "fantastic", "awesome", "love", "like",
  "happy", "joy", "pleased", "delighted", "thrilled", "excited", "brilliant", "perfect",
  "beautiful", "nice", "best", "super", "fabulous", "terrific", "outstanding", "impressive",
  "glad", "thank", "thanks", "appreciate", "enjoy", "fun", "exceeded", "exceeds", "quality"
]);

const NEGATIVE_WORDS = new Set([
  "bad", "terrible", "awful", "horrible", "worst", "hate", "dislike", "angry", "sad",
  "disappointed", "frustrated", "annoyed", "upset", "unhappy", "poor", "sucks", "useless",
  "waste", "fail", "failed", "wrong", "problem", "issue", "concern", "worried", "fear",
  "afraid", "scary", "difficult", "hard", "confusing", "broken", "error"
]);

const INTENSIFIERS = new Set([
  "very", "extremely", "really", "super", "incredibly", "absolutely", "totally", "completely"
]);

const NEGATIONS = new Set([
  "not", "no", "never", "none", "nobody", "nothing", "neither", "nowhere", "hardly", "barely"
]);

export interface SentimentResult {
  score: number;        // -5 to +5
  comparative: number;  // score / tokens (normalized)
  mood: "negative" | "neutral" | "positive";
  tokens: number;
  positive: string[];
  negative: string[];
}

/**
 * Analyze sentiment of text and return detailed results
 */
export function analyzeSentiment(text: string): SentimentResult {
  const tokens = text.toLowerCase().match(/[a-z']+/g) || [];
  let score = 0;
  const positive: string[] = [];
  const negative: string[] = [];
  
  let nextNegated = false;
  let nextIntensified = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    let tokenScore = 0;

    if (NEGATIONS.has(token)) {
      nextNegated = true;
      continue;
    }

    if (INTENSIFIERS.has(token)) {
      nextIntensified = true;
      continue;
    }

    if (POSITIVE_WORDS.has(token)) {
      tokenScore = 1;
      positive.push(token);
    } else if (NEGATIVE_WORDS.has(token)) {
      tokenScore = -1;
      negative.push(token);
    }

    // Apply modifiers
    if (nextIntensified) {
      tokenScore *= 2;
      nextIntensified = false;
    }

    if (nextNegated) {
      tokenScore *= -1;
      nextNegated = false;
    }

    score += tokenScore;
  }

  const comparative = tokens.length > 0 ? score / tokens.length : 0;
  
  let mood: "negative" | "neutral" | "positive";
  if (comparative < -0.1) mood = "negative";
  else if (comparative > 0.1) mood = "positive";
  else mood = "neutral";

  return {
    score,
    comparative,
    mood,
    tokens: tokens.length,
    positive,
    negative,
  };
}

/**
 * Sentiment check - can be used to warn about negative sentiment
 * or just to analyze mood without blocking
 */
export const sentimentCheck: CheckFn = (value, ctx) => {
  const analysis = analyzeSentiment(value);
  
  // By default, sentiment check is informational (always passes)
  // But provides rich details for UI components
  return {
    name: "sentiment",
    ok: true, // Always passes - informational only
    message: undefined,
    details: {
      mood: analysis.mood,
      score: analysis.score,
      comparative: analysis.comparative,
      positive: analysis.positive,
      negative: analysis.negative,
      tokens: analysis.tokens,
    },
  };
};

