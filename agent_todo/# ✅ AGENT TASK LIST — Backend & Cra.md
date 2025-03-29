# ✅ AGENT TASK LIST — Backend & Crawler Build Plan (MVP Phase)

This list contains atomic tasks for the Agent to execute one-by-one. Each task includes expected input/output and may reference tests, models, or services.

---

## 📦 PHASE 1 — Setup Supabase Schema

### T-001: Setup Supabase schema and generate types
- Create tables: `reddit_threads`, `affiliate_programs`, `opportunities`, `serp_results`
- Fields must match PRD models
- Generate TypeScript types for frontend
- Generate C# types for backend access layer
- Save schema SQL to `/supabase/schema.sql`

---

## 🧠 PHASE 2 — Data Models & Repositories

### T-010: Create C# model for `RedditThread` + repository
- Model fields: id, title, body, subreddit, upvotes, created_utc, permalink
- Implement `RedditThreadRepository.cs`

### T-011: Create `AffiliateProgram` model + service
- Fields: id, name, keywords[], promo_code, link
- Add `AffiliateProgramRepository.cs` and test it with fake data

### T-012: Create `Opportunity` model
- Fields: thread_id, score, intent, matched_program_ids, serp_match, action
- Add OpportunityRepository to query top opportunities

---

## 🌐 PHASE 3 — API Endpoints

### T-020: Build `GET /api/opportunities`
- Returns top 25 scored opportunities
- Includes thread + affiliate match data
- Add `xUnit` test to verify output

### T-021: Build `POST /api/keywords/match`
- Accepts thread text
- Returns matched affiliate programs from DB
- Add tests for 1 match, multiple, none

### T-022: Build `GET /api/threads/recent`
- Returns last 50 threads from `reddit_threads`
- Supports filters: subreddit, min_upvotes

---

## 🤖 PHASE 4 — C# Reddit Crawler

### T-030: Build Reddit thread crawler (no API)
- Use `HttpClient` + `HtmlAgilityPack`
- Scrape hot/new/top from subreddit list
- Extract title, body, flair, permalink, upvotes
- Save to `reddit_threads` via Supabase

### T-031: Implement `IntentClassifier` service
- Classify threads into DISCOVERY, COMPARISON, QUESTION, SHOWCASE
- Rule-based logic or regex match
- Add tests for all intent types

### T-032: Implement `AffiliateMatcher` service
- Accepts text, returns matched programs from DB
- Match against program keywords
- Add tests for edge cases

---

## 🔍 PHASE 5 — Google SERP Checker

### T-040: Build SERP checker (C# or CLI headless)
- Search `site:reddit.com {thread_title}` on Google
- Parse top 10 result links
- If Reddit thread found, store serp_match=true in `serp_results`

### T-041: Build enrichment job to create `opportunities`
- For each thread:
  - Match affiliate programs
  - Classify intent
  - Run SERP checker
  - Save/update opportunity record

---

## ⚙️ PHASE 6 — Automation & Integration

### T-050: Create `POST /api/crawler/run`
- Triggers manual run of crawler
- Returns number of new threads discovered

### T-051: Create `/api/opportunities/refresh`
- Triggers opportunity enrichment pass

### T-052: Optional CRON job to run crawler every 12h
- Use .NET HostedService or Timer
- Store crawler logs or timestamp in `crawler_status`

---

## 🧪 PHASE 7 — Testing & Fixtures

### T-060: Write unit tests for:
- `AffiliateMatcher`
- `IntentClassifier`
- `Opportunity scoring logic`
- `Crawler post extractor`

### T-061: Seed fake data
- Add Jasper, Frase, Writesonic to `affiliate_programs`
- Add test threads with DISCOVERY, COMPARISON intent

---

## 📑 PHASE 8 — API Contract Memory

### T-070: Document backend API in `/agents/context.md`
- Define input/output shape of each endpoint
- This helps Agent generate UI & integration code

---

