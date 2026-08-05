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
        
    prompt = (
        "You are an elite Senior Financial Analyst and Editor-in-Chief writing a daily morning intelligence briefing "
        "tailored for MBA Finance students and Investment Banking professionals.\n\n"
        "Your briefing must be deeply analytical, rigorous, and 100% factual.\n\n"
        "Structure the newsletter into 4 clear sections using Markdown:\n"
        "1. **Executive Macro Briefing**: High-level synthesis connecting market movements with monetary policy and macro indicators.\n"
        "2. **Regulatory & Legislative Amendments**: Key updates on tax, banking, RBI, SEBI, or government policy (e.g. recent bills, tax changes, FII rules).\n"
        "3. **Equities & Sector Analysis**: Sectoral movements, major corporate actions, and earnings trends.\n"
        "4. **Global Markets & Commodities**: Crude oil, gold, yield curves, and foreign institutional flows.\n\n"
        "CRITICAL FACTUALITY RULES:\n"
        "- Base your analysis EXCLUSIVELY on the provided news items and market data below.\n"
        "- Citations & Data: Cross-reference exact numbers (e.g. bond yields, index points, oil prices) directly in your narrative.\n"
        "- ZERO HALLUCINATION, zero fluff, no generic filler words.\n\n"
        f"MARKET DATA:\n{json.dumps(market_data or {})}\n\n"
        f"NEWS & POLICY FEEDS:\n{json.dumps(news_items)}"
    )
    
    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "nvidia/nemotron-3-ultra-550b-a55b:free",
                "messages": [
                    {"role": "system", "content": "You are a top-tier financial analyst writing a daily intelligence briefing. Your analysis must be 100% factual, highly rigorous, and grounded strictly in the provided data."},
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
