import os
import requests
import json
import logging

logger = logging.getLogger(__name__)

def get_summaries(news_items, market_data=None):
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        logger.warning("OPENROUTER_API_KEY missing.")
        return json.dumps({
            "key_insights": ["API Key missing. Cannot generate insights."],
            "equities_text": "<p>Please configure the OPENROUTER_API_KEY.</p>",
            "f_and_o_text": "<p>Missing API key.</p>",
            "commodities_text": "<p>Missing API key.</p>",
            "macro_text": "<p>Missing API key.</p>",
            "week_ahead": [],
            "earnings_calendar": []
        })
        
    prompt = f"""
You are a highly analytical Senior Financial Editor at a top-tier news desk (e.g. WSJ, Bloomberg). Your task is to process raw market data and news headlines into a dense, high-signal daily digest.

# INPUT DATA:
Market Data: {json.dumps(market_data or {})}
News Items: {json.dumps(news_items)}

# INSTRUCTIONS:
1. Output strictly valid JSON.
2. SYNTHESIS RULE: DO NOT simply regurgitate headlines. You MUST group related news items thematically and synthesize them into single compound sentences.
3. EDITORIAL TONE & STYLE: ZERO adjectives (do not use words like 'significant', 'major', 'surging'). Use objective, declarative sentences. Every sentence must contain specific entities and numbers/metrics.
4. CALENDARS: Actively scan the news for future dates, upcoming government announcements, and earnings calls. Extract these to populate the `week_ahead` and `earnings_calendar` arrays. If none are found, return empty arrays.

# JSON SCHEMA:
{{
  "key_insights": ["Array of 4-5 synthesized bullet points"],
  "equities_text": "<p>Narrative paragraph about equities and sectoral performance...</p>",
  "f_and_o_text": "<p>Narrative paragraph about top gainers/losers or F&O movers...</p>",
  "commodities_text": "<p>Narrative paragraph about commodities...</p>",
  "macro_text": "<p>Narrative paragraph about macro economics, regulatory news, or policy...</p>",
  "week_ahead": [
    {{"date": "Extracted Date (e.g. August 4)", "event": "Extracted Event (e.g. RBI MPC Meeting begins)"}}
  ],
  "earnings_calendar": [
    {{"date": "Extracted Date", "event": "Extracted Earnings Call (e.g. SBI Q1 Results)"}}
  ]
}}
"""
    
    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "meta-llama/llama-3.1-8b-instruct:free",
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "system", "content": "You are a highly analytical Senior Financial Editor. Output strictly valid JSON only. No markdown formatting outside of what is requested. No pleasantries."},
                    {"role": "user", "content": prompt}
                ]
            }
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        # Strip markdown formatting if present
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        # Ensure it's parsable JSON
        json.loads(content)
        return content
    except Exception as e:
        logger.exception(f"Newsletter generation failed: {e}")
        return json.dumps({
            "key_insights": [f"Error generating newsletter: {e}"],
            "equities_text": "<p>Error.</p>",
            "f_and_o_text": "<p>Error.</p>",
            "commodities_text": "<p>Error.</p>",
            "macro_text": "<p>Error.</p>",
            "week_ahead": [],
            "earnings_calendar": []
        })
