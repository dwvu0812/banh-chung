import cron from 'node-cron';
import OxfordCrawlerService from '../services/oxfordCrawler';
import Collocation from '../models/Collocation';
import Deck from '../models/Deck';
import User, { UserRole } from '../models/User';
import { generateTTSUrl } from '../lib/tts';
import cache from '../utils/cache';

interface CrawlerJobStats {
  startTime: Date;
  endTime?: Date;
  totalFetched: number;
  totalSaved: number;
  totalSkipped: number;
  errors: string[];
  status: 'running' | 'completed' | 'failed';
}

class CollocationCrawlerJob {
  private crawler: OxfordCrawlerService;
  private isRunning: boolean = false;
  private lastJobStats: CrawlerJobStats | null = null;
  private systemUser: any;

  constructor() {
    this.crawler = new OxfordCrawlerService();
  }

  /**
   * Initialize the crawler job
   */
  async initialize(): Promise<void> {
    try {
      await this.crawler.initialize();
      
      // Find system user
      this.systemUser = await User.findOne({
        email: 'system@banh-chung.com',
        role: UserRole.SUPER_ADMIN
      });

      if (!this.systemUser) {
        throw new Error('System user not found. Please run collocation import script first.');
      }

      console.log('Collocation Crawler Job initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Collocation Crawler Job:', error);
      throw error;
    }
  }

  /**
   * Start the weekly cron job
   */
  startWeeklyJob(): void {
    // Run every Sunday at 2:00 AM
    cron.schedule('0 2 * * 0', async () => {
      console.log('Starting weekly collocation crawling job...');
      await this.runCrawlerJob();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    console.log('Weekly collocation crawler job scheduled (Sundays at 2:00 AM UTC)');
  }

  /**
   * Run the crawler job manually
   */
  async runCrawlerJob(targetCount: number = 50): Promise<CrawlerJobStats> {
    if (this.isRunning) {
      throw new Error('Crawler job is already running');
    }

    this.isRunning = true;
    const jobStats: CrawlerJobStats = {
      startTime: new Date(),
      totalFetched: 0,
      totalSaved: 0,
      totalSkipped: 0,
      errors: [],
      status: 'running'
    };

    try {
      console.log(`Starting collocation crawling job with target count: ${targetCount}`);

      // Crawl new collocations
      const newCollocations = await this.crawler.crawlCollocations(targetCount);
      jobStats.totalFetched = newCollocations.length;

      if (newCollocations.length === 0) {
        console.log('No new collocations found');
        jobStats.status = 'completed';
        jobStats.endTime = new Date();
        this.lastJobStats = jobStats;
        this.isRunning = false;
        return jobStats;
      }

      // Process and save collocations
      const saveResults = await this.saveCollocations(newCollocations);
      jobStats.totalSaved = saveResults.saved;
      jobStats.totalSkipped = saveResults.skipped;
      jobStats.errors = saveResults.errors;

      // Invalidate cache after successful crawling
      await cache.invalidateCollocationCache('*');

      jobStats.status = 'completed';
      jobStats.endTime = new Date();

      console.log(`Crawling job completed successfully:
        - Fetched: ${jobStats.totalFetched}
        - Saved: ${jobStats.totalSaved}
        - Skipped: ${jobStats.totalSkipped}
        - Errors: ${jobStats.errors.length}`);

    } catch (error) {
      console.error('Crawler job failed:', error);
      jobStats.status = 'failed';
      jobStats.endTime = new Date();
      jobStats.errors.push(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.isRunning = false;
      this.lastJobStats = jobStats;
    }

    return jobStats;
  }

  /**
   * Save crawled collocations to database
   */
  private async saveCollocations(collocations: any[]): Promise<{
    saved: number;
    skipped: number;
    errors: string[];
  }> {
    let saved = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const collocationData of collocations) {
      try {
        // Find or create appropriate deck
        const deck = await this.findOrCreateDeck(collocationData.category);
        
        // Check if collocation already exists
        const existingCollocation = await Collocation.findOne({
          phrase: collocationData.phrase,
          deck: deck._id
        });

        if (existingCollocation) {
          skipped++;
          continue;
        }

        // Generate TTS URL
        const audioUrl = generateTTSUrl(collocationData.phrase, "en-US");

        // Create new collocation
        const collocation = new Collocation({
          phrase: collocationData.phrase,
          meaning: collocationData.meaning,
          components: collocationData.components,
          examples: collocationData.examples,
          pronunciation: audioUrl,
          tags: collocationData.tags,
          deck: deck._id,
          user: this.systemUser._id,
          difficulty: collocationData.difficulty,
          srsData: {
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0,
            nextReview: new Date(),
          },
        });

        await collocation.save();
        saved++;

        // Log progress every 10 saves
        if (saved % 10 === 0) {
          console.log(`Saved ${saved} collocations...`);
        }

      } catch (error) {
        const errorMsg = `Failed to save collocation "${collocationData.phrase}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return { saved, skipped, errors };
  }

  /**
   * Find or create deck for category
   */
  private async findOrCreateDeck(category: string): Promise<any> {
    const categoryNames: Record<string, string> = {
      'daily-life': 'Daily Life Collocations',
      'business': 'Business Collocations',
      'academic': 'Academic Collocations',
      'technology': 'Technology Collocations',
      'travel': 'Travel Collocations',
      'health': 'Health & Medical Collocations',
      'emotions': 'Emotions & Feelings Collocations'
    };

    const deckName = categoryNames[category] || 'General Collocations';
    
    let deck = await Deck.findOne({
      name: deckName,
      user: this.systemUser._id
    });

    if (!deck) {
      deck = new Deck({
        name: deckName,
        description: `Automatically generated ${category} collocations from Oxford Dictionary`,
        user: this.systemUser._id,
        isPublic: true
      });
      await deck.save();
      console.log(`Created new deck: ${deckName}`);
    }

    return deck;
  }

  /**
   * Get job status and statistics
   */
  getJobStatus(): {
    isRunning: boolean;
    lastJob: CrawlerJobStats | null;
  } {
    return {
      isRunning: this.isRunning,
      lastJob: this.lastJobStats
    };
  }

  /**
   * Get job history (placeholder for future implementation)
   */
  async getJobHistory(): Promise<CrawlerJobStats[]> {
    // In a production environment, you might want to store job history in database
    return this.lastJobStats ? [this.lastJobStats] : [];
  }

  /**
   * Stop the crawler job (if running)
   */
  stopJob(): void {
    if (this.isRunning) {
      console.log('Stopping crawler job...');
      this.isRunning = false;
    }
  }

  /**
   * Test the crawler with a small batch
   */
  async testCrawler(count: number = 5): Promise<CrawlerJobStats> {
    console.log(`Running crawler test with ${count} collocations...`);
    return await this.runCrawlerJob(count);
  }
}

// Create singleton instance
const crawlerJob = new CollocationCrawlerJob();

export default crawlerJob;
export { CollocationCrawlerJob, CrawlerJobStats };
