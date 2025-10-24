import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

interface MetricData {
  timestamp: number;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  userId?: string;
}

class MonitoringService {
  private metrics: MetricData[] = [];
  private readonly MAX_METRICS = 10000;

  recordRequest(req: Request, res: Response, responseTime: number) {
    const metric: MetricData = {
      timestamp: Date.now(),
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTime,
      userId: (req as any).user?.id
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log slow requests
    if (responseTime > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.path} took ${responseTime}ms`);
    }

    // Log errors
    if (res.statusCode >= 400) {
      logger.error(`Error response: ${req.method} ${req.path} returned ${res.statusCode}`);
    }
  }

  getMetrics(since?: number) {
    const cutoff = since || Date.now() - 3600000; // Default 1 hour
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  getStats() {
    const recent = this.getMetrics();

    if (recent.length === 0) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        errorRate: 0,
        slowRequests: 0
      };
    }

    const totalRequests = recent.length;
    const avgResponseTime = recent.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    const errors = recent.filter(m => m.statusCode >= 400).length;
    const errorRate = errors / totalRequests;
    const slowRequests = recent.filter(m => m.responseTime > 1000).length;

    return {
      totalRequests,
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      slowRequests
    };
  }
}

export const monitoring = new MonitoringService();

// Middleware to track request metrics
export const trackMetrics = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args: any[]): any {
    const responseTime = Date.now() - startTime;
    monitoring.recordRequest(req, res, responseTime);
    return originalEnd.apply(res, args);
  };

  next();
};
