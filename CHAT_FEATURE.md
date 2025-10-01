# AI Stock Market Consultant - Chat Feature

## Overview

The chat feature provides users with an intelligent AI assistant powered by Google Gemini and LangGraph. The assistant has access to user data, market information, and web scraping capabilities to provide comprehensive stock market consulting.

## Features

### 🤖 AI Assistant Capabilities
- **Stock Analysis**: Detailed analysis of individual stocks with real-time data
- **Market Insights**: Current market trends and economic indicators
- **Portfolio Guidance**: Personalized recommendations based on user's watchlist
- **Risk Assessment**: Investment risk evaluation and potential returns analysis
- **News Analysis**: Interpretation of financial news and market impact

### 🛠 Available Tools
- **User Watchlist Access**: Direct access to user's saved stocks and portfolio
- **Stock Quotes & Profiles**: Real-time stock prices and company information
- **Market News**: Latest financial news filtered by user interests
- **Web Scraping**: Firecrawl integration for additional financial analysis from trusted sources
- **Financial Analysis**: Automated scraping of financial websites (Yahoo Finance, MarketWatch, Seeking Alpha)

### 💬 Chat Interface
- **Responsive Design**: Slides in from the right side of the screen
- **Real-time Messaging**: Instant responses with loading indicators
- **Tool Usage Display**: Shows which tools were used for transparency
- **Message History**: Maintains conversation context
- **Mobile Friendly**: Optimized for all screen sizes

## Technical Implementation

### Architecture
```
Frontend (React) -> API Route (/api/chat) -> LangGraph Agent -> Gemini AI + Tools
```

### Key Components
- `ChatProvider`: Context provider for chat state management
- `ChatInterface`: Main chat UI component
- `ChatSidebar`: Sliding sidebar container
- `ChatToggleButton`: Floating action button to open/close chat

### Agent Structure (LangGraph)
- **Model**: Google Gemini 2.0 Flash Experimental with temperature 0.1 for consistent responses
- **Tools**: 6 specialized tools for accessing data and web scraping
- **State Management**: Conversation history and tool execution tracking
- **Error Handling**: Graceful error recovery and user feedback

## Setup Instructions

### 1. Environment Variables
Add these variables to your `.env.local` file:

```env
# AI Assistant
GOOGLE_API_KEY=your_google_gemini_api_key

# Web Scraping  
FIRECRAWL_API_KEY=your_firecrawl_api_key

# Stock Data (already configured)
FINNHUB_API_KEY=your_finnhub_api_key
```

### 2. API Keys Setup

#### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your environment variables as `GOOGLE_API_KEY`

#### Firecrawl API Key
1. Sign up at [Firecrawl](https://firecrawl.dev)
2. Get your API key from the dashboard
3. Add it to your environment variables as `FIRECRAWL_API_KEY`

### 3. Testing the Feature

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to any page in the app (you must be logged in)

3. Click the floating chat button in the bottom-right corner

4. Try these example queries:
   - "What's the latest news on Apple?"
   - "Analyze my watchlist"
   - "What are the current market trends?"
   - "Should I invest in Tesla right now?"

## Usage Examples

### Stock Analysis
```
User: "Tell me about Apple's current performance"
Assistant: [Uses get_stock_profile and get_stock_quote tools]
- Retrieves current AAPL price and company information
- Provides analysis based on recent performance
- May use web scraping for additional insights
```

### Watchlist Analysis  
```
User: "Analyze my watchlist"
Assistant: [Uses get_user_watchlist and get_market_news tools]
- Retrieves user's saved stocks
- Gets current quotes for each stock
- Provides portfolio-level insights and recommendations
```

### Market Research
```
User: "What's the outlook for the tech sector?"
Assistant: [Uses financial_analysis and web_scrape tools]
- Searches financial websites for tech sector analysis
- Compiles information from multiple sources
- Provides comprehensive sector overview
```

## Customization

### Adding New Tools
1. Create a new tool in `lib/agent/tools.ts`
2. Add it to the `allTools` array
3. The agent will automatically have access to the new functionality

### Modifying the System Prompt
Update the `SYSTEM_PROMPT` in `lib/agent/index.ts` to change the assistant's behavior and expertise focus.

### Styling Customization
The chat interface uses Tailwind CSS classes and can be customized by modifying the component files in the `components/` directory.

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Ensure all environment variables are properly set
   - Check that API keys are valid and have proper permissions

2. **Tool Execution Failures**
   - Check network connectivity
   - Verify database connections for watchlist access
   - Ensure Finnhub API limits aren't exceeded

3. **Chat Not Loading**
   - Check browser console for JavaScript errors
   - Verify the API route is accessible at `/api/chat`
   - Ensure user is properly authenticated

### Debug Mode
Set environment variable `NODE_ENV=development` to see detailed logging in the console.

## Security Considerations

- API keys are server-side only and never exposed to the client
- User authentication is required to access the chat feature
- Tool execution is limited to read-only operations on user data
- Web scraping is limited to trusted financial websites

## Performance

- Responses typically take 2-5 seconds depending on tool usage
- Tool execution is optimized with caching where possible
- Chat history is stored in memory and resets on page refresh
- Consider implementing persistent chat history for production use

## Future Enhancements

- [ ] Streaming responses for real-time typing effect
- [ ] Voice input/output capabilities
- [ ] Chart and graph generation
- [ ] Integration with more financial data sources
- [ ] Persistent chat history with database storage
- [ ] Custom alerts and notifications
- [ ] Multi-language support