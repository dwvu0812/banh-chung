import { Document, Query } from 'mongoose';

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CursorPaginationResult<T> {
  data: T[];
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
    totalCount?: number;
  };
}

export interface CursorPaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
  defaultSortField?: string;
  defaultSortOrder?: 'asc' | 'desc';
  includeTotalCount?: boolean;
}

/**
 * Enhanced cursor-based pagination utility for better performance
 * Uses MongoDB ObjectId or custom fields for cursor-based pagination
 */
export class CursorPagination {
  private defaultLimit: number;
  private maxLimit: number;
  private defaultSortField: string;
  private defaultSortOrder: 'asc' | 'desc';
  private includeTotalCount: boolean;

  constructor(options: CursorPaginationOptions = {}) {
    this.defaultLimit = options.defaultLimit || 20;
    this.maxLimit = options.maxLimit || 100;
    this.defaultSortField = options.defaultSortField || '_id';
    this.defaultSortOrder = options.defaultSortOrder || 'desc';
    this.includeTotalCount = options.includeTotalCount || false;
  }

  /**
   * Parse cursor pagination parameters from request
   */
  parseParams(query: any): CursorPaginationParams {
    const limit = Math.min(
      parseInt(query.limit) || this.defaultLimit,
      this.maxLimit
    );

    return {
      cursor: query.cursor || undefined,
      limit,
      sortField: query.sortField || this.defaultSortField,
      sortOrder: query.sortOrder === 'asc' ? 'asc' : this.defaultSortOrder
    };
  }

  /**
   * Apply cursor pagination to a Mongoose query
   */
  async paginate<T extends Document>(
    query: Query<T[], T>,
    params: CursorPaginationParams,
    countQuery?: Query<number, T>
  ): Promise<CursorPaginationResult<T>> {
    const { cursor, limit = this.defaultLimit, sortField = this.defaultSortField, sortOrder = this.defaultSortOrder } = params;

    // Build sort object
    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Apply cursor filtering if provided
    if (cursor) {
      try {
        const cursorValue = this.decodeCursor(cursor);
        const operator = sortOrder === 'asc' ? '$gt' : '$lt';
        query = query.where(sortField).where({ [operator]: cursorValue });
      } catch (error) {
        console.error('Invalid cursor provided:', error);
        // Continue without cursor filtering if cursor is invalid
      }
    }

    // Apply sorting and limit
    query = query.sort(sortObj).limit(limit + 1); // +1 to check if there's a next page

    // Execute query
    const results = await query.exec();

    // Check if there's a next page
    const hasNextPage = results.length > limit;
    if (hasNextPage) {
      results.pop(); // Remove the extra item
    }

    // Generate cursors
    const nextCursor = hasNextPage && results.length > 0 
      ? this.encodeCursor(results[results.length - 1][sortField])
      : undefined;

    const previousCursor = results.length > 0 
      ? this.encodeCursor(results[0][sortField])
      : undefined;

    // Get total count if requested
    let totalCount: number | undefined;
    if (this.includeTotalCount && countQuery) {
      totalCount = await countQuery.countDocuments();
    }

    return {
      data: results,
      pagination: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        nextCursor,
        previousCursor,
        totalCount
      }
    };
  }

  /**
   * Encode cursor value to base64
   */
  private encodeCursor(value: any): string {
    return Buffer.from(JSON.stringify(value)).toString('base64');
  }

  /**
   * Decode cursor value from base64
   */
  private decodeCursor(cursor: string): any {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch (error) {
      throw new Error('Invalid cursor format');
    }
  }
}

/**
 * Create a cursor pagination instance with default options
 */
export const createCursorPagination = (options?: CursorPaginationOptions) => {
  return new CursorPagination(options);
};

/**
 * Legacy offset-based pagination for backward compatibility
 */
export interface OffsetPaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface OffsetPaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const getPaginationParams = (req: any): OffsetPaginationParams => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const createPaginationResult = <T>(
  data: T[],
  total: number,
  params: OffsetPaginationParams
): OffsetPaginationResult<T> => {
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      pages: Math.ceil(total / params.limit)
    }
  };
};
