import { SerpApi, GoogleSearch } from 'google-search-results-nodejs';
import { storage } from '../storage';

/**
 * Types for SERP checking
 */
export interface SerpCheckRequest {
  threadId: number;
  query?: string;
}

export interface SerpCheckResponse {
  success: boolean;
  threadId: number;
  query: string;
  position?: number | null;
  error?: string;
}

/**
 * Service for checking Google SERP (Search Engine Results Page) positions
 */
class SerpCheckService {
  private serpApiKey: string;
  private search: any; // SerpApi search instance

  constructor() {
    this.serpApiKey = process.env.SERPAPI_KEY || '';
    if (!this.serpApiKey) {
      console.error('SERPAPI_KEY is not configured in environment variables');
    }
    this.search = new GoogleSearch(this.serpApiKey);
  }

  /**
   * Check the SERP position of a Reddit thread for a specific query
   */
  async checkSerpPosition(request: SerpCheckRequest): Promise<SerpCheckResponse> {
    try {
      console.log(`Checking SERP position for thread ID ${request.threadId} with query: ${request.query}`);
      
      // Get the thread
      const thread = await storage.getThreadById(request.threadId);
      if (!thread) {
        return {
          success: false,
          threadId: request.threadId,
          query: request.query || '',
          error: 'Thread not found'
        };
      }

      // Generate query if not provided
      const query = request.query || this.generateSearchQuery(thread);

      // Extract the domain part for checking in results
      const redditDomain = 'reddit.com';
      let threadUrl = thread.permalink;
      
      // Make sure the URL starts with reddit.com
      if (!threadUrl.includes(redditDomain)) {
        threadUrl = `${redditDomain}${threadUrl}`;
      }

      // Check position
      const position = await this.findUrlPositionInSearchResults(query, threadUrl);

      // Save result to database
      const serpResult = {
        threadId: request.threadId,
        query,
        position,
        checkedAt: new Date(),
        isRanked: position !== null
      };

      await storage.createSerpResult(serpResult);

      // Update thread with SERP rank
      await storage.updateThread(thread.id, {
        serpRank: position
      });

      return {
        success: true,
        threadId: request.threadId,
        query,
        position
      };
    } catch (error: any) {
      console.error(`Error checking SERP position for thread ID ${request.threadId}:`, error);
      return {
        success: false,
        threadId: request.threadId,
        query: request.query || '',
        error: error.message
      };
    }
  }

  /**
   * Generate a search query based on a Reddit thread's content
   */
  generateSearchQuery(thread: any): string {
    // Create a search query from the thread title
    // Remove special characters and limit to 60 chars
    let query = thread.title;
    
    // If title is short, add some relevant words from the body
    if (query.length < 30 && thread.body) {
      const bodyWords = thread.body
        .split(/[\s\n\r\t]+/)
        .filter((w: string) => w.length > 4)  // Only use words with > 4 chars
        .slice(0, 5);  // Take up to 5 words
      
      if (bodyWords.length > 0) {
        query += ' ' + bodyWords.join(' ');
      }
    }
    
    // Ensure the query is not too long
    if (query.length > 60) {
      query = query.substring(0, 60);
    }

    // Add the subreddit as additional context
    query += ` ${thread.subreddit} reddit`;
    
    return query;
  }

  /**
   * Check if a URL appears in search results for a given query
   */
  async findUrlPositionInSearchResults(query: string, url: string, maxPages = 5): Promise<number | null> {
    let position = 0;
    
    for (let page = 0; page < maxPages; page++) {
      const start = page * 10;
      const params = {
        engine: 'google',
        q: query,
        start,
        api_key: this.serpApiKey
      };
      
      try {
        console.log(`Querying SerpApi for: ${query} (page ${page+1})`);
        
        // Use promise to get results from SerpApi
        const results = await new Promise((resolve, reject) => {
          this.search.json(params, (data: any) => {
            if (data.error) {
              reject(new Error(data.error));
            } else {
              resolve(data);
            }
          });
        });
        
        // Check if organic results exist
        const organicResults = (results as any).organic_results;
        if (organicResults && Array.isArray(organicResults)) {
          for (const result of organicResults) {
            position++;
            
            if (result.link && result.link.toLowerCase().includes(url.toLowerCase())) {
              console.log(`Found match at position ${position}: ${result.link}`);
              return position;
            }
          }
        } else {
          console.warn('No organic results found in the SerpApi response');
          break;
        }
        
        // Check if there are more results
        const pagination = (results as any).pagination;
        const hasMore = pagination && pagination.next;
        
        if (!hasMore) {
          break;
        }
      } catch (error) {
        console.error(`Error in SerpApi request for query: ${query}`, error);
        throw error;
      }
    }
    
    // URL not found in the search results
    return null;
  }
}

// Create a singleton instance
export const serpCheckService = new SerpCheckService();