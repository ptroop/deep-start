import os
import requests
import json
import logging

logger = logging.getLogger(__name__)

def get_summaries(news_items, market_data=None):
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        logger.warning("OPENROUTER_API_KEY missing.")
        return "## API Key missing\nCannot generate newsletter. Please check environment variables."
        
    prompt = f"""
You are a highly analytical Senior Financial Editor at a top-tier news desk (e.g. WSJ, Bloomberg). Your task is to process raw market data and news headlines into a dense, high-signal daily digest.

# INPUT DATA:
Market Data: {json.dumps(market_data or {})}
News Items: {json.dumps(news_items)}

# INSTRUCTIONS:
1. KEY INSIGHTS SECTION: Start with '## Key Insights'. Produce exactly 4-5 bullet points.
2. SYNTHESIS RULE: DO NOT simply regurgitate headlines. You MUST group related news items thematically (e.g. merge all semiconductor and infrastructure news into one point, or merge all regulatory/RBI news into one point) and synthesize them into a single compound sentence.
3. EDITORIAL TONE & STYLE: 
   - ZERO adjectives (do not use words like 'significant', 'major', 'surging', 'notable').
   - Use objective, declarative sentences.
   - Every bullet must contain specific entities (Company Names, Government Bodies) and numbers/metrics.
   - Example Bad: "There is major news in the tech sector as a new semiconductor plant is being built."
   - Example Good: "Construction began on South India's first semiconductor packaging facility in Visakhapatnam, coinciding with the launch of a ₹5,648 crore airport project."
4. SECTIONS TO INCLUDE:
   - ## Key Insights (The 4-5 synthesized bullets)
   - ## Market Movers (Identify specific indices or asset classes that moved based on the data)
   - ## Macro Context (Brief synthesis of central bank or economic policy news)
   
Do not include any introductory text, pleasantries, or conclusions. Output ONLY the raw markdown.
"""
    
    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openrouter/free",
                "messages": [
                    {"role": "system", "content": "You are a highly analytical Senior Financial Editor. Output strictly synthesized, factual, zero-adjective bullet points. No pleasantries."},
                    {"role": "user", "content": prompt}
                ]
            }
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        return content
    except Exception as e:
        logger.exception(f"Newsletter generation failed: {e}")
        return f"## Error generating newsletter\n\nDetails: {e}\n\nTry again later."
