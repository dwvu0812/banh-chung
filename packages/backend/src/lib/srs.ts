interface SRSCalculationResult {
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReview: Date;
  confidence?: number;
  difficulty?: 'easy' | 'normal' | 'hard';
}

interface SRSBatchItem {
  id: string;
  quality: number;
  repetitions: number;
  previousInterval: number;
  previousEaseFactor: number;
  lastReview?: Date;
}

interface SRSAnalytics {
  totalReviews: number;
  averageQuality: number;
  retentionRate: number;
  averageInterval: number;
  difficultyDistribution: Record<string, number>;
  streakCount: number;
  timeToReview: number;
}

// Cache for frequently calculated intervals
const intervalCache = new Map<string, SRSCalculationResult>();
const CACHE_SIZE_LIMIT = 1000;

/**
 * Enhanced SM-2 algorithm with optimizations and analytics
 * @param quality Quality of answer (0-5)
 * @param repetitions Number of previous repetitions
 * @param previousInterval Previous interval in days
 * @param previousEaseFactor Previous ease factor
 * @param options Additional options for calculation
 * @returns Enhanced SRS calculation result
 */
export function calculateSM2(
  quality: number,
  repetitions: number,
  previousInterval: number,
  previousEaseFactor: number,
  options: {
    includeAnalytics?: boolean;
    lastReview?: Date;
    userId?: string;
  } = {}
): SRSCalculationResult {
  // Input validation
  if (quality < 0 || quality > 5) {
    throw new Error('Quality must be between 0 and 5');
  }

  // Generate cache key for frequently used calculations
  const cacheKey = `${quality}-${repetitions}-${previousInterval}-${previousEaseFactor}`;
  
  // Check cache first for performance
  if (intervalCache.has(cacheKey)) {
    const cached = intervalCache.get(cacheKey)!;
    return {
      ...cached,
      nextReview: new Date(Date.now() + cached.interval * 24 * 60 * 60 * 1000),
    };
  }

  let newEaseFactor: number;
  let newInterval: number;
  let newRepetitions: number;
  let confidence: number;
  let difficulty: 'easy' | 'normal' | 'hard';

  if (quality < 3) {
    // Failed review - reset with optimized parameters
    newInterval = 1;
    newRepetitions = 0;
    // More gradual ease factor reduction for better retention
    newEaseFactor = Math.max(1.3, previousEaseFactor - (0.15 + (3 - quality) * 0.05));
    confidence = quality / 5;
    difficulty = 'hard';
  } else {
    // Successful review
    newRepetitions = repetitions + 1;
    
    if (repetitions === 0) {
      newInterval = 1;
      newEaseFactor = previousEaseFactor;
    } else if (repetitions === 1) {
      // Optimized second interval based on quality
      newInterval = quality >= 4 ? 6 : 4;
      newEaseFactor = previousEaseFactor;
    } else {
      // Standard SM-2 calculation with optimizations
      newInterval = Math.round(previousInterval * previousEaseFactor);
      
      // Enhanced ease factor calculation
      const qualityBonus = quality === 5 ? 0.15 : quality === 4 ? 0.1 : 0.05;
      newEaseFactor = previousEaseFactor + 
        (qualityBonus - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    }

    // Apply quality-based adjustments
    if (quality === 5) {
      newInterval = Math.round(newInterval * 1.1); // Bonus for perfect recall
      difficulty = 'easy';
    } else if (quality === 3) {
      newInterval = Math.round(newInterval * 0.9); // Slight penalty for hard recall
      difficulty = 'hard';
    } else {
      difficulty = 'normal';
    }

    confidence = Math.min(1, quality / 5 + (newRepetitions * 0.1));
  }

  // Ensure minimum ease factor
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  // Apply maximum interval limits for practical usage
  newInterval = Math.min(newInterval, 365); // Max 1 year
  newInterval = Math.max(newInterval, 1); // Min 1 day

  const nextReview = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000);

  const result: SRSCalculationResult = {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: Number(newEaseFactor.toFixed(2)),
    nextReview,
    confidence: Number(confidence.toFixed(2)),
    difficulty,
  };

  // Cache the result (without nextReview to avoid date issues)
  if (intervalCache.size < CACHE_SIZE_LIMIT) {
    intervalCache.set(cacheKey, {
      ...result,
      nextReview: new Date(0), // Placeholder
    });
  }

  return result;
}

/**
 * Batch process multiple SRS calculations for performance
 * @param items Array of items to calculate
 * @returns Array of calculation results
 */
export function calculateSM2Batch(items: SRSBatchItem[]): (SRSCalculationResult & { id: string })[] {
  const startTime = Date.now();
  
  const results = items.map(item => ({
    id: item.id,
    ...calculateSM2(
      item.quality,
      item.repetitions,
      item.previousInterval,
      item.previousEaseFactor,
      { lastReview: item.lastReview }
    ),
  }));

  const processingTime = Date.now() - startTime;
  console.log(`Batch processed ${items.length} SRS calculations in ${processingTime}ms`);

  return results;
}

/**
 * Calculate SRS analytics for a user's review history
 * @param reviews Array of review data
 * @returns Analytics object
 */
export function calculateSRSAnalytics(reviews: Array<{
  quality: number;
  interval: number;
  reviewTime?: number;
  createdAt: Date;
}>): SRSAnalytics {
  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageQuality: 0,
      retentionRate: 0,
      averageInterval: 0,
      difficultyDistribution: {},
      streakCount: 0,
      timeToReview: 0,
    };
  }

  const totalReviews = reviews.length;
  const averageQuality = reviews.reduce((sum, r) => sum + r.quality, 0) / totalReviews;
  const successfulReviews = reviews.filter(r => r.quality >= 3).length;
  const retentionRate = (successfulReviews / totalReviews) * 100;
  const averageInterval = reviews.reduce((sum, r) => sum + r.interval, 0) / totalReviews;

  // Calculate difficulty distribution
  const difficultyDistribution = reviews.reduce((acc, r) => {
    const difficulty = r.quality >= 4 ? 'easy' : r.quality >= 3 ? 'normal' : 'hard';
    acc[difficulty] = (acc[difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate current streak
  let streakCount = 0;
  for (let i = reviews.length - 1; i >= 0; i--) {
    if (reviews[i].quality >= 3) {
      streakCount++;
    } else {
      break;
    }
  }

  // Calculate average time to review
  const reviewTimes = reviews.filter(r => r.reviewTime).map(r => r.reviewTime!);
  const timeToReview = reviewTimes.length > 0 
    ? reviewTimes.reduce((sum, time) => sum + time, 0) / reviewTimes.length 
    : 0;

  return {
    totalReviews,
    averageQuality: Number(averageQuality.toFixed(2)),
    retentionRate: Number(retentionRate.toFixed(1)),
    averageInterval: Number(averageInterval.toFixed(1)),
    difficultyDistribution,
    streakCount,
    timeToReview: Number(timeToReview.toFixed(1)),
  };
}

/**
 * Get optimal review schedule for a set of cards
 * @param cards Array of card data with SRS information
 * @param maxReviews Maximum number of reviews to schedule
 * @returns Optimized review schedule
 */
export function getOptimalReviewSchedule(
  cards: Array<{
    id: string;
    nextReview: Date;
    easeFactor: number;
    repetitions: number;
    priority?: number;
  }>,
  maxReviews: number = 50
): Array<{ id: string; scheduledTime: Date; priority: number }> {
  const now = new Date();
  
  // Filter cards due for review
  const dueCards = cards.filter(card => card.nextReview <= now);
  
  // Sort by priority: overdue cards first, then by ease factor (harder cards first)
  const sortedCards = dueCards.sort((a, b) => {
    const aOverdue = Math.max(0, now.getTime() - a.nextReview.getTime());
    const bOverdue = Math.max(0, now.getTime() - b.nextReview.getTime());
    
    if (aOverdue !== bOverdue) {
      return bOverdue - aOverdue; // More overdue first
    }
    
    // Then by ease factor (lower = harder = higher priority)
    if (a.easeFactor !== b.easeFactor) {
      return a.easeFactor - b.easeFactor;
    }
    
    // Finally by custom priority
    return (b.priority || 0) - (a.priority || 0);
  });

  // Take only the maximum number of reviews
  const selectedCards = sortedCards.slice(0, maxReviews);
  
  return selectedCards.map((card, index) => ({
    id: card.id,
    scheduledTime: new Date(now.getTime() + index * 1000), // Spread reviews by 1 second
    priority: selectedCards.length - index, // Higher number = higher priority
  }));
}

/**
 * Clear SRS calculation cache
 */
export function clearSRSCache(): void {
  intervalCache.clear();
}

/**
 * Get SRS cache statistics
 */
export function getSRSCacheStats(): { size: number; hitRate: number } {
  // This would need to be implemented with hit/miss tracking
  return {
    size: intervalCache.size,
    hitRate: 0, // Placeholder
  };
}
