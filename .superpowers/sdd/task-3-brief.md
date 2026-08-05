### Task 3: Extractive Summarization with Headroom Compression

**Files:**
- Create: `src/summarizer.py`
- Modify: `tests/test_scraper.py`

**Interfaces:**
- Produces: `get_summaries()` which takes an array of news items and returns exactly 3 high-impact, single-sentence bullet points without fluff or narrative.
- Must implement the prompt specification strictly: "EXTRACTIVE ONLY. NO GENERATIVE SLOP."

- [ ] **Step 1: Write the failing test**

```python
# append to tests/test_scraper.py
from summarizer import get_summaries

def test_get_summaries(mocker):
    # Mock environment
    mocker.patch.dict("os.environ", {"OPENROUTER_API_KEY": "test_key"})
    
    # Mock requests.post
    mock_post = mocker.patch("requests.post")
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {
        "choices": [{"message": {"content": "- Point 1.\n- Point 2.\n- Point 3."}}]
    }
    
    summaries = get_summaries([{"title": "News 1"}, {"title": "News 2"}])
    assert isinstance(summaries, list)
    assert len(summaries) == 3
    assert summaries[0] == "Point 1."
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_scraper.py::test_get_summaries -v`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```python
# src/summarizer.py
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_scraper.py::test_get_summaries -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/summarizer.py tests/test_scraper.py
git commit -m "feat: add extractive summarizer using OpenRouter"
```
