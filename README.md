# Reddit Affiliate Opportunity Engine 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![.NET](https://img.shields.io/badge/.NET-8.0-purple)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![React](https://img.shields.io/badge/React-18.x-blue)

A sophisticated platform that intelligently discovers and analyzes Reddit threads with high affiliate marketing potential using advanced web crawling, natural language processing, and opportunity scoring techniques.

## 🌟 Features

- **Intelligent Thread Discovery**: Automatically crawls Reddit to find threads with high affiliate marketing potential
- **Intent Analysis**: Classifies threads based on purchase intent signals in the content
- **Affiliate Program Matching**: Identifies matching products and programs for detected opportunities
- **SERP Ranking Analysis**: Checks if threads appear in Google search results to prioritize SEO-valuable threads
- **Opportunity Scoring**: Calculates composite scores to highlight the most valuable opportunities
- **Scheduled Crawling**: Automated data collection with configurable frequency
- **Beautiful Dashboard**: Intuitive React-based UI for managing and tracking opportunities

## 📋 Architecture

The application follows a hybrid architecture:

- **Frontend**: React/Vite SPA with Tailwind CSS and shadcn UI components
- **API Layer**: Express.js server handling HTTP requests and database access
- **Crawler Service**: .NET 8 backend with C# handling the core data processing pipeline
- **Database**: PostgreSQL for persistent storage with Drizzle ORM
- **Job Scheduling**: node-cron for automated tasks

![Architecture Diagram](docs/architecture-diagram.png)

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- TanStack Query
- Tailwind CSS
- shadcn UI
- Zod (validation)

**Backend:**
- Express.js
- Node.js 20+
- .NET 8 / C#
- ASP.NET Core Web API
- Drizzle ORM
- Supabase (optional)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- .NET SDK 8.0+
- PostgreSQL database
- SerpAPI key (for SERP checking functionality)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/reddit_opportunity_engine

# External APIs
SERPAPI_KEY=your_serpapi_key

# Optional Supabase configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/reddit-affiliate-opportunity-engine.git
cd reddit-affiliate-opportunity-engine
```

2. Install dependencies
```bash
npm install
```

3. Set up the database
```bash
npm run db:push
```

4. Build the .NET backend
```bash
cd Backend/RedditAffiliateEngine
dotnet build
```

5. Start the development server
```bash
npm run dev
```

## 🧪 Testing

```bash
# Run frontend tests
npm run test

# Run .NET backend tests
cd Backend/RedditAffiliateEngine.Tests
dotnet test
```

## 📝 Usage

1. Configure subreddits to crawl in `server/subredditList.ts`
2. Set up affiliate programs in the database
3. Start the application and access the dashboard at `http://localhost:5000`
4. Use the Crawler Test interface to manually trigger crawls
5. Review and manage discovered opportunities in the dashboard

## 📚 API Documentation

The application provides several API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/threads` | GET | Retrieve all discovered Reddit threads |
| `/api/affiliate-programs` | GET | Get configured affiliate programs |
| `/api/opportunities` | GET | List all detected opportunities |
| `/api/scheduler/status` | GET | Check the crawler scheduler status |
| `/api/scheduler/run-now` | POST | Manually trigger a crawler run |
| `/api/serp-results` | GET | Get SERP check results |

For a complete API reference, see the [API Documentation](docs/api-docs.md).

## 🤝 Contributing

Contributions are welcome! Please check out our [Contributing Guide](CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Reddit JSON API](https://www.reddit.com/dev/api/) for enabling data collection
- [SerpAPI](https://serpapi.com/) for SERP checking capabilities
- [AndersBD/reddit-opportunity-harvester](https://github.com/AndersBD/reddit-opportunity-harvester) for the initial inspiration

---

<p align="center">
  Built with ❤️ for affiliate marketers and e-commerce entrepreneurs
</p>