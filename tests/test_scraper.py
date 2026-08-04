import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))
from market_data import get_market_data
from deals import get_recent_deals

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

