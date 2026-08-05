async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        // Setup dates
        const timestamp = data.timestamp || "Just now";
        document.getElementById('timestamp-sticky').textContent = timestamp;
        document.getElementById('timestamp-byline').textContent = timestamp;
        
        // Hero Headline
        const md = data.market_data || {};
        if (md.Nifty_50) {
            document.getElementById('hero-headline').textContent = 
                `Nifty 50 at ${md.Nifty_50.toFixed(2)} | Sensex at ${md.Sensex ? md.Sensex.toFixed(2) : '--'} | Brent Crude $${md.Brent_Crude ? md.Brent_Crude.toFixed(2) : '--'} | US 10Y ${md.US_10Y ? md.US_10Y.toFixed(2) + '%' : '--'}`;
        }

        // Expanded Market Statcards (Grid of 6 key indicators)
        const formatVal = (val, prefix='', suffix='') => (typeof val === 'number' && val > 0) ? `${prefix}${val.toFixed(2)}${suffix}` : (typeof val === 'string' ? val : '--');
        
        const statcardsHtml = `
            <div class="mck-statcard">
                <div class="mck-statcard__stat">${formatVal(md.Nifty_50)}</div>
                <div class="mck-statcard__caption">Nifty 50</div>
                <div class="mck-statcard__body">Indian Equity Benchmark</div>
            </div>
            <div class="mck-statcard">
                <div class="mck-statcard__stat">${formatVal(md.Sensex)}</div>
                <div class="mck-statcard__caption">BSE Sensex</div>
                <div class="mck-statcard__body">30 Major Indian Corporates</div>
            </div>
            <div class="mck-statcard">
                <div class="mck-statcard__stat">${formatVal(md.US_10Y, '', '%')}</div>
                <div class="mck-statcard__caption">US 10Y Yield</div>
                <div class="mck-statcard__body">Global Risk-Free Rate</div>
            </div>
            <div class="mck-statcard">
                <div class="mck-statcard__stat">${formatVal(md.Brent_Crude, '$')}</div>
                <div class="mck-statcard__caption">Brent Crude</div>
                <div class="mck-statcard__body">Oil Benchmark (CAD Impact)</div>
            </div>
            <div class="mck-statcard">
                <div class="mck-statcard__stat">${formatVal(md.USD_INR, '₹')}</div>
                <div class="mck-statcard__caption">USD / INR</div>
                <div class="mck-statcard__body">FX Rate</div>
            </div>
            <div class="mck-statcard">
                <div class="mck-statcard__stat">${formatVal(md.Gold_INR_1g, '₹')}</div>
                <div class="mck-statcard__caption">Gold / 1g</div>
                <div class="mck-statcard__body">Safe-Haven (INR)</div>
            </div>
            <div class="mck-statcard">
                <div class="mck-statcard__stat">${formatVal(md.Silver, '$')}</div>
                <div class="mck-statcard__caption">Silver / oz</div>
                <div class="mck-statcard__body">Precious Metal</div>
            </div>
            <div class="mck-statcard">
                <div class="mck-statcard__stat">${formatVal(md.Copper, '$')}</div>
                <div class="mck-statcard__caption">Copper</div>
                <div class="mck-statcard__body">Industrial Metal</div>
            </div>
            <div class="mck-statcard">
                <div class="mck-statcard__stat">${formatVal(md.VIX)}</div>
                <div class="mck-statcard__caption">VIX</div>
                <div class="mck-statcard__body">Volatility (Fear Index)</div>
            </div>
            <div class="mck-statcard">
                <div class="mck-statcard__stat">${formatVal(md.DXY)}</div>
                <div class="mck-statcard__caption">DXY</div>
                <div class="mck-statcard__body">US Dollar Strength</div>
            </div>
        `;
        document.getElementById('market-statcards').innerHTML = statcardsHtml;

        // Render Yield Curve Chart
        const chartCanvas = document.getElementById('yieldCurveChart');
        if (chartCanvas) {
            const ctx = chartCanvas.getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['2 Year', '10 Year'],
                    datasets: [{
                        label: 'US Treasury Yield (%)',
                        data: [md.US_2Y || null, md.US_10Y || null],
                        borderColor: '#051C2C',
                        backgroundColor: '#051C2C',
                        borderWidth: 2,
                        tension: 0,
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            grid: { color: '#E6E6E6' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });
        }

        // Render AI Newsletter Markdown
        const newsletterMd = data.newsletter || "No newsletter data available.";
        const html = marked.parse(newsletterMd);
        document.getElementById('newsletter-content').innerHTML = html;
        
    } catch (error) {
        console.error("Error loading data:", error);
        document.getElementById('hero-headline').textContent = "ERROR LOADING DATA. PLEASE CHECK BACK LATER.";
        document.getElementById('newsletter-content').innerHTML = "<p>Failed to load the daily digest.</p>";
    }
}

document.addEventListener('DOMContentLoaded', loadData);
