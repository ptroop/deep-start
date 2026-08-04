import os
try:
    from firecrawl import FirecrawlApp
except ImportError:
    FirecrawlApp = None

def get_recent_deals():
    api_key = os.environ.get("FIRECRAWL_API_KEY")
    if not api_key or FirecrawlApp is None:
        return [{"type": "Error", "title": "Firecrawl API key missing" if not api_key else "Firecrawl package missing"}]
        
    app = FirecrawlApp(api_key=api_key)
    
    # Example: Scraping a financial news site for deals
    try:
        # In production, we'd target a specific URL like a Reuters M&A page
        result = app.scrape_url('https://example-financial-news.com/ma', params={'formats': ['markdown']})
        markdown_content = result.get('markdown', '')
        # Here we would parse the markdown or pass it to OpenRouter
        return [
            {"type": "M&A", "title": "TechCorp acquires StartupX for $1.2B"},
            {"type": "IPO", "title": "FinServe files for $500M IPO on NSE"}
        ]
    except Exception as e:
        return [{"type": "Error", "title": f"Scrape failed: {e}"}]
