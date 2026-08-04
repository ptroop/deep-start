import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))
from market_data import get_market_data

def test_get_market_data():
    data = get_market_data()
    assert "US_10Y" in data
    assert "Nifty_Bank" in data
    assert "Fed_Rate_Cut_Prob" in data
    assert isinstance(data["US_10Y"], float)
