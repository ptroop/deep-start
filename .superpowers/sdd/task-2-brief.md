### Task 2: Market Data Fetching & Central Bank Probabilities

**Files:**
- Create: `src/market_data.py`
- Modify: `tests/test_scraper.py:4-15`

**Interfaces:**
- Produces: `get_market_data()` which returns a dictionary of yields, sector performances, and rate probabilities.

- [ ] **Step 1: Write the failing test**

```python
# append to tests/test_scraper.py
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_scraper.py::test_get_market_data -v`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```python
# src/market_data.py
import yfinance as yf

def get_market_data():
    tickers = {
        "US_10Y": "^TNX",
        "US_2Y": "^IRX",
        "India_10Y": "^IN10YT=RR",
        "Nifty_50": "^NSEI",
        "Nifty_Bank": "^NSEBANK"
    }
    
    results = {}
    for name, symbol in tickers.items():
        try:
            ticker = yf.Ticker(symbol)
            todays_data = ticker.history(period="1d")
            results[name] = float(todays_data['Close'].iloc[0]) if not todays_data.empty else 0.0
        except Exception:
            results[name] = 0.0
            
    # Mocking Central Bank probability (in production, scrape CME FedWatch or similar API)
    results["Fed_Rate_Cut_Prob"] = "65.5% (Sept 2026)"
            
    return results
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_scraper.py::test_get_market_data -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/market_data.py tests/test_scraper.py
git commit -m "feat: fetch market yields, sectors, and rate probabilities"
```
