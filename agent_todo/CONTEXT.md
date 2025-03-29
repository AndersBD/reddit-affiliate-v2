# 🧠 CONTEXT: REDDIT AFFILIATE OPPORTUNITY ENGINE (RAOE)

You are the primary development agent for a software platform called the **Reddit Affiliate Opportunity Engine (RAOE)**.

The RAOE system is designed to help **solo affiliate marketers, SaaS founders, and growth hackers** discover **high-performing Reddit threads** where they can naturally insert **affiliate content** that aligns with popular discussions and already ranks on Google.

---

## 🎯 PRIMARY OBJECTIVE

To build a system that:
- **Crawls and analyzes Reddit threads (no API)**
- **Matches thread content with affiliate keywords**
- **Detects if Reddit threads rank on Google (SERP)**
- **Scores and stores these opportunities**
- **Presents them in a clean dashboard for marketers**
- **Generates contextual affiliate comments or posts**

The end goal is to help the user **identify, plan, and execute** affiliate promotions on Reddit with minimal manual work and maximum SEO + Reddit-native visibility.

---

## 💡 MVP Features (Must-Have)

1. **HTML-based Reddit crawler**
2. **Affiliate keyword matcher**
3. **Intent classifier (e.g. DISCOVERY, COMPARISON)**
4. **Opportunity scoring system**
5. **Google SERP rank checker**
6. **Supabase database integration**
7. **REST API endpoints for opportunity access**
8. **Frontend dashboard built in T3 stack**
9. **Reddit thread viewer + comment generator**
10. **Unit + integration tests (Vitest / xUnit)**

---

## ⚙️ STACK OVERVIEW

- **Frontend:** React + Next.js (via T3 App)  
- **Backend:** C# (.NET 8, REST API, Supabase client)  
- **Database:** Supabase (PostgreSQL, Auth, Storage)  
- **Crawler:** C# CLI/Service using `HttpClient` + `HtmlAgilityPack`  
- **Testing:** Vitest (TS), xUnit (.NET), Playwright (optional)

---

## 🗂️ KEY COMPONENTS

- `RedditCrawler`: Collects threads from specified subreddits
- `IntentClassifier`: Classifies threads into DISCOVERY, QUESTION, COMPARISON
- `AffiliateMatcher`: Matches text to affiliate programs
- `OpportunityService`: Combines above into scored, enriched items
- `SupabaseRepository`: Stores/retrieves structured records
- `REST API`: Powers frontend dashboard
- `Frontend UI`: Displays ranked opportunities, previews threads, suggests comments

---

## 🧑‍💻 TARGET USER

- A solo affiliate marketer who wants to find high-traffic, relevant Reddit threads for promoting tools like:
  - Jasper
  - Writesonic
  - Frase
  - 10Web
  - Synthesia
  - Deepbrain AI
- They care about:
  - Relevance (keyword match)
  - Timing (recent + active)
  - SEO (threads that already rank)
  - Authentic tone (human-like, native posts)

---

## ✅ SUCCESS CRITERIA

- System identifies **30+ new opportunities daily**
- SERP rank check identifies at least **60% of Reddit links in top 10 results**
- Crawler runs reliably and doesn’t require Reddit API keys
- All backend logic is **testable and modular**
- Frontend allows user to filter, preview, and copy affiliate replies in < 3 clicks
- The system can **scale later** into a SaaS dashboard

---

## 🛑 WHAT NOT TO DO

- Do not post directly to Reddit (manual review required)
- Do not use Reddit API (use HTML only)
- Do not store or share affiliate keys insecurely
- Do not hallucinate random keywords — use only DB-sourced programs

---

## 🚀 LONG-TERM VISION

Eventually, this app will:
- Track click-through rates (CTR) per thread
- Monitor affiliate performance
- Suggest when to post or comment
- Automate reporting for affiliate ROI

But for now, focus on the **core loop**:
**Scrape → Match → Rank → Store → Display → Suggest**

---

# ✅ STAY FOCUSED. STAY MODULAR. STAY TESTABLE.