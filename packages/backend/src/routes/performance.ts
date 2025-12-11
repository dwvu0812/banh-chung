import { Router } from "express";
import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { protect } from "../middleware/authMiddleware";
import { requireSuperAdmin } from "../middleware/adminMiddleware";
import { performanceMonitor } from "../middleware/performance";
import crawlerJob from "../jobs/collocationCrawler";

const router = Router();

// @desc    Get performance metrics
// @route   GET /api/performance/metrics
// @access  Private (super_admin)
router.get("/metrics", protect, requireSuperAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = performanceMonitor.getStats();
    const slowQueries = performanceMonitor.getSlowQueries(1000);
    
    res.json({
      overview: stats,
      slowQueries: slowQueries.slice(-10), // Last 10 slow queries
      averageResponseTimes: {
        collocations: performanceMonitor.getAverageResponseTime('/api/collocations'),
        auth: performanceMonitor.getAverageResponseTime('/api/auth'),
        stats: performanceMonitor.getAverageResponseTime('/api/stats')
      }
    });
  } catch (error) {
    console.error("Get performance metrics error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @desc    Get detailed performance data
// @route   GET /api/performance/detailed
// @access  Private (super_admin)
router.get("/detailed", protect, requireSuperAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 100 } = req.query;
    const metrics = performanceMonitor.getMetrics().slice(-parseInt(limit as string));
    
    res.json({
      metrics,
      count: metrics.length
    });
  } catch (error) {
    console.error("Get detailed performance data error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @desc    Clear performance metrics
// @route   DELETE /api/performance/metrics
// @access  Private (super_admin)
router.delete("/metrics", protect, requireSuperAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    performanceMonitor.clearMetrics();
    res.json({ msg: "Performance metrics cleared successfully" });
  } catch (error) {
    console.error("Clear performance metrics error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @desc    Get system health status
// @route   GET /api/performance/health
// @access  Private (super_admin)
router.get("/health", protect, requireSuperAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = performanceMonitor.getStats();
    const crawlerStatus = crawlerJob.getJobStatus();
    
    // Determine health status
    const isHealthy = stats.averageResponseTime < 1000 && stats.errorRate < 5;
    
    res.json({
      status: isHealthy ? 'healthy' : 'warning',
      timestamp: new Date(),
      metrics: {
        averageResponseTime: stats.averageResponseTime,
        errorRate: stats.errorRate,
        totalRequests: stats.totalRequests,
        slowQueries: stats.slowQueries
      },
      crawler: {
        isRunning: crawlerStatus.isRunning,
        lastJob: crawlerStatus.lastJob
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      uptime: Math.round(process.uptime())
    });
  } catch (error) {
    console.error("Get system health error:", error);
    res.status(500).json({ 
      status: 'error',
      msg: "Server Error",
      timestamp: new Date()
    });
  }
});

export default router;
