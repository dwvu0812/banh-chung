import { Router } from "express";
import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { protect } from "../middleware/authMiddleware";
import { requireSuperAdmin } from "../middleware/adminMiddleware";
import crawlerJob from "../jobs/collocationCrawler";

const router = Router();

// @desc    Get crawler job status
// @route   GET /api/crawler/status
// @access  Private (super_admin)
router.get("/status", protect, requireSuperAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const status = crawlerJob.getJobStatus();
    res.json(status);
  } catch (error) {
    console.error("Get crawler status error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @desc    Start crawler job manually
// @route   POST /api/crawler/start
// @access  Private (super_admin)
router.post("/start", protect, requireSuperAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetCount = 50 } = req.body;

    const status = crawlerJob.getJobStatus();
    if (status.isRunning) {
      res.status(400).json({ msg: "Crawler job is already running" });
      return;
    }

    // Start the job asynchronously
    crawlerJob.runCrawlerJob(targetCount).catch(error => {
      console.error("Crawler job error:", error);
    });

    res.json({ 
      msg: "Crawler job started successfully",
      targetCount,
      startTime: new Date()
    });
  } catch (error) {
    console.error("Start crawler job error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @desc    Stop crawler job
// @route   POST /api/crawler/stop
// @access  Private (super_admin)
router.post("/stop", protect, requireSuperAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    crawlerJob.stopJob();
    res.json({ msg: "Crawler job stop signal sent" });
  } catch (error) {
    console.error("Stop crawler job error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @desc    Test crawler with small batch
// @route   POST /api/crawler/test
// @access  Private (super_admin)
router.post("/test", protect, requireSuperAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { count = 5 } = req.body;

    const status = crawlerJob.getJobStatus();
    if (status.isRunning) {
      res.status(400).json({ msg: "Crawler job is already running" });
      return;
    }

    const result = await crawlerJob.testCrawler(count);
    res.json(result);
  } catch (error) {
    console.error("Test crawler error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @desc    Get crawler job history
// @route   GET /api/crawler/history
// @access  Private (super_admin)
router.get("/history", protect, requireSuperAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const history = await crawlerJob.getJobHistory();
    res.json(history);
  } catch (error) {
    console.error("Get crawler history error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

export default router;
