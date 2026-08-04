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

def test_get_recent_deals():
    deals = get_recent_deals()
    assert isinstance(deals, list)
    assert len(deals) > 0
    assert "type" in deals[0]

