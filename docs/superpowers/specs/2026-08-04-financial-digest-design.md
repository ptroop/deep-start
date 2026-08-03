# Financial Digest Dashboard - Design Specification

## 1. Goal
Build a zero-maintenance, 100% free financial digest dashboard designed for an aspiring investment banking analyst. The dashboard will automatically aggregate daily macro-economic data, sector performance, and strictly extracted news summaries. 

## 2. Philosophy (Karpathy / Bloomberg Minimalist Approach)
- **Zero bloat**: No databases, no heavy frameworks (no Next.js/React). Just plain HTML/CSS/JS.
- **Data density**: High signal-to-noise ratio. Strict, extractive AI summaries only—no "AI slop" or generative hallucinations.
- **Transparency**: The data pipeline runs via a transparent, easily auditable Python script on GitHub Actions.

## 3. Architecture
- **Frontend**: A single `index.html` file with vanilla CSS and JavaScript hosted on GitHub Pages.
- **Backend / Data Pipeline**: A Python script (`scraper.py`) executed daily via a GitHub Actions cron job.
- **Database**: A static `data.json` file committed directly to the repository by the GitHub Action.

## 4. Features & Components
1. **Macro & Yield Tracker**: 
   - Displays 10-Year and 2-Year US and Indian Government Bond Yields.
2. **Sector Rotation Heatmap**: 
   - Pulls daily performance of key sub-indices (e.g., Nifty Bank, Nifty IT, Nifty Auto).
3. **Earnings & Catalyst Calendar**: 
   - A list of major economic events or notable earnings for the day.
4. **Strict Extractive News Digest**: 
   - Fetches headlines from major financial outlets (Mint, ET).
   - Uses OpenRouter (with Gemini as fallback) to extract *only* hard numbers and policy changes into bullet points (max 15 words per bullet).

## 5. Data Flow
1. GitHub Action triggers `scraper.py` at 6:00 AM daily.
2. `scraper.py` calls Yahoo Finance API (or similar free APIs) for yields, sectors, and calendar data.
3. `scraper.py` fetches RSS feeds for news.
4. `scraper.py` calls OpenRouter API for extractive summarization.
5. All data is formatted into a JSON structure and saved to `data.json`.
6. GitHub Action commits and pushes `data.json` to the `main` branch.
7. GitHub Pages automatically redeploys.
8. User visits the URL; `index.html` fetches `data.json` and renders the dashboard.

## 6. Constraints & Error Handling
- **API Limits**: The script will run only once a day to stay well within free tiers.
- **Fallback**: If OpenRouter fails, the script will automatically attempt to use the Gemini API. If both fail, it will fall back to displaying the raw headlines without summaries.

## 7. Next Steps
Once this specification is approved, we will invoke the `writing-plans` skill to generate the step-by-step implementation plan for the Python script and the HTML frontend.
