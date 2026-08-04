"""Main orchestrator: fetches market data, deals, and summaries, then writes data.json."""

import json
import logging
import os
import sys
from datetime import datetime, timezone

# Ensure src/ is on the import path when run from repo root
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from market_data import get_market_data
from deals import get_recent_deals
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

    # Step 2: Deals
    logger.info("Fetching recent deals...")
    deals = get_recent_deals()
    logger.info("Fetched %d deals.", len(deals))

    # Step 3: Summaries from top deals
    news_items = deals[:5] if deals else [{"title": "No deals available today."}]
    logger.info("Generating summaries for %d items...", len(news_items))
    summaries = get_summaries(news_items)
    logger.info("Generated %d summaries.", len(summaries))

    # Step 4: Assemble payload
    payload = {
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "market_data": market_data,
        "deals": deals,
        "summaries": summaries,
    }

    # Step 5: Write data.json
    output_path = os.path.normpath(DATA_JSON_PATH)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    logger.info("Wrote %s (%d bytes).", output_path, os.path.getsize(output_path))

    return payload


if __name__ == "__main__":
    run()
