import axios, { AxiosResponse } from 'axios';
import { ICollocation, ICollocationComponent, CollocationDifficulty } from '../models/Collocation';
import Deck from '../models/Deck';
import User, { UserRole } from '../models/User';
import { generateTTSUrl } from '../lib/tts';

// Oxford Dictionary API configuration
interface OxfordConfig {
  appId: string;
  appKey: string;
  baseUrl: string;
}

interface OxfordCollocationEntry {
  id: string;
  word: string;
  lexicalEntries: Array<{
    entries: Array<{
      senses: Array<{
        definitions?: string[];
        examples?: Array<{
          text: string;
        }>;
        subsenses?: Array<{
          definitions?: string[];
          examples?: Array<{
            text: string;
          }>;
        }>;
      }>;
    }>;
  }>;
}

interface CollocationData {
  phrase: string;
  meaning: string;
  components: ICollocationComponent[];
  examples: string[];
  tags: string[];
  difficulty: CollocationDifficulty;
  category: string;
}

export class OxfordCrawlerService {
  private config: OxfordConfig;
  private systemUser: any;
  private rateLimitDelay: number = 1000; // 1 second between requests

  constructor() {
    this.config = {
      appId: process.env.OXFORD_APP_ID || '',
      appKey: process.env.OXFORD_APP_KEY || '',
      baseUrl: 'https://od-api.oxforddictionaries.com/api/v2'
    };

    if (!this.config.appId || !this.config.appKey) {
      console.warn('Oxford Dictionary API credentials not configured. Using fallback data source.');
    }
  }

  /**
   * Initialize the crawler by finding or creating the system user
   */
  async initialize(): Promise<void> {
    try {
      this.systemUser = await User.findOne({
        email: 'system@banh-chung.com',
        role: UserRole.SUPER_ADMIN
      });

      if (!this.systemUser) {
        throw new Error('System user not found. Please run collocation import script first.');
      }

      console.log('Oxford Crawler initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Oxford Crawler:', error);
      throw error;
    }
  }

  /**
   * Crawl collocations from Oxford Dictionary API
   */
  async crawlCollocations(targetCount: number = 50): Promise<CollocationData[]> {
    if (!this.config.appId || !this.config.appKey) {
      console.log('Using fallback collocation generation...');
      return this.generateFallbackCollocations(targetCount);
    }

    const collocations: CollocationData[] = [];
    const searchTerms = this.getSearchTerms();

    try {
      for (const term of searchTerms) {
        if (collocations.length >= targetCount) break;

        try {
          await this.delay(this.rateLimitDelay);
          const termCollocations = await this.fetchCollocationsByTerm(term);
          collocations.push(...termCollocations);
          
          console.log(`Fetched ${termCollocations.length} collocations for term: ${term}`);
        } catch (error) {
          console.error(`Error fetching collocations for term ${term}:`, error);
          continue;
        }
      }

      console.log(`Successfully crawled ${collocations.length} collocations from Oxford API`);
      return collocations.slice(0, targetCount);
    } catch (error) {
      console.error('Error in crawlCollocations:', error);
      return this.generateFallbackCollocations(targetCount);
    }
  }

  /**
   * Fetch collocations for a specific search term
   */
  private async fetchCollocationsByTerm(searchTerm: string): Promise<CollocationData[]> {
    try {
      const response: AxiosResponse<OxfordCollocationEntry> = await axios.get(
        `${this.config.baseUrl}/entries/en-gb/${searchTerm}`,
        {
          headers: {
            'app_id': this.config.appId,
            'app_key': this.config.appKey,
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      return this.parseOxfordResponse(response.data, searchTerm);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log(`No entries found for term: ${searchTerm}`);
        return [];
      }
      
      if (error.response?.status === 429) {
        console.log('Rate limit exceeded, increasing delay...');
        this.rateLimitDelay *= 2;
        await this.delay(this.rateLimitDelay);
        return [];
      }

      throw error;
    }
  }

  /**
   * Parse Oxford Dictionary API response into collocation data
   */
  private parseOxfordResponse(data: OxfordCollocationEntry, searchTerm: string): CollocationData[] {
    const collocations: CollocationData[] = [];

    try {
      for (const lexicalEntry of data.lexicalEntries) {
        for (const entry of lexicalEntry.entries) {
          for (const sense of entry.senses) {
            // Extract main sense collocations
            const mainCollocations = this.extractCollocationsFromSense(sense, searchTerm);
            collocations.push(...mainCollocations);

            // Extract subsense collocations
            if (sense.subsenses) {
              for (const subsense of sense.subsenses) {
                const subCollocations = this.extractCollocationsFromSense(subsense, searchTerm);
                collocations.push(...subCollocations);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing Oxford response:', error);
    }

    return collocations;
  }

  /**
   * Extract collocations from a sense object
   */
  private extractCollocationsFromSense(sense: any, searchTerm: string): CollocationData[] {
    const collocations: CollocationData[] = [];

    if (!sense.examples) return collocations;

    for (const example of sense.examples) {
      const collocationPhrases = this.extractCollocationPhrases(example.text, searchTerm);
      
      for (const phrase of collocationPhrases) {
        const collocation = this.createCollocationData(
          phrase,
          sense.definitions?.[0] || `Collocation with ${searchTerm}`,
          [example.text],
          searchTerm
        );
        
        if (collocation) {
          collocations.push(collocation);
        }
      }
    }

    return collocations;
  }

  /**
   * Extract collocation phrases from example text
   */
  private extractCollocationPhrases(text: string, searchTerm: string): string[] {
    const phrases: string[] = [];
    const words = text.toLowerCase().split(/\s+/);
    const termIndex = words.indexOf(searchTerm.toLowerCase());

    if (termIndex === -1) return phrases;

    // Extract 2-3 word combinations around the search term
    for (let i = Math.max(0, termIndex - 2); i <= Math.min(words.length - 2, termIndex + 1); i++) {
      if (i !== termIndex) {
        // Two-word combinations
        const twoWordPhrase = i < termIndex 
          ? `${words[i]} ${words[termIndex]}`
          : `${words[termIndex]} ${words[i]}`;
        
        if (this.isValidCollocation(twoWordPhrase)) {
          phrases.push(twoWordPhrase);
        }

        // Three-word combinations
        if (i + 2 < words.length && (i < termIndex - 1 || i > termIndex)) {
          const threeWordPhrase = i < termIndex
            ? `${words[i]} ${words[i + 1]} ${words[termIndex]}`
            : `${words[termIndex]} ${words[i]} ${words[i + 1]}`;
          
          if (this.isValidCollocation(threeWordPhrase)) {
            phrases.push(threeWordPhrase);
          }
        }
      }
    }

    return [...new Set(phrases)]; // Remove duplicates
  }

  /**
   * Create collocation data object
   */
  private createCollocationData(
    phrase: string,
    meaning: string,
    examples: string[],
    searchTerm: string
  ): CollocationData | null {
    if (!this.isValidCollocation(phrase)) return null;

    const components = this.parseComponents(phrase);
    const category = this.categorizeCollocation(phrase, searchTerm);
    const difficulty = this.assessDifficulty(phrase, components);

    return {
      phrase: phrase.toLowerCase(),
      meaning: this.translateToVietnamese(meaning),
      components,
      examples: examples.slice(0, 2), // Limit to 2 examples
      tags: this.generateTags(phrase, category),
      difficulty,
      category
    };
  }

  /**
   * Validate if a phrase is a proper collocation
   */
  private isValidCollocation(phrase: string): boolean {
    const words = phrase.trim().split(/\s+/);
    
    // Must be 2-4 words
    if (words.length < 2 || words.length > 4) return false;
    
    // Must contain at least one content word (not just function words)
    const functionWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with'];
    const contentWords = words.filter(word => !functionWords.includes(word.toLowerCase()));
    
    return contentWords.length >= 2;
  }

  /**
   * Parse phrase into components
   */
  private parseComponents(phrase: string): ICollocationComponent[] {
    const words = phrase.split(/\s+/);
    return words.map(word => ({
      word: word.toLowerCase(),
      meaning: this.translateToVietnamese(word),
      partOfSpeech: this.guessPartOfSpeech(word)
    }));
  }

  /**
   * Categorize collocation based on context
   */
  private categorizeCollocation(phrase: string, searchTerm: string): string {
    const businessTerms = ['business', 'company', 'market', 'profit', 'meeting', 'deal', 'contract'];
    const dailyTerms = ['home', 'family', 'food', 'time', 'day', 'life', 'friend'];
    const academicTerms = ['study', 'research', 'knowledge', 'learn', 'education', 'book'];
    const technologyTerms = ['computer', 'internet', 'software', 'digital', 'online', 'system'];

    const lowerPhrase = phrase.toLowerCase();
    
    if (businessTerms.some(term => lowerPhrase.includes(term))) return 'business';
    if (technologyTerms.some(term => lowerPhrase.includes(term))) return 'technology';
    if (academicTerms.some(term => lowerPhrase.includes(term))) return 'academic';
    
    return 'daily-life'; // Default category
  }

  /**
   * Assess difficulty level of collocation
   */
  private assessDifficulty(phrase: string, components: ICollocationComponent[]): CollocationDifficulty {
    const commonWords = ['make', 'take', 'get', 'give', 'go', 'come', 'see', 'know', 'think', 'say'];
    const words = phrase.split(/\s+/);
    
    const hasCommonWords = words.some(word => commonWords.includes(word.toLowerCase()));
    const wordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    if (hasCommonWords && wordLength <= 5) return CollocationDifficulty.BEGINNER;
    if (wordLength <= 7) return CollocationDifficulty.INTERMEDIATE;
    return CollocationDifficulty.ADVANCED;
  }

  /**
   * Generate tags for collocation
   */
  private generateTags(phrase: string, category: string): string[] {
    const words = phrase.split(/\s+/);
    const tags = [category, ...words.slice(0, 2)]; // Category + first 2 words
    return [...new Set(tags.map(tag => tag.toLowerCase()))];
  }

  /**
   * Simple Vietnamese translation (placeholder - in production, use proper translation service)
   */
  private translateToVietnamese(text: string): string {
    const translations: Record<string, string> = {
      'make': 'làm',
      'take': 'lấy',
      'get': 'nhận',
      'give': 'đưa',
      'decision': 'quyết định',
      'time': 'thời gian',
      'money': 'tiền',
      'business': 'kinh doanh',
      'meeting': 'cuộc họp',
      'agreement': 'thỏa thuận'
    };

    return translations[text.toLowerCase()] || text;
  }

  /**
   * Guess part of speech (simple heuristic)
   */
  private guessPartOfSpeech(word: string): string {
    const verbs = ['make', 'take', 'get', 'give', 'go', 'come', 'see', 'know'];
    const nouns = ['decision', 'time', 'money', 'business', 'meeting', 'agreement'];
    const adjectives = ['good', 'bad', 'big', 'small', 'important', 'difficult'];

    const lowerWord = word.toLowerCase();
    
    if (verbs.includes(lowerWord)) return 'verb';
    if (nouns.includes(lowerWord)) return 'noun';
    if (adjectives.includes(lowerWord)) return 'adjective';
    
    return 'unknown';
  }

  /**
   * Get search terms for crawling
   */
  private getSearchTerms(): string[] {
    return [
      'make', 'take', 'get', 'give', 'go', 'come', 'see', 'know', 'think', 'say',
      'business', 'meeting', 'decision', 'agreement', 'contract', 'profit',
      'computer', 'internet', 'software', 'system', 'technology', 'digital',
      'study', 'research', 'education', 'knowledge', 'learning', 'academic',
      'family', 'friend', 'home', 'life', 'time', 'day', 'food', 'health'
    ];
  }

  /**
   * Fallback method when Oxford API is not available
   */
  private generateFallbackCollocations(count: number): CollocationData[] {
    const fallbackCollocations = [
      {
        phrase: 'conduct research',
        meaning: 'tiến hành nghiên cứu',
        components: [
          { word: 'conduct', meaning: 'tiến hành', partOfSpeech: 'verb' },
          { word: 'research', meaning: 'nghiên cứu', partOfSpeech: 'noun' }
        ],
        examples: ['Scientists conduct research to find new treatments.'],
        tags: ['academic', 'conduct', 'research'],
        difficulty: CollocationDifficulty.INTERMEDIATE,
        category: 'academic'
      },
      {
        phrase: 'close a deal',
        meaning: 'chốt thương vụ',
        components: [
          { word: 'close', meaning: 'đóng', partOfSpeech: 'verb' },
          { word: 'deal', meaning: 'thương vụ', partOfSpeech: 'noun' }
        ],
        examples: ['The sales team worked hard to close the deal.'],
        tags: ['business', 'close', 'deal'],
        difficulty: CollocationDifficulty.INTERMEDIATE,
        category: 'business'
      },
      {
        phrase: 'update software',
        meaning: 'cập nhật phần mềm',
        components: [
          { word: 'update', meaning: 'cập nhật', partOfSpeech: 'verb' },
          { word: 'software', meaning: 'phần mềm', partOfSpeech: 'noun' }
        ],
        examples: ['Remember to update your software regularly.'],
        tags: ['technology', 'update', 'software'],
        difficulty: CollocationDifficulty.BEGINNER,
        category: 'technology'
      }
    ];

    return fallbackCollocations.slice(0, count);
  }

  /**
   * Utility method to add delay between API requests
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default OxfordCrawlerService;
