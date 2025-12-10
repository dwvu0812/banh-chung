import { Request, Response, NextFunction } from "express";
import logger from "./logger";

// Middleware to log response time
export const responseTimeLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`;

    if (duration > 1000) {
      // Log slow requests (> 1 second)
      logger.warn(`SLOW REQUEST: ${message}`);
    } else {
      logger.http(message);
    }
  });

  next();
};

// Helper to measure async function execution time
export const measureExecutionTime = async <T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    logger.debug(`${label} took ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`${label} failed after ${duration}ms:`, error);
    throw error;
  }
};

// Query optimization helper - logs slow queries
export const logSlowQuery = (model: string, query: any, duration: number) => {
  if (duration > 500) {
    // Log queries taking more than 500ms
    logger.warn(
      `SLOW QUERY on ${model}: ${JSON.stringify(query)} - ${duration}ms`
    );
  }
};

