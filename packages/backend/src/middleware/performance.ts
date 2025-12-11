import { Request, Response, NextFunction } from 'express';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics: number = 1000; // Keep last 1000 requests

  addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only the last N metrics to prevent memory issues
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageResponseTime(endpoint?: string): number {
    const relevantMetrics = endpoint 
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;

    if (relevantMetrics.length === 0) return 0;

    const total = relevantMetrics.reduce((sum, metric) => sum + metric.responseTime, 0);
    return Math.round(total / relevantMetrics.length);
  }

  getSlowQueries(threshold: number = 1000): PerformanceMetrics[] {
    return this.metrics.filter(m => m.responseTime > threshold);
  }

  getErrorRate(): number {
    if (this.metrics.length === 0) return 0;
    
    const errors = this.metrics.filter(m => m.statusCode >= 400).length;
    return Math.round((errors / this.metrics.length) * 100);
  }

  getStats(): {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    slowQueries: number;
  } {
    return {
      totalRequests: this.metrics.length,
      averageResponseTime: this.getAverageResponseTime(),
      errorRate: this.getErrorRate(),
      slowQueries: this.getSlowQueries().length
    };
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance monitoring middleware
 */
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const responseTime = Date.now() - startTime;
    
    // Add metric to monitor
    performanceMonitor.addMetric({
      endpoint: req.path,
      method: req.method,
      responseTime,
      statusCode: res.statusCode,
      timestamp: new Date(),
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    });

    // Log slow queries
    if (responseTime > 2000) {
      console.warn(`Slow query detected: ${req.method} ${req.path} - ${responseTime}ms`);
    }

    // Call original end method
    originalEnd.apply(this, args);
  };

  next();
};

/**
 * Response optimization middleware
 */
export const responseOptimization = (req: Request, res: Response, next: NextFunction): void => {
  // Set cache headers for static content
  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
  }

  // Set cache headers for API responses
  if (req.path.startsWith('/api/collocations') && req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
  }

  // Add performance headers
  res.setHeader('X-Response-Time', Date.now().toString());

  next();
};

/**
 * Database query optimization middleware
 */
export const queryOptimization = (req: Request, res: Response, next: NextFunction): void => {
  // Add query hints for common patterns
  if (req.path.startsWith('/api/collocations')) {
    // Add lean query hint for better performance
    req.query.lean = 'true';
    
    // Limit fields for list endpoints
    if (req.path === '/api/collocations' || req.path === '/api/collocations/cursor') {
      req.query.select = 'phrase meaning tags difficulty createdAt deck';
    }
  }

  next();
};
