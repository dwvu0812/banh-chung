import { Response } from "express";
import Collocation from "../models/Collocation";
import Deck from "../models/Deck";
import { AuthRequest } from "../middleware/authMiddleware";
import { generateTTSUrl } from "../lib/tts";
import { getPaginationParams } from "../utils/pagination";
import { createCursorPagination, CursorPaginationParams } from "../utils/cursorPagination";
import cache from "../utils/cache";

// @desc    Create a new collocation (super_admin only)
// @route   POST /api/collocations
// @access  Private (super_admin)
export const createCollocation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { phrase, meaning, components, examples, pronunciation, tags, deckId, difficulty } = req.body;
  const userId = req.user?.userId;

  try {
    const deck = await Deck.findById(deckId);
    if (!deck) {
      res.status(404).json({ msg: "Deck not found" });
      return;
    }

    // Generate TTS URL if not provided
    const audioUrl = pronunciation || generateTTSUrl(phrase, "en-US");

    const collocation = new Collocation({
      phrase,
      meaning,
      components,
      examples: examples || [],
      pronunciation: audioUrl,
      tags: tags || [],
      deck: deckId,
      user: userId,
      difficulty: difficulty || "intermediate",
    });

    await collocation.save();
    
    // Invalidate relevant caches
    await cache.invalidateCollocationCache('*');
    await cache.invalidateCollocationCache(`deck:${deckId}:*`);
    
    res.status(201).json(collocation);
  } catch (error) {
    console.error("Create collocation error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get all collocations (optimized with caching and aggregation)
// @route   GET /api/collocations
// @access  Private
export const getCollocations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const { difficulty, tags, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Create cache key based on query parameters
    const cacheKey = `list:${JSON.stringify({ page, limit, difficulty, tags, search, sortBy, sortOrder })}`;
    
    // Try to get from cache first (only for non-search queries to avoid stale search results)
    if (!search) {
      const cachedResult = await cache.getCachedCollocations(cacheKey);
      if (cachedResult) {
        res.json(cachedResult);
        return;
      }
    }

    // Build match stage for aggregation pipeline
    const matchStage: Record<string, unknown> = {};

    if (difficulty) {
      matchStage.difficulty = difficulty;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      matchStage.tags = { $in: tagArray };
    }

    if (search) {
      matchStage.$text = { $search: search as string };
    }

    // Build sort stage
    const sortStage: Record<string, 1 | -1> = {};
    sortStage[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Use aggregation pipeline for better performance
    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'decks',
          localField: 'deck',
          foreignField: '_id',
          as: 'deck',
          pipeline: [{ $project: { name: 1, description: 1 } }] // Only fetch needed fields
        }
      },
      { $unwind: '$deck' },
      {
        $project: {
          phrase: 1,
          meaning: 1,
          components: 1,
          examples: 1,
          pronunciation: 1,
          tags: 1,
          difficulty: 1,
          deck: 1,
          createdAt: 1,
          // Include text search score if searching
          ...(search && { score: { $meta: 'textScore' } })
        }
      },
      // Sort by text score if searching, otherwise by specified field
      { $sort: search ? { score: { $meta: 'textScore' }, ...sortStage } : sortStage },
      {
        $facet: {
          collocations: [
            { $skip: skip },
            { $limit: limit }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ];

    const [result] = await Collocation.aggregate(pipeline);
    const collocations = result.collocations || [];
    const total = result.totalCount[0]?.count || 0;

    const responseData = {
      collocations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache the result for non-search queries (5 minutes TTL)
    if (!search) {
      await cache.cacheCollocations(cacheKey, responseData, 300);
    }

    res.json(responseData);
  } catch (error) {
    console.error("Get collocations error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get collocations by deck (optimized with caching)
// @route   GET /api/decks/:deckId/collocations
// @access  Private
export const getCollocationsByDeck = async (req: AuthRequest, res: Response): Promise<void> => {
  const { deckId } = req.params;
  const { difficulty, limit: queryLimit } = req.query;

  try {
    // Create cache key for deck collocations
    const cacheKey = `deck:${deckId}:${difficulty || 'all'}:${queryLimit || 'all'}`;
    
    // Try to get from cache first
    const cachedResult = await cache.getCachedCollocations(cacheKey);
    if (cachedResult) {
      res.json(cachedResult);
      return;
    }

    // Validate deck exists (use lean for performance)
    const deck = await Deck.findById(deckId).lean();
    if (!deck) {
      res.status(404).json({ msg: "Deck not found" });
      return;
    }

    // Build optimized query
    const query: Record<string, unknown> = { deck: deckId };
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Use projection to only fetch needed fields for better performance
    const projection: any = {
      phrase: 1,
      meaning: 1,
      components: 1,
      examples: 1,
      pronunciation: 1,
      tags: 1,
      difficulty: 1,
      createdAt: 1,
      'srsData.nextReview': 1
    };

    let queryBuilder = Collocation.find(query, projection)
      .sort({ createdAt: -1 })
      .lean(); // Use lean for better performance

    // Apply limit if specified
    if (queryLimit) {
      queryBuilder = queryBuilder.limit(parseInt(queryLimit as string));
    }

    const collocations = await queryBuilder;
    
    const responseData = {
      collocations,
      deck: {
        _id: deck._id,
        name: deck.name,
        description: deck.description
      },
      total: collocations.length
    };

    // Cache the result (10 minutes TTL for deck-specific data)
    await cache.cacheCollocations(cacheKey, responseData, 600);
    
    res.json(responseData);
  } catch (error) {
    console.error("Get collocations by deck error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get single collocation
// @route   GET /api/collocations/:id
// @access  Private
export const getCollocation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const collocation = await Collocation.findById(id)
      .populate("deck", "name description")
      .populate("user", "username email");

    if (!collocation) {
      res.status(404).json({ msg: "Collocation not found" });
      return;
    }

    res.json(collocation);
  } catch (error) {
    console.error("Get collocation error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Update collocation (super_admin only)
// @route   PUT /api/collocations/:id
// @access  Private (super_admin)
export const updateCollocation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { phrase, meaning, components, examples, pronunciation, tags, difficulty } = req.body;

  try {
    const collocation = await Collocation.findById(id);

    if (!collocation) {
      res.status(404).json({ msg: "Collocation not found" });
      return;
    }

    if (phrase) collocation.phrase = phrase;
    if (meaning) collocation.meaning = meaning;
    if (components) collocation.components = components;
    if (examples) collocation.examples = examples;
    if (pronunciation) collocation.pronunciation = pronunciation;
    if (tags) collocation.tags = tags;
    if (difficulty) collocation.difficulty = difficulty;

    const updatedCollocation = await collocation.save();
    
    // Invalidate relevant caches
    await cache.invalidateCollocationCache('*');
    await cache.invalidateCollocationCache(`deck:${collocation.deck}:*`);
    
    res.json(updatedCollocation);
  } catch (error) {
    console.error("Update collocation error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Delete collocation (super_admin only)
// @route   DELETE /api/collocations/:id
// @access  Private (super_admin)
export const deleteCollocation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const collocation = await Collocation.findById(id);

    if (!collocation) {
      res.status(404).json({ msg: "Collocation not found" });
      return;
    }

    const deckId = collocation.deck;
    await collocation.deleteOne();
    
    // Invalidate relevant caches
    await cache.invalidateCollocationCache('*');
    await cache.invalidateCollocationCache(`deck:${deckId}:*`);
    
    res.json({ msg: "Collocation removed" });
  } catch (error) {
    console.error("Delete collocation error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Generate audio pronunciation for a collocation
// @route   POST /api/collocations/:id/audio
// @access  Private (super_admin)
export const generateAudio = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { lang } = req.body;

  try {
    const collocation = await Collocation.findById(id);

    if (!collocation) {
      res.status(404).json({ msg: "Collocation not found" });
      return;
    }

    // Note: Now using Web Speech API on frontend, no need for external TTS URLs
    const audioUrl = generateTTSUrl(collocation.phrase, lang || "en-US");
    collocation.pronunciation = audioUrl; // Will be null, indicating to use Web Speech API

    const updatedCollocation = await collocation.save();
    res.json({ audioUrl, collocation: updatedCollocation });
  } catch (error) {
    console.error("Generate audio error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get collocation statistics (cached aggregation)
// @route   GET /api/collocations/stats
// @access  Private
export const getCollocationStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const cacheKey = 'stats:global';

    // Try to get from cache first (15 minutes TTL for stats)
    const cachedStats = await cache.getCachedCollocations(cacheKey);
    if (cachedStats) {
      res.json(cachedStats);
      return;
    }

    // Use aggregation pipeline for efficient statistics calculation
    const statsAggregation = await Collocation.aggregate([
      {
        $facet: {
          // Overall statistics
          overall: [
            {
              $group: {
                _id: null,
                totalCollocations: { $sum: 1 },
                avgComponentsPerCollocation: { $avg: { $size: '$components' } },
                avgExamplesPerCollocation: { $avg: { $size: '$examples' } }
              }
            }
          ],
          // Statistics by difficulty
          byDifficulty: [
            {
              $group: {
                _id: '$difficulty',
                count: { $sum: 1 },
                avgComponents: { $avg: { $size: '$components' } }
              }
            },
            { $sort: { _id: 1 } }
          ],
          // Statistics by tags (top 10)
          byTags: [
            { $unwind: '$tags' },
            {
              $group: {
                _id: '$tags',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          // Recent additions
          recentStats: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
              }
            },
            {
              $group: {
                _id: null,
                recentCount: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const stats = statsAggregation[0];

    const responseData = {
      overall: stats.overall[0] || { totalCollocations: 0, avgComponentsPerCollocation: 0, avgExamplesPerCollocation: 0 },
      byDifficulty: stats.byDifficulty || [],
      topTags: stats.byTags || [],
      recentAdditions: stats.recentStats[0]?.recentCount || 0,
      lastUpdated: new Date()
    };

    // Cache the stats (15 minutes TTL)
    await cache.cacheCollocations(cacheKey, responseData, 900);

    res.json(responseData);
  } catch (error) {
    console.error("Get collocation stats error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get collocations with cursor pagination (optimized)
// @route   GET /api/collocations/cursor
// @access  Private
export const getCollocationsCursor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { difficulty, tags, search } = req.query;

    // Create cache key for cursor pagination
    const cacheKey = `cursor:${JSON.stringify({ difficulty, tags, search, cursor: req.query.cursor, limit: req.query.limit })}`;
    
    // Try to get from cache first (only for non-search queries)
    if (!search) {
      const cachedResult = await cache.getCachedCollocations(cacheKey);
      if (cachedResult) {
        res.json(cachedResult);
        return;
      }
    }

    // Initialize cursor pagination
    const cursorPagination = createCursorPagination({
      defaultLimit: 20,
      maxLimit: 50,
      defaultSortField: 'createdAt',
      defaultSortOrder: 'desc'
    });

    const params = cursorPagination.parseParams(req.query);

    // Build base query
    let baseQuery = Collocation.find();
    
    if (difficulty) {
      baseQuery = baseQuery.where('difficulty').equals(difficulty);
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      baseQuery = baseQuery.where('tags').in(tagArray);
    }

    if (search) {
      baseQuery = baseQuery.where({ $text: { $search: search as string } });
    }

    // Select only necessary fields for better performance
    baseQuery = baseQuery.select('phrase meaning components examples pronunciation tags difficulty createdAt deck')
      .populate('deck', 'name description');

    // Apply cursor pagination
    const result = await cursorPagination.paginate(baseQuery, params);

    // Cache the result for non-search queries (5 minutes TTL)
    if (!search) {
      await cache.cacheCollocations(cacheKey, result, 300);
    }

    res.json(result);
  } catch (error) {
    console.error("Get collocations cursor error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get collocations for review (SRS optimized)
// @route   GET /api/collocations/review
// @access  Private
export const getCollocationsForReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { limit = 20 } = req.query;

    // Optimized query for SRS review using compound index
    const reviewCollocations = await Collocation.find({
      user: userId,
      'srsData.nextReview': { $lte: new Date() }
    })
    .select('phrase meaning components examples pronunciation tags difficulty srsData deck')
    .populate('deck', 'name')
    .sort({ 'srsData.nextReview': 1 }) // Oldest due first
    .limit(parseInt(limit as string))
    .lean();

    res.json({
      collocations: reviewCollocations,
      count: reviewCollocations.length
    });
  } catch (error) {
    console.error("Get collocations for review error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

