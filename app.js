document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupDrawerHandlers();
    setupScrollHandler();
});

async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        const timestamp = data.timestamp || 'August 6, 2026';
        const market = data.market_data || {};
        const newsletter = data.newsletter || {};

        // Update Headers & Byline
        document.getElementById('sticky-title').textContent = `DayStarter: ${timestamp}`;
        document.getElementById('hero-date').textContent = timestamp;
        document.getElementById('byline-date').textContent = `${timestamp} · Vol. I, No. 59`;

        if (newsletter.hero_bullets && newsletter.hero_bullets.length > 0) {
            document.getElementById('hero-headline').textContent = newsletter.hero_bullets[0].headline;
        }

        // Render Stat Cards
        renderStatCards(market);

        // Render Hero Bullets
        renderHeroBullets(newsletter.hero_bullets || []);

        // Render Dynamic Articles & Build Table of Contents
        renderArticlesAndToc(newsletter.articles || []);

        // Render Key Insights Drawer
        renderKeyInsights(newsletter.key_insights || []);

        // Render Tables
        renderTables(market);

    } catch (err) {
        console.error('Failed to load data:', err);
    }
}

function renderStatCards(market) {
    const container = document.getElementById('statcards');
    container.innerHTML = `
        <div class="mck-statcard">
            <div class="mck-statcard__stat">${market.Nifty_50 ? market.Nifty_50.toLocaleString() : '--'}</div>
            <div class="mck-statcard__caption">Nifty 50 close</div>
            <div class="mck-statcard__body">Indian benchmark index closed slightly higher supported by lower crude oil.</div>
        </div>
        <div class="mck-statcard">
            <div class="mck-statcard__stat">${market.Sensex ? market.Sensex.toLocaleString() : '--'}</div>
            <div class="mck-statcard__caption">Sensex close</div>
            <div class="mck-statcard__body">Sensex rose 0.19% with steady buying in banking and auto counters.</div>
        </div>
        <div class="mck-statcard">
            <div class="mck-statcard__stat">₹14,329</div>
            <div class="mck-statcard__caption">24K Gold / Gram</div>
            <div class="mck-statcard__body">Physical 24K gold trading near ₹1,43,295 per 10g in domestic spot markets.</div>
        </div>
    `;
}

function renderHeroBullets(bullets) {
    const list = document.getElementById('hero-bullets-list');
    list.innerHTML = bullets.map(b => `
        <li class="mck-summary__point">
            <strong>${escapeHtml(b.headline)}</strong>
            <ul class="mck-summary__sub">
                <li>${escapeHtml(b.context)}</li>
            </ul>
        </li>
    `).join('');
}

function renderArticlesAndToc(articles) {
    const container = document.getElementById('dynamic-articles');
    const tocList = document.getElementById('index-list');
    
    container.innerHTML = '';
    tocList.innerHTML = `
        <li class="mck-index__item">
            <div class="mck-index__row">
                <a href="#snapshot" class="mck-index__link">
                    <span class="mck-index__num">01</span>
                    <span class="mck-index__label">Market snapshot</span>
                </a>
            </div>
        </li>
    `;

    articles.forEach((art, idx) => {
        const sectionId = `sec-${idx + 1}`;
        const sectionNumber = String(idx + 2).padStart(2, '0');

        // Append to Toc
        const tocLi = document.createElement('li');
        tocLi.className = 'mck-index__item';
        tocLi.innerHTML = `
            <div class="mck-index__row">
                <a href="#${sectionId}" class="mck-index__link">
                    <span class="mck-index__num">${sectionNumber}</span>
                    <span class="mck-index__label">${escapeHtml(art.category)}</span>
                </a>
            </div>
        `;
        tocList.appendChild(tocLi);

        // Append Section HTML
        const section = document.createElement('section');
        section.id = sectionId;
        
        let html = `<h2>${escapeHtml(art.category)}</h2>`;
        art.paragraphs.forEach(p => {
            html += `<p>${escapeHtml(p)}</p>`;
        });
        
        section.innerHTML = html;
        container.appendChild(section);
    });

    // Add Market tables to TOC
    const lastNum = String(articles.length + 2).padStart(2, '0');
    tocList.innerHTML += `
        <li class="mck-index__item">
            <div class="mck-index__row">
                <a href="#market-tables" class="mck-index__link">
                    <span class="mck-index__num">${lastNum}</span>
                    <span class="mck-index__label">Market Data Tables</span>
                </a>
            </div>
        </li>
    `;
}

function renderKeyInsights(insights) {
    const list = document.getElementById('summary-list');
    list.innerHTML = insights.map(insight => `
        <li class="mck-summary__point">${escapeHtml(insight)}</li>
    `).join('');
}

function renderTables(market) {
    const benchTbody = document.querySelector('#benchmark-table tbody');
    benchTbody.innerHTML = `
        <tr><td class="hi">Nifty 50</td><td class="num">${market.Nifty_50 || '--'}</td></tr>
        <tr><td class="hi">Sensex</td><td class="num">${market.Sensex || '--'}</td></tr>
        <tr><td>Nifty Bank</td><td class="num">${market.Nifty_Bank || '--'}</td></tr>
        <tr><td>Nifty Next 50</td><td class="num">${market.Nifty_Next_50 || '--'}</td></tr>
        <tr><td>Nifty Midcap</td><td class="num">${market.Nifty_Midcap || '--'}</td></tr>
    `;

    const commTbody = document.querySelector('#commodities-table tbody');
    commTbody.innerHTML = `
        <tr><td class="hi">24K Gold (1g Spot)</td><td class="num">₹${market.Gold_INR_1g ? market.Gold_INR_1g.toLocaleString() : '14,329.50'}</td></tr>
        <tr><td class="hi">Brent Crude ($/bbl)</td><td class="num">$${market.Brent_Crude || '82.50'}</td></tr>
        <tr><td>USD/INR</td><td class="num">₹${market.USD_INR || '95.17'}</td></tr>
        <tr><td>US 10Y Yield</td><td class="num">${market.US_10Y || '4.60'}%</td></tr>
    `;
}

function setupDrawerHandlers() {
    const indexFab = document.getElementById('index-fab');
    const indexOverlay = document.getElementById('index-overlay');
    const indexBackdrop = document.getElementById('index-backdrop');
    const indexClose = document.getElementById('index-close');

    const summaryOverlay = document.getElementById('summary-overlay');
    const summaryBackdrop = document.getElementById('summary-backdrop');
    const summaryClose = document.getElementById('summary-close');
    
    const openSummaryBtn1 = document.getElementById('open-summary-sticky');
    const openSummaryBtn2 = document.getElementById('open-summary-byline');

    // Index Drawer
    function openIndex() {
        indexOverlay.classList.add('is-open');
        indexBackdrop.classList.add('is-open');
    }
    function closeIndex() {
        indexOverlay.classList.remove('is-open');
        indexBackdrop.classList.remove('is-open');
    }
    indexFab.addEventListener('click', openIndex);
    indexClose.addEventListener('click', closeIndex);
    indexBackdrop.addEventListener('click', closeIndex);

    // Summary Drawer
    function openSummary() {
        summaryOverlay.classList.add('is-open');
        summaryBackdrop.classList.add('is-open');
    }
    function closeSummary() {
        summaryOverlay.classList.remove('is-open');
        summaryBackdrop.classList.remove('is-open');
    }
    if (openSummaryBtn1) openSummaryBtn1.addEventListener('click', openSummary);
    if (openSummaryBtn2) openSummaryBtn2.addEventListener('click', openSummary);
    summaryClose.addEventListener('click', closeSummary);
    summaryBackdrop.addEventListener('click', closeSummary);
}

function setupScrollHandler() {
    const stickybar = document.getElementById('stickybar');
    const progressBar = document.getElementById('read-progress');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        // Sticky Header toggle
        if (scrollTop > 200) {
            stickybar.classList.add('is-expanded');
        } else {
            stickybar.classList.remove('is-expanded');
        }

        // Reading Progress Bar
        if (docHeight > 0) {
            const progress = (scrollTop / docHeight) * 100;
            progressBar.style.width = `${progress}%`;
        }
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}
