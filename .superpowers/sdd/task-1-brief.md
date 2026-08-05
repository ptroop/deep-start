### Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: `requirements.txt`, `.gitignore`, `.github/workflows/scraper.yml`

**Interfaces:**
- N/A

- [ ] **Step 1: Write `requirements.txt`**

```text
yfinance==0.2.40
requests==2.32.3
pytest==8.3.2
firecrawl-py==1.0.0
pytest-mock==3.14.0
```

- [ ] **Step 2: Write the .gitignore file**

```text
__pycache__/
*.pyc
.env
data.json
.pytest_cache/
```

- [ ] **Step 3: Setup the basic GitHub Actions YAML**

Create `.github/workflows/scraper.yml`:
```yaml
name: Financial Digest Scraper

on:
  schedule:
    - cron: '30 2 * * 1-5' # 2:30 AM UTC Monday-Friday
  workflow_dispatch:

jobs:
  scrape-and-build:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'

      - name: Install Dependencies
        run: pip install -r requirements.txt
```

- [ ] **Step 4: Commit**

```bash
git add requirements.txt .gitignore .github/workflows/scraper.yml
git commit -m "chore: initial project scaffolding"
```
