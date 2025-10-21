# Equinox - AI-Powered Stock Market Platform

![Equinox Logo](/public/logo.svg)

Equinox is an advanced stock market platform that combines real-time market data, AI-powered analysis, and comprehensive portfolio management tools to empower investors with intelligent insights and efficient trading capabilities.


## 🌟 Features

### 📊 Market Analysis
- **Real-time Dashboard**: Comprehensive market overview with heatmaps and key indicators
- **Stock Details**: In-depth analysis with technical indicators, company profiles, and financials
- **TradingView Integration**: Professional charting tools embedded throughout the platform

### 📈 Portfolio Management
- **Watchlist**: Save and monitor your favorite stocks
- **Performance Tracking**: Monitor your investments with detailed analytics
- **Cross-device Sync**: Access your portfolio from anywhere

### 🤖 AI Stock Market Consultant
- **Intelligent Chat Assistant**: Powered by Google Gemini and LangGraph
- **Custom Tools**: Stock analysis, market insights, portfolio guidance, risk assessment
- **Data Integration**: Access to user watchlist, real-time quotes, and market news
- **Web Scraping**: Advanced data gathering from trusted financial sources

### 🔐 User Authentication
- Secure sign-up and sign-in flows
- Profile management
- Session handling

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- MongoDB database
- API keys for external services

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sriram-dev-9/equinox.git
   cd equinox
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env.local` file:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # Authentication (Better Auth)
   BETTER_AUTH_SECRET=your_auth_secret
   BETTER_AUTH_URL=http://localhost:3000

   # API Keys
   FINNHUB_API_KEY=your_finnhub_api_key
   GOOGLE_API_KEY=your_google_gemini_api_key
   FIRECRAWL_API_KEY=your_firecrawl_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing Database Connection

```bash
npm run test:db
```

## 🧩 Project Structure

```
equinox/
├── app/                     # Next.js application
│   ├── (auth)/              # Authentication pages
│   ├── (root)/              # Root layout
│   ├── api/                 # API routes
│   │   └── chat/           # Chat API
│   ├── dashboard/          # Main app pages
│   └── stocks/             # Stock details pages
├── components/              # Reusable UI components
├── database/                # MongoDB models and connection
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and modules
│   ├── actions/            # Server actions
│   ├── agent/              # AI agent configuration
│   └── better-auth/        # Authentication setup
└── public/                  # Static assets
```

## 💻 Technologies

- **Frontend**: React, Next.js 15, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Database**: MongoDB with Mongoose
- **Authentication**: Better Auth
- **AI**: Google Gemini 2.0, LangGraph
- **Data Sources**: Finnhub API, TradingView Widgets
- **Web Scraping**: Firecrawl

## 🧠 AI Features

The platform includes a sophisticated AI assistant for stock market analysis:

- **Real-time Analysis**: Get instant insights on any stock
- **Personalized Recommendations**: Based on your watchlist and market conditions
- **News Interpretation**: AI-powered analysis of market news
- **Risk Assessment**: Evaluate potential investments

For detailed information about the chat feature, see [CHAT_FEATURE.md](./CHAT_FEATURE.md).

## 📚 API Integration

### Finnhub API
Used for fetching real-time stock data, company profiles, and market news.

### TradingView Widgets
Embedded throughout the application for professional charting and market visualization.

### Google Gemini API
Powers the AI assistant with advanced natural language processing capabilities.

## 🛠️ Development

### Building for Production

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## � Deployment

For detailed deployment instructions (especially for Vercel), see [DEPLOYMENT.md](./DEPLOYMENT.md).

**Quick Deployment Checklist:**
1. Set up Inngest Cloud account and get API keys
2. Configure all environment variables in Vercel
3. **Critical**: Set `BETTER_AUTH_URL` to your production domain
4. Deploy and verify authentication works

## �📋 Future Roadmap

- [ ] Portfolio simulation and backtesting
- [ ] Advanced notification system for price alerts
- [ ] Mobile app version
- [ ] Social features for sharing insights
- [ ] Integration with brokerage APIs for direct trading

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- TradingView for their excellent financial widgets
- Finnhub for their comprehensive stock market API
- All open-source libraries used in this project

---

Built with ❤️ by [HackCrew](https://github.com/sriram-dev-9)
