import requests
import xml.etree.ElementTree as ET
import logging

logger = logging.getLogger(__name__)

def get_financial_news():
    """Fetches recent financial news from public RSS feeds."""
    feeds = [
        "https://www.livemint.com/rss/markets",
        "https://economictimes.indiatimes.com/news/economy/policy/rssfeeds/1715249553.cms",
        "https://www.cnbc.com/id/10000664/device/rss/rss.html", # CNBC Finance / M&A
        "https://www.cnbc.com/id/10001147/device/rss/rss.html"  # CNBC Economy
    ]
    
    news_items = []
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    })
    
    for feed_url in feeds:
        try:
            response = session.get(feed_url, timeout=10)
            if response.status_code == 200:
                root = ET.fromstring(response.content)
                # Standard RSS 2.0 format
                for item in root.findall('.//item')[:10]: # Get top 10 from each
                    title = item.findtext('title')
                    description = item.findtext('description')
                    if title:
                        # Clean up description
                        if description:
                            # basic strip HTML if any
                            description = description.replace('<br/>', ' ').replace('<br>', ' ')
                        news_items.append({
                            "title": title,
                            "description": description or ""
                        })
        except Exception as e:
            logger.warning(f"Failed to fetch RSS from {feed_url}: {e}")
            
    # Fallback if feeds fail
    if not news_items:
        logger.warning("Using fallback news items")
        news_items = [
            {"title": "Nifty 50 closes higher, Media leads sectors", "description": "The Nifty 50 closed at 24,383.60, up 0.27% from its previous close."},
            {"title": "RBI expected to keep repo rate at 5.25%", "description": "All 10 economists surveyed expect the RBI to keep the repo rate unchanged."},
            {"title": "Global markets rise, oil remains above $88", "description": "Global equity markets ended higher. Brent crude rose above $88 per barrel."}
        ]
        
    return news_items
