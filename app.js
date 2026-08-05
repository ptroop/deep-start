async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        // Setup dates
        const timestamp = data.timestamp || "Just now";
        document.getElementById('timestamp-sticky').textContent = timestamp;
        document.getElementById('timestamp-byline').textContent = timestamp;
        
        // Headline
        if (data.market_data && data.market_data.Nifty_50) {
            document.getElementById('hero-headline').textContent = `The Nifty 50 traded at ${data.market_data.Nifty_50.toFixed(2)} and the US 10Y Yield stood at ${typeof data.market_data.US_10Y === 'number' ? data.market_data.US_10Y.toFixed(2) : '--'}%.`;
        }

        // Market Statcards
        const md = data.market_data || {};
        const statcardsHtml = `
            <div class="mck-statcard">
                <div class="mck-statcard__stat">${typeof md.Nifty_50 === 'number' ? md.Nifty_50.toFixed(2) : '--'}</div>
                <div class="mck-statcard__caption">Nifty 50</div>
                <div class="mck-statcard__body">Indian Equity Benchmark</div>
            </div>
            <div class="mck-statcard">
                <div class="mck-statcard__stat">${typeof md.US_10Y === 'number' ? md.US_10Y.toFixed(2) + '%' : '--'}</div>
                <div class="mck-statcard__caption">US 10Y Yield</div>
                <div class="mck-statcard__body">Global benchmark for risk-free rates</div>
            </div>
            <div class="mck-statcard">
                <div class="mck-statcard__stat">${md.Fed_Rate_Cut_Prob || '--'}</div>
                <div class="mck-statcard__caption">Fed Cut Prob</div>
                <div class="mck-statcard__body">Market expectations for next policy meeting</div>
            </div>
        `;
        document.getElementById('market-statcards').innerHTML = statcardsHtml;

        // Render AI Newsletter Markdown
        const newsletterMd = data.newsletter || "No newsletter data available.";
        // Custom styling for markdown elements rendered inside our article
        const html = marked.parse(newsletterMd);
        document.getElementById('newsletter-content').innerHTML = html;
        
    } catch (error) {
        console.error("Error loading data:", error);
        document.getElementById('hero-headline').textContent = "ERROR LOADING DATA. PLEASE CHECK BACK LATER.";
        document.getElementById('newsletter-content').innerHTML = "<p>Failed to load the daily digest.</p>";
    }
}

document.addEventListener('DOMContentLoaded', loadData);
