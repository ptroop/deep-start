import os
import requests
import json
import logging

logger = logging.getLogger(__name__)

def get_summaries(news_items):
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        logger.warning("OPENROUTER_API_KEY missing.")
        return "## API Key missing\nCannot generate newsletter. Please check environment variables."
        
    prompt = (
        "Act as a professional financial journalist. Synthesize the following news items into a dense, premium "
        "daily financial newsletter. Use Markdown formatting. Include specific sections like 'Market Overview', "
        "'Equities & Sectors', 'Macro & Policy', and 'Global Markets'. Use bolding for key entities and numbers. "
        "Make it engaging and highly readable.\n\n"
        "CRITICAL INSTRUCTION: You must be strictly factual. Base your entire newsletter ONLY on the provided news items. "
        "DO NOT hallucinate, invent, or assume any facts, numbers, or events that are not explicitly present in the data. "
        "EXTRACTIVE AND FACTUAL SYNTHESIS ONLY.\n\n"
        f"{json.dumps(news_items)}"
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
                    {"role": "system", "content": "You are a top-tier financial journalist writing a daily newsletter. Your writing must be 100% factual and grounded solely in the provided data."},
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
