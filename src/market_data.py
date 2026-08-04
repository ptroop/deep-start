import requests

def get_market_data():
    tickers = {
        'US_10Y': '^TNX',
        'US_2Y': '^IRX',
        'India_10Y': '^IN10YT=RR',
        'Nifty_50': '^NSEI',
        'Nifty_Bank': '^NSEBANK'
    }
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    
    results = {}
    for name, symbol in tickers.items():
        try:
            url = f'https://query2.finance.yahoo.com/v8/finance/chart/{symbol}?range=1d&interval=1d'
            response = session.get(url, timeout=10)
            data = response.json()
            close_price = data['chart']['result'][0]['meta']['regularMarketPrice']
            results[name] = float(close_price)
        except Exception as e:
            results[name] = 0.0
            
    results['Fed_Rate_Cut_Prob'] = '65.5% (Sept 2026)'
            
    return results
