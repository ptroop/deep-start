import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))
from market_data import get_market_data
from deals import get_recent_deals
from summarizer import get_summaries

def test_get_market_data():
    data = get_market_data()
    assert "US_10Y" in data
    assert "Nifty_Bank" in data
    assert "Fed_Rate_Cut_Prob" in data
    assert isinstance(data["US_10Y"], float)

def test_get_recent_deals_missing_key(mocker):
    mocker.patch.dict(os.environ, clear=True)
    deals = get_recent_deals()
    assert deals == []

def test_get_recent_deals(mocker):
    mocker.patch.dict(os.environ, {"FIRECRAWL_API_KEY": "test_key"})
    mock_app = mocker.patch("deals.FirecrawlApp")
    mock_app.return_value.scrape_url.return_value = {"markdown": "Test markdown content"}
    
    deals = get_recent_deals()
    assert isinstance(deals, list)
    assert len(deals) > 0
    assert "type" in deals[0]
    assert deals[0]["type"] in ["M&A", "IPO"]

def test_get_summaries(mocker):
    # Mock environment
    mocker.patch.dict("os.environ", {"OPENROUTER_API_KEY": "test_key"})
    
    # Mock requests.post
    mock_post = mocker.patch("requests.post")
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {
        "choices": [{"message": {"content": "- Point 1.\n- Point 2.\n- Point 3."}}]
    }
    
    summaries = get_summaries([{"title": "News 1"}, {"title": "News 2"}])
    assert isinstance(summaries, list)
    assert len(summaries) == 3
    assert summaries[0] == "Point 1."

def test_get_summaries_missing_key(mocker):
    mocker.patch.dict("os.environ", clear=True)
    summaries = get_summaries([{"title": "News 1"}])
    assert len(summaries) == 3
    assert summaries[0] == "API Key missing."

def test_get_summaries_api_error(mocker):
    mocker.patch.dict("os.environ", {"OPENROUTER_API_KEY": "test_key"})
    mock_post = mocker.patch("requests.post")
    mock_post.side_effect = Exception("API down")
    
    summaries = get_summaries([{"title": "News 1"}])
    assert len(summaries) == 3
    assert summaries[0] == "Error generating summaries."


import json
import tempfile
from scraper import run, DATA_JSON_PATH

def test_scraper_orchestration(mocker, tmp_path):
    """Verify scraper.run() writes a valid data.json with the expected schema."""
    # Mock all upstream functions
    mocker.patch("scraper.get_market_data", return_value={
        "US_10Y": 4.25, "US_2Y": 3.80, "India_10Y": 7.10,
        "Nifty_50": 24500.0, "Nifty_Bank": 51000.0,
        "Fed_Rate_Cut_Prob": "65.5% (Sept 2026)"
    })
    mocker.patch("scraper.get_recent_deals", return_value=[
        {"type": "M&A", "title": "TestCorp acquires WidgetInc for $2B"},
        {"type": "IPO", "title": "DataFlow files for $300M IPO"},
    ])
    mocker.patch("scraper.get_summaries", return_value=[
        "TestCorp acquires WidgetInc for $2B.",
        "DataFlow files for $300M IPO.",
        "Markets rallied on strong earnings.",
    ])

    # Redirect data.json to a temp file
    out_file = str(tmp_path / "data.json")
    mocker.patch("scraper.DATA_JSON_PATH", out_file)

    payload = run()

    # Verify return value
    assert "timestamp" in payload
    assert "market_data" in payload
    assert "deals" in payload
    assert "summaries" in payload
    assert len(payload["summaries"]) == 3
    assert len(payload["deals"]) == 2

    # Verify file was written
    assert os.path.exists(out_file)
    with open(out_file, "r", encoding="utf-8") as f:
        written = json.load(f)
    assert written["market_data"]["US_10Y"] == 4.25
    assert len(written["summaries"]) == 3
