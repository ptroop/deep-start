"""Main orchestrator: fetches market data, deals, and summaries, then writes data.json."""

import json
import logging
import os
import sys
from datetime import datetime, timezone

# Ensure src/ is on the import path when run from repo root
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from market_data import get_market_data
from news_fetcher import get_financial_news
from summarizer import get_summaries

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Path to data.json at the repository root (one level up from src/)
DATA_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "data.json")


def run():
    """Execute the full pipeline and write data.json."""
    logger.info("Starting Financial Digest pipeline...")

    # Step 1: Market data
    logger.info("Fetching market data...")
    market_data = get_market_data()
    logger.info("Market data: %s", market_data)

    # Step 2: News
    logger.info("Fetching financial news...")
    news_items = get_financial_news()
    logger.info("Fetched %d news items.", len(news_items))

    # Step 3: Newsletter Generation
    logger.info("Generating newsletter for %d items...", len(news_items))
    newsletter_md = get_summaries(news_items, market_data)
    logger.info("Generated newsletter.")

    # Step 4: Assemble payload
    payload = {
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "market_data": market_data,
        "newsletter": newsletter_md,
    }

    # Step 5: Write data.json
    output_path = os.path.normpath(DATA_JSON_PATH)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    logger.info("Wrote %s (%d bytes).", output_path, os.path.getsize(output_path))

    return payload


if __name__ == "__main__":
    run()
