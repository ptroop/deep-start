import yfinance as yf
import requests

def get_market_data():
    tickers = {
        "US_10Y": "^TNX",
        "US_2Y": "^IRX",
        "India_10Y": "^IN10YT=RR",
        "Nifty_50": "^NSEI",
        "Nifty_Bank": "^NSEBANK"
    }
    
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    })
    
    results = {}
    for name, symbol in tickers.items():
        try:
            ticker = yf.Ticker(symbol, session=session)
            todays_data = ticker.history(period="1d")
            results[name] = float(todays_data['Close'].iloc[0]) if not todays_data.empty else 0.0
        except Exception:
            results[name] = 0.0
            
    # Mocking Central Bank probability (in production, scrape CME FedWatch or similar API)
    results["Fed_Rate_Cut_Prob"] = "65.5% (Sept 2026)"
            
    return results
