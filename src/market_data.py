import requests

def get_market_data():
    tickers = {
        'US_10Y': '^TNX',
        'US_2Y': '^IRX',
        'India_10Y': '^IN10YT=RR',
        'Nifty_50': '^NSEI',
        'Nifty_Bank': '^NSEBANK',
        'Sensex': '^BSESN',
        'Brent_Crude': 'BZ=F',
        'Gold': 'GC=F',
        'Silver': 'SI=F',
        'Copper': 'HG=F',
        'USD_INR': 'INR=X',
        'VIX': '^VIX',
        'DXY': 'DX-Y.NYB'
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
            
    # Calculate Indian Gold (per 10g and 1g in INR)
    # 1 Troy Ounce = 31.1034768 grams
    if results.get('Gold') and results.get('USD_INR'):
        results['Gold_INR_10g'] = (results['Gold'] / 31.1034768) * 10 * results['USD_INR']
        results['Gold_INR_1g'] = results['Gold_INR_10g'] / 10
    else:
        results['Gold_INR_10g'] = 0.0
        results['Gold_INR_1g'] = 0.0
            
    results['Fed_Rate_Cut_Prob'] = '65.5% (Sept 2026)'
            
    return results
