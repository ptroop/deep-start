import os
import requests
import json
import logging

logger = logging.getLogger(__name__)

def get_summaries(news_items):
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        logger.warning("OPENROUTER_API_KEY missing.")
        return ["API Key missing. Cannot generate summaries."]
        
    prompt = "Summarize the following news into exactly 3 factual bullet points. EXTRACTIVE ONLY. NO GENERATIVE SLOP.\n\n"
    prompt += json.dumps(news_items)
    
    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "google/gemini-flash-1.5-8b",
                "messages": [
                    {"role": "system", "content": "You are a financial analyst. Return only 3 bullet points starting with '-'"},
                    {"role": "user", "content": prompt}
                ]
            }
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        
        # Parse bullet points
        bullets = [line.strip("- ").strip() for line in content.split("\n") if line.strip().startswith("-")]
        return bullets if bullets else [content]
    except Exception as e:
        logger.exception(f"Summarization failed: {e}")
        return ["Error generating summaries."]
