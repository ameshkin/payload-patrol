/**
 * Hono middleware adapter
 * Lightweight validation for edge runtimes
 */

// Type-only imports - hono is a peer dependency
type Context = any;
type MiddlewareHandler = (c: Context, next: () => Promise<void>) => Promise<Response | void>;
import { createPatrol, type PatrolOptions } from "../index";

export interface HonoPatrolOptions extends PatrolOptions {
  /** Status code for validation failures (default: 400) */
  status?: number;
}

/**
 * Create Hono middleware for request validation
 * 
 * @example
 * ```ts
 * import { Hono } from 'hono';
 * import { patrol } from '@ameshkin/payload-patrol/adapters/hono';
 * 
 * const app = new Hono();
 * app.use('*', patrol({
 *   blockSQLi: true,
 *   blockXSS: true
 * }));
 * ```
 */
export function patrol(options: HonoPatrolOptions = {}): MiddlewareHandler {
  const patrolInstance = createPatrol(options);
  const status = options.status || 400;

  return async (c: Context, next) => {
    const contentType = c.req.header("content-type");
    
    // Only validate JSON bodies
    if (!contentType?.includes("application/json")) {
      return next();
    }

    try {
      const body = await c.req.json();
      
      if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
        return next();
      }

      const result = await patrolInstance.scan(body);
      
      if (!result.ok) {
        return c.json(
          {
            error: "Invalid input",
            issues: result.issues,
          },
          status
        );
      }
      
      // If strip mode, store sanitized body
      if (options.adapter === "strip" && result.value) {
        c.set("sanitizedBody", result.value);
      } else {
        c.set("sanitizedBody", body);
      }
      
      return next();
    } catch (error) {
      return next();
    }
  };
}

/**
 * Validate specific fields from request body
 * 
 * @example
 * ```ts
 * app.post('/user', 
 *   validateFields(['name', 'email']),
 *   (c) => { ... }
 * );
 * ```
 */
export function validateFields(
  fields: string[],
  options: HonoPatrolOptions = {}
): MiddlewareHandler {
  const patrolInstance = createPatrol(options);
  const status = options.status || 400;

  return async (c: Context, next) => {
    try {
      const body = await c.req.json();
      
      if (!body || typeof body !== "object") {
        return next();
      }

      // Extract specified fields
      const toValidate: Record<string, unknown> = {};
      for (const field of fields) {
        if (field in body) {
          toValidate[field] = body[field];
        }
      }

      if (Object.keys(toValidate).length === 0) {
        return next();
      }

      const result = await patrolInstance.scan(toValidate);
      
      if (!result.ok) {
        return c.json(
          {
            error: "Invalid input",
            issues: result.issues,
          },
          status
        );
      }
      
      // Store sanitized data
      if (options.adapter === "strip" && result.value) {
        c.set("sanitizedBody", { ...body, ...result.value });
      } else {
        c.set("sanitizedBody", body);
      }
      
      return next();
    } catch (error) {
      return next();
    }
  };
}

