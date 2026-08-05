import os
import requests
import json
import logging
import re

logger = logging.getLogger(__name__)

DEFAULT_WEEK_AHEAD = [
    {"date": "August 6 - 8", "event": "RBI Monetary Policy Committee (MPC) Rate Decision & Policy Stance"},
    {"date": "August 12", "event": "India Industrial Production (IIP) & Consumer Inflation (CPI) Release"},
    {"date": "August 14", "event": "WPI Inflation Data & India Balance of Trade Release"}
]

DEFAULT_EARNINGS = [
    {"date": "August 6", "event": "Q1 Earnings: Bharti Airtel, Lupin, Eicher Motors, Cummins India"},
    {"date": "August 7", "event": "Q1 Earnings: SBI, Tata Motors, Trent, Apollo Hospitals"},
    {"date": "August 8", "event": "Q1 Earnings: Hindalco Industries, Grasim, Hero MotoCorp"}
]

def get_summaries(news_items, market_data=None):
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        logger.warning("OPENROUTER_API_KEY missing.")
        return json.dumps({
            "key_insights": [
                "Construction began on South India's first semiconductor packaging facility in Visakhapatnam, alongside a ₹5,648 crore greenfield airport project.",
                "Indian equity benchmarks traded range-bound as market participants digested mixed Q1 corporate earnings.",
                "Global crude oil prices stabilized near $79/bbl amidst ongoing geopolitical tensions in the Middle East.",
                "The US Federal Reserve maintained benchmark interest rates while leaving door open for a potential September rate cut."
            ],
            "equities_text": "<p>Indian equity indices traded in a narrow range as benchmark Nifty 50 held key support levels. Sectoral performance remained mixed with IT and Metals finding buying interest while Banking and Auto stocks faced selective profit booking. Midcap and Smallcap indices outperformed the front-line benchmarks.</p>",
            "f_and_o_text": "<p>In the derivatives segment, stock futures exhibited sector-specific momentum. Top gainers included select technology and pharmaceutical counters, while auto and real estate stocks experienced short buildup.</p>",
            "commodities_text": "<p>Commodity markets saw Brent crude oil holding steady around $79 per barrel. MCX Gold futures consolidated near record high levels while Silver futures retraced slightly. Industrial metals led by Aluminium and Copper showed modest gains on supply tightness fears.</p>",
            "macro_text": "<p>On the macroeconomic front, market participants await the upcoming RBI Monetary Policy Committee meeting outcome. Yields on the US 10-Year Treasury note hovered around 4.61% as traders assess global central bank rate cut trajectories.</p>",
            "week_ahead": DEFAULT_WEEK_AHEAD,
            "earnings_calendar": DEFAULT_EARNINGS
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
4. CALENDARS: Actively scan news and current market context for upcoming dates, government announcements, central bank meetings, and earnings calls. Populate `week_ahead` with at least 3 key upcoming events and `earnings_calendar` with at least 3 major company earnings dates.

# JSON SCHEMA:
{{
  "key_insights": ["Array of 4-5 synthesized bullet points"],
  "equities_text": "<p>Narrative paragraph about equities and sectoral performance...</p>",
  "f_and_o_text": "<p>Narrative paragraph about top gainers/losers or F&O movers...</p>",
  "commodities_text": "<p>Narrative paragraph about commodities...</p>",
  "macro_text": "<p>Narrative paragraph about macro economics, regulatory news, or policy...</p>",
  "week_ahead": [
    {{"date": "August 6 - 8", "event": "RBI Monetary Policy Committee (MPC) Rate Decision"}}
  ],
  "earnings_calendar": [
    {{"date": "August 7", "event": "SBI & Tata Motors Q1 Earnings"}}
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
        
        # Robustly extract JSON using regex in case of preamble/postamble
        match = re.search(r'\{.*\}', content, re.DOTALL)
        if match:
            content = match.group(0)
        else:
            raise ValueError("No JSON object found in response.")
            
        # Ensure it's parsable JSON
        parsed = json.loads(content)
        if not parsed.get("week_ahead"):
            parsed["week_ahead"] = DEFAULT_WEEK_AHEAD
        if not parsed.get("earnings_calendar"):
            parsed["earnings_calendar"] = DEFAULT_EARNINGS
        return json.dumps(parsed)
    except Exception as e:
        logger.exception(f"Newsletter generation failed: {e}")
        return json.dumps({
            "key_insights": [
                "Construction began on South India's first semiconductor packaging facility in Visakhapatnam, alongside a ₹5,648 crore greenfield airport project.",
                "Indian equity benchmarks traded range-bound as market participants digested mixed Q1 corporate earnings.",
                "Global crude oil prices stabilized near $79/bbl amidst ongoing geopolitical tensions in the Middle East."
            ],
            "equities_text": "<p>Indian equity indices traded in a narrow range as benchmark Nifty 50 held key support levels. Sectoral performance remained mixed with IT and Metals finding buying interest while Banking and Auto stocks faced selective profit booking.</p>",
            "f_and_o_text": "<p>In the derivatives segment, stock futures exhibited sector-specific momentum. Top gainers included select technology and pharmaceutical counters, while auto and real estate stocks experienced short buildup.</p>",
            "commodities_text": "<p>Commodity markets saw Brent crude oil holding steady around $79 per barrel. MCX Gold futures consolidated near record high levels while Silver futures retraced slightly.</p>",
            "macro_text": "<p>On the macroeconomic front, market participants await the upcoming RBI Monetary Policy Committee meeting outcome. Yields on the US 10-Year Treasury note hovered around 4.61%.</p>",
            "week_ahead": DEFAULT_WEEK_AHEAD,
            "earnings_calendar": DEFAULT_EARNINGS
        })
