### Task 5: Automation and Orchestration

**Files:**
- Create: `src/scraper.py`
- Modify: `.github/workflows/scraper.yml`

**Requirements:**
1. **`src/scraper.py`**: This is the main orchestrator script. It must:
   - Call `get_market_data()` from `market_data.py`.
   - Call `get_recent_deals()` from `deals.py`.
   - Take the top 5 deals (by index or random) and pass them to `get_summaries()` from `summarizer.py` to generate the `KEY DEVELOPMENTS` bullet points.
   - Aggregate all this into a dictionary with keys: `timestamp` (ISO format string), `market_data` (dict), `deals` (list of dicts), `summaries` (list of strings).
   - Write this dictionary to `data.json` in the root of the repository.
   - Log progress clearly.

2. **`.github/workflows/scraper.yml`**: Configure the GitHub Actions workflow to:
   - Run on a schedule (e.g. `cron: '0 12,23 * * *'`) and `workflow_dispatch`.
   - Set up Python, install dependencies from `requirements.txt`.
   - Inject secrets `FIRECRAWL_API_KEY` and `OPENROUTER_API_KEY` as environment variables.
   - Run `python src/scraper.py`.
   - Commit the updated `data.json` back to the repository using a bot account (`action@github.com`).
   - Use `permissions: contents: write`.

**TDD:**
- Add a basic test `test_scraper_orchestration` in `tests/test_scraper.py` to ensure `scraper.py` successfully writes a valid `data.json` file when the underlying functions are mocked out.
