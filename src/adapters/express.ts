/**
 * Express/Connect middleware adapter
 * Lightweight request body validation
 */

// Type-only imports - express is a peer dependency
type Request = any;
type Response = any;
type NextFunction = any;
import { createPatrol, type PatrolOptions, type ScanResult } from "../index";

export interface ExpressPatrolOptions extends PatrolOptions {
  /** Function to handle validation failures */
  onError?: (result: ScanResult, req: Request, res: Response) => void;
}

/**
 * Create Express middleware for request validation
 * 
 * @example
 * ```ts
 * import express from 'express';
 * import { patrolMiddleware } from '@ameshkin/payload-patrol/adapters/express';
 * 
 * const app = express();
 * app.use(express.json());
 * app.use(patrolMiddleware({
 *   blockSQLi: true,
 *   blockXSS: true,
 *   allowHTML: false
 * }));
 * ```
 */
export function patrolMiddleware(options: ExpressPatrolOptions = {}) {
  const patrol = createPatrol(options);
  
  const onError = options.onError || ((result, _req, res) => {
    res.status(400).json({
      error: "Invalid input",
      issues: result.issues,
    });
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only validate if there's a body
    if (!req.body || typeof req.body !== "object" || Object.keys(req.body).length === 0) {
      return next();
    }

    try {
      const result = await patrol.scan(req.body);
      
      if (!result.ok) {
        return onError(result, req, res);
      }
      
      // If strip mode, replace body with sanitized version
      if (options.adapter === "strip" && result.value) {
        req.body = result.value;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Validate specific fields in request
 * 
 * @example
 * ```ts
 * app.post('/api/user', 
 *   validateFields(['name', 'email', 'bio']),
 *   (req, res) => { ... }
 * );
 * ```
 */
export function validateFields(
  fields: string[],
  options: ExpressPatrolOptions = {}
) {
  const patrol = createPatrol(options);
  
  const onError = options.onError || ((result, _req, res) => {
    res.status(400).json({
      error: "Invalid input",
      issues: result.issues,
    });
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) {
      return next();
    }

    try {
      // Extract only specified fields
      const toValidate: Record<string, unknown> = {};
      for (const field of fields) {
        if (field in req.body) {
          toValidate[field] = req.body[field];
        }
      }

      if (Object.keys(toValidate).length === 0) {
        return next();
      }

      const result = await patrol.scan(toValidate);
      
      if (!result.ok) {
        return onError(result, req, res);
      }
      
      // Apply sanitized values back to body
      if (options.adapter === "strip" && result.value) {
        Object.assign(req.body, result.value);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

