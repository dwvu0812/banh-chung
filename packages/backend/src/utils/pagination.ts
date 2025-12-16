// Pagination utility functions
import { Request } from "express";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Validate and parse pagination parameters
 * @param page - Page number from query string
 * @param limit - Limit from query string
 * @param maxLimit - Maximum allowed limit (default: 100)
 * @returns Validated pagination parameters
 */
export const validatePagination = (
  page: string | undefined,
  limit: string | undefined,
  maxLimit: number = 100
): PaginationParams => {
  // Parse and validate page number
  let pageNum = parseInt(page || "1", 10);
  if (isNaN(pageNum) || pageNum < 1) {
    pageNum = 1;
  }

  // Parse and validate limit
  let limitNum = parseInt(limit || "20", 10);
  if (isNaN(limitNum) || limitNum < 1) {
    limitNum = 20;
  }
  // Cap limit at maximum
  if (limitNum > maxLimit) {
    limitNum = maxLimit;
  }

  // Calculate skip value
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

/**
 * Extract pagination parameters from Express request
 * @param req - Express request object
 * @param maxLimit - Maximum allowed limit (default: 100)
 * @returns Validated pagination parameters
 */
export const getPaginationParams = (
  req: Request,
  maxLimit: number = 100
): PaginationParams => {
  const { page, limit } = req.query;

  return validatePagination(page as string, limit as string, maxLimit);
};

/**
 * Calculate pagination metadata
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Pagination metadata object
 */
export const getPaginationMeta = (
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return {
    current: page,
    total: totalPages,
    totalItems: total,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
