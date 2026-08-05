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
        "You are an elite Senior Financial Analyst. Write a strictly factual, zero-fluff daily morning intelligence briefing for MBA Finance professionals.\n\n"
        "RULES (ZERO SLOP):\n"
        "1. NO introductory or concluding sentences. Start immediately with the facts.\n"
        "2. Use EXACTLY 4 sections (Executive Macro, Regulatory/M&A, Equities, Global/Yields).\n"
        "3. Maximum 3 bullet points per section.\n"
        "4. Maximum 2 short sentences per bullet point.\n"
        "5. Base everything STRICTLY on the data provided below. Reference exact numbers.\n\n"
        f"MARKET DATA:\n{json.dumps(market_data or {})}\n\n"
        f"NEWS FEEDS:\n{json.dumps(news_items)}"
    )
    
    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "nvidia/llama-3.1-nemotron-70b-instruct:free",
                "messages": [
                    {"role": "system", "content": "You are a concise, ultra-professional financial analyst. Output only the requested sections and bullets. No pleasantries."},
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
