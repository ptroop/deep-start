# Automated AI Financial Digest: V2 Overhaul

This plan outlines the architecture and steps to completely overhaul the current minimal dashboard into a dense, premium "Bloomberg/Substack-style" daily newsletter, directly mirroring the layout, depth, and aesthetics of the `fin.preparoo.app/daystarter` reference.

## Goal Description
The current implementation is too basic ("three boxes"). The goal is to transform it into a comprehensive daily digest that covers multiple sectors (Equities, Commodities, Monetary Policy, Corporate Earnings, Global Markets) and presents them in a highly readable, dense, and professional layout.

## The Overhaul Pipeline

1. **Expanded Data Gathering (The Scraper):**
   - Instead of pulling a single category, the script will scrape comprehensive financial news from top-tier sources (e.g., Mint, Economic Times, or via Firecrawl's advanced search capabilities) to gather news across multiple categories:
     - Equities & Sectors
     - Commodities & Currency
     - Macro-economy & Policy (RBI, Government)
     - Corporate Earnings (Specific Companies)
     - Global Markets
2. **Advanced AI Newsletter Generation:**
   - We will use the free 120B Nvidia model on OpenRouter.
   - We will completely rewrite the LLM prompt. Instead of asking for "3 bullet points", we will ask it to act as a financial journalist and write a full, structured Markdown newsletter containing specific sections, bolded highlights, and concise bullet points.
3. **Premium Frontend Redesign:**
   - **Layout:** Move away from the "grid of cards" to a dense, two-column "Financial Times / Substack" aesthetic.
   - **Left Column (Sidebar):** Market Data (Nifty 50, Sensex, 10Y Yields, Fed Rate Probabilities, Currency).
   - **Right/Main Column (Content):** A beautifully formatted markdown renderer that displays the AI's generated newsletter with elegant typography (serif for body, sans-serif for headers), subtle dividers, and high contrast.
   - **Aesthetics:** Classic, crisp, institutional design (e.g., `#f9f9f9` background, `#111` text, muted accent colors, perfect line heights for long-form reading).

> [!IMPORTANT]
> ## User Review Required
> 1. **Data Sources:** To get news as detailed as the DayStarter reference, we need highly specific Indian financial news. I will configure the scraper to pull from Indian financial RSS feeds (like Mint/Economic Times) before feeding them to the AI, ensuring the AI has the exact same context as the human writer of DayStarter. Does this sound good?
> 2. **Design Language:** Do you prefer a classic "Financial Newspaper" look (Light mode, serif fonts like Merriweather/Playfair, dense text) or a "Modern Terminal" look (Dark mode, monospaced fonts, neon accents)?
> 3. Shall I proceed with tearing down the old UI and building this?

## Verification Plan
### Automated Tests
- The scraper will be tested locally to ensure it successfully aggregates multiple news sources and generates a cohesive multi-section markdown document.

### Manual Verification
- We will visually compare the new `index.html` to the DayStarter link you provided to ensure it matches the density, quality, and aesthetic appeal.
