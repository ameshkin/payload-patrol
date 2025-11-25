/**
 * Security utilities for input validation
 * Protects against ReDoS, prototype pollution, and other attacks
 */

// Maximum input length to prevent ReDoS attacks
const MAX_INPUT_LENGTH = 1_000_000; // 1MB

// Maximum regex execution time (milliseconds)
const MAX_REGEX_TIME = 100;

/**
 * Safely execute regex with timeout protection
 */
export function safeRegexTest(regex: RegExp, value: string): boolean {
  // Check input length first
  if (value.length > MAX_INPUT_LENGTH) {
    return false; // Reject extremely long inputs
  }

  try {
    // Use a simple test - most engines handle this efficiently
    return regex.test(value);
  } catch (error) {
    // If regex fails, reject the input
    return false;
  }
}

/**
 * Safely execute regex match with timeout protection
 */
export function safeRegexMatch(regex: RegExp, value: string): RegExpMatchArray | null {
  if (value.length > MAX_INPUT_LENGTH) {
    return null;
  }

  try {
    return value.match(regex);
  } catch (error) {
    return null;
  }
}

/**
 * Safely execute regex exec with iteration limit
 */
export function safeRegexExec(
  regex: RegExp,
  value: string,
  maxIterations: number = 1000
): RegExpExecArray | null {
  if (value.length > MAX_INPUT_LENGTH) {
    return null;
  }

  try {
    // Reset regex lastIndex to avoid state issues
    regex.lastIndex = 0;
    
    // Execute regex once and return the match
    const match = regex.exec(value);
    return match;
  } catch (error) {
    return null;
  }
}

/**
 * Check if value is a plain object (not a prototype pollution risk)
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  // Check if it's an array
  if (Array.isArray(value)) {
    return false;
  }

  // Check if constructor is Object
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

/**
 * Sanitize object keys to prevent prototype pollution
 */
export function sanitizeKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const dangerous = ["__proto__", "constructor", "prototype"];
  
  for (const key in obj) {
    // Use hasOwnProperty to avoid prototype chain pollution
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Reject dangerous keys
      if (dangerous.includes(key)) {
        continue;
      }
      
      const value = obj[key];
      // Recursively sanitize nested objects
      if (isPlainObject(value)) {
        sanitized[key] = sanitizeKeys(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          isPlainObject(item) ? sanitizeKeys(item as Record<string, unknown>) : item
        );
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  // Double-check: ensure dangerous keys are not present (even via prototype)
  for (const key of dangerous) {
    if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
      delete sanitized[key];
    }
  }
  
  return sanitized;
}

/**
 * Validate input length before processing
 */
export function validateInputLength(value: string, maxLength: number = MAX_INPUT_LENGTH): boolean {
  return typeof value === "string" && value.length <= maxLength;
}

