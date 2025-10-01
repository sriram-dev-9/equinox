import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import FirecrawlApp from '@mendable/firecrawl-js';
import { getWatchlistSymbolsByEmail } from '@/lib/actions/watchlist.actions';
import { getStockProfile, getExtendedNews, getStockQuote } from '@/lib/actions/finnhub.actions';
import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';

// Tool to get user's watchlist
export const getUserWatchlistTool = tool(
  async ({ userId, email }: { userId?: string; email?: string }) => {
    try {
      if (email) {
        const symbols = await getWatchlistSymbolsByEmail(email);
        return {
          success: true,
          symbols,
          message: `Found ${symbols.length} symbols in watchlist: ${symbols.join(', ')}`
        };
      } else if (userId) {
        // Get watchlist by userId directly
        await connectToDatabase();
        const watchlistItems = await Watchlist.find({ userId }).sort({ addedAt: -1 }).lean();
        
        const stocks = watchlistItems.map((item) => ({
          userId: String(item.userId),
          symbol: String(item.symbol),
          company: String(item.company || ''),
          addedAt: item.addedAt
        }));
        
        return {
          success: true,
          watchlist: stocks,
          message: `Retrieved ${stocks.length} items from user's watchlist`
        };
      } else {
        return {
          success: false,
          error: 'No user identification provided',
          message: 'Failed to retrieve watchlist - no user ID or email provided'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve watchlist'
      };
    }
  },
  {
    name: 'get_user_watchlist',
    description: 'Get the current user\'s stock watchlist. Requires userId or email to identify the user.',
    schema: z.object({
      userId: z.string().optional().describe('User ID to get watchlist for'),
      email: z.string().optional().describe('User email to get watchlist for (alternative to userId)')
    })
  }
);

// Tool to get stock profile information
export const getStockProfileTool = tool(
  async ({ symbol }: { symbol: string }) => {
    try {
      const profile = await getStockProfile(symbol.toUpperCase());
      if (profile) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profileData = profile as any;
        return {
          success: true,
          profile,
          company: profileData.name || 'N/A',
          industry: profileData.finnhubIndustry || profileData.industry || 'N/A',
          marketCap: profileData.marketCapitalization || 'N/A',
          country: profileData.country || 'N/A',
          currency: profileData.currency || 'N/A',
          exchange: profileData.exchange || 'N/A',
          ipo: profileData.ipo || 'N/A',
          logo: profileData.logo || '',
          weburl: profileData.weburl || '',
          message: `Retrieved detailed profile for ${symbol}: ${profileData.name || symbol}`
        };
      } else {
        return {
          success: false,
          error: 'No profile data available',
          message: `No profile found for ${symbol} - symbol may be invalid or not supported`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to get profile for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
  {
    name: 'get_stock_profile',
    description: 'Get detailed company profile information for a stock symbol including company name, industry, market cap, etc.',
    schema: z.object({
      symbol: z.string().describe('Stock symbol (e.g., AAPL, TSLA)')
    })
  }
);

// Tool to get stock quote/price data
export const getStockQuoteTool = tool(
  async ({ symbol }: { symbol: string }) => {
    try {
      const quote = await getStockQuote(symbol.toUpperCase());
      if (quote) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const quoteData = quote as any;
        const current = quoteData.c || 0;
        const change = quoteData.d || 0;
        const changePercent = quoteData.dp || 0;
        const high = quoteData.h || 0;
        const low = quoteData.l || 0;
        const open = quoteData.o || 0;
        const previousClose = quoteData.pc || 0;
        
        return {
          success: true,
          quote,
          symbol: symbol.toUpperCase(),
          currentPrice: current,
          change: change,
          changePercent: changePercent,
          high: high,
          low: low,
          open: open,
          previousClose: previousClose,
          message: `${symbol.toUpperCase()}: $${current} (${change >= 0 ? '+' : ''}${change} / ${changePercent >= 0 ? '+' : ''}${changePercent}%)`
        };
      } else {
        return {
          success: false,
          error: 'No quote data available',
          message: `No quote found for ${symbol} - symbol may be invalid or market closed`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to get quote for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
  {
    name: 'get_stock_quote',
    description: 'Get current stock price, change, and other quote data for a stock symbol',
    schema: z.object({
      symbol: z.string().describe('Stock symbol (e.g., AAPL, TSLA)')
    })
  }
);

// Tool to get market news with extended lookback period
export const getMarketNewsTool = tool(
  async ({ symbols, days = 30 }: { symbols?: string[]; days?: number }) => {
    try {
      // Get extended news for better trend analysis (default 30 days)
      const extendedNews = await getExtendedNews(symbols, days);
      return {
        success: true,
        news: extendedNews,
        message: `Retrieved ${extendedNews.length} news articles from last ${days} days${symbols ? ` for symbols: ${symbols.join(', ')}` : ''}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve market news'
      };
    }
  },
  {
    name: 'get_market_news',
    description: 'Get market news for trend analysis. Gets news from the last 30 days by default for comprehensive analysis.',
    schema: z.object({
      symbols: z.array(z.string()).optional().describe('Array of stock symbols to get news for'),
      days: z.number().optional().describe('Number of days to look back for news (default: 30, max: 60)')
    })
  }
);

// Tool to scrape web content using Firecrawl
export const webScrapeTool = tool(
  async ({ url }: { url: string }) => {
    try {
      const apiKey = process.env.FIRECRAWL_API_KEY;
      if (!apiKey) {
        throw new Error('Firecrawl API key not configured');
      }

      const app = new FirecrawlApp({ apiKey });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scrapeResult = await app.scrape(url) as any;

      if (!scrapeResult?.success) {
        throw new Error('Failed to scrape URL');
      }

      const content = scrapeResult.data?.markdown || scrapeResult.data?.html || scrapeResult.markdown || scrapeResult.html || '';

      return {
        success: true,
        content: content.slice(0, 5000), // Limit content length
        url,
        message: `Successfully scraped content from ${url}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to scrape content from ${url}`
      };
    }
  },
  {
    name: 'web_scrape',
    description: 'Scrape web content from URLs using Firecrawl. Useful for getting financial news, analysis, and market data from external sources.',
    schema: z.object({
      url: z.string().describe('URL to scrape content from')
    })
  }
);

// Tool to search financial websites for analysis
export const financialAnalysisTool = tool(
  async ({ query, symbol }: { query: string; symbol?: string }) => {
    try {
      const apiKey = process.env.FIRECRAWL_API_KEY;
      if (!apiKey) {
        return {
          success: true,
          results: [],
          error: 'Firecrawl API key not configured',
          message: `External analysis unavailable - using other data sources for ${symbol || query}`
        };
      }

      const targetSymbol = symbol || query.toUpperCase();
      // Target specific analysis pages for better data
      const searchUrls = [
        `https://finance.yahoo.com/quote/${targetSymbol}/analysis`,
        `https://finance.yahoo.com/quote/${targetSymbol}`,
        `https://www.marketwatch.com/investing/stock/${targetSymbol}`,
        `https://seekingalpha.com/symbol/${targetSymbol}`
      ];

      const results = [];
      const app = new FirecrawlApp({ apiKey });
      
      // Try multiple sources, continue even if some fail
      for (const url of searchUrls.slice(0, 3)) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const scrapeResult = await app.scrape(url) as any;

          if (scrapeResult?.success && (scrapeResult.data?.markdown || scrapeResult.markdown)) {
            const content = scrapeResult.data?.markdown || scrapeResult.markdown || '';
            // Extract relevant financial analysis content
            const relevantContent = content
              .split('\n')
              .filter((line: string) => 
                line.toLowerCase().includes('analyst') ||
                line.toLowerCase().includes('price target') ||
                line.toLowerCase().includes('recommendation') ||
                line.toLowerCase().includes('rating') ||
                line.toLowerCase().includes('earnings') ||
                line.toLowerCase().includes('revenue') ||
                line.includes('%') ||
                line.includes('$')
              )
              .slice(0, 15)
              .join('\n');

            if (relevantContent.length > 50) {
              results.push({
                url,
                content: relevantContent,
                source: new URL(url).hostname
              });
            }
          }
        } catch (error) {
          console.error(`Failed to scrape ${url}:`, error);
          continue; // Try next source
        }
      }

      return {
        success: true,
        results,
        query,
        symbol: targetSymbol,
        message: results.length > 0 
          ? `Found professional analysis from ${results.length} sources for ${targetSymbol}`
          : `No external analysis found for ${targetSymbol} - using internal data sources`
      };
    } catch (error) {
      return {
        success: true, // Don't fail the whole analysis
        results: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `External analysis unavailable for ${symbol || query} - using other data sources`
      };
    }
  },
  {
    name: 'financial_analysis',
    description: 'Get professional financial analysis, price targets, analyst recommendations, and market insights for stocks.',
    schema: z.object({
      query: z.string().describe('Stock symbol or company name to analyze'),
      symbol: z.string().optional().describe('Specific stock symbol (e.g., TSLA, AAPL)')
    })
  }
);

export const allTools = [
  getUserWatchlistTool,
  getStockProfileTool, 
  getStockQuoteTool,
  getMarketNewsTool,
  webScrapeTool,
  financialAnalysisTool
];