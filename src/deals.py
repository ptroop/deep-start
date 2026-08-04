import os
import logging

try:
    from firecrawl import FirecrawlApp
except ImportError:
    FirecrawlApp = None

logger = logging.getLogger(__name__)

def get_recent_deals():
    api_key = os.environ.get("FIRECRAWL_API_KEY")
    if not api_key or FirecrawlApp is None:
        logger.warning("Firecrawl API key or package missing")
        return []
        
    app = FirecrawlApp(api_key=api_key)
    
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
        logger.exception(f"Scrape failed: {e}")
        return []
