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
                <div class="mck-statcard__body">Oil Benchmark</div>
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
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: false, grid: { color: '#E6E6E6' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // --- Render JSON Sections ---
        let newsData = {};
        try {
            newsData = typeof data.newsletter === 'string' ? JSON.parse(data.newsletter) : data.newsletter;
        } catch (e) {
            console.error("Failed to parse newsletter JSON", e);
            newsData = {
                key_insights: ["Failed to load AI insights. Format error."],
                equities_text: "Error loading equities text.",
                f_and_o_text: "Error loading F&O text.",
                commodities_text: "Error loading commodities text.",
                macro_text: "Error loading macro text.",
                week_ahead: [],
                earnings_calendar: []
            };
        }

        // Narratives
        document.getElementById('equities-narrative').innerHTML = newsData.equities_text || "";
        document.getElementById('f-and-o-narrative').innerHTML = newsData.f_and_o_text || "";
        document.getElementById('commodities-narrative').innerHTML = newsData.commodities_text || "";
        document.getElementById('macro-narrative').innerHTML = newsData.macro_text || "";

        // Key Insights
        if (newsData.key_insights && newsData.key_insights.length > 0) {
            const insightsHtml = `<ul>${newsData.key_insights.map(i => `<li>${i}</li>`).join('')}</ul>`;
            document.getElementById('insights-content').innerHTML = insightsHtml;
        }

        // Helper to format table rows
        const createRow = (name, price) => {
            return `<tr><td>${name}</td><td>${formatVal(price)}</td></tr>`;
        };

        // Populate Tables
        const benchTbody = document.querySelector('#benchmark-table tbody');
        if (benchTbody) {
            benchTbody.innerHTML = `
                ${createRow('Nifty 50', md.Nifty_50)}
                ${createRow('Sensex', md.Sensex)}
                ${createRow('Nifty Bank', md.Nifty_Bank)}
                ${createRow('Nifty Next 50', md.Nifty_Next_50)}
                ${createRow('Nifty Midcap 50', md.Nifty_Midcap)}
                ${createRow('Nifty Smallcap 250', md.Nifty_Smallcap)}
            `;
        }

        const sectoralTbody = document.querySelector('#sectoral-table tbody');
        if (sectoralTbody) {
            sectoralTbody.innerHTML = `
                ${createRow('Nifty Auto', md.Nifty_Auto)}
                ${createRow('Nifty Energy', md.Nifty_Energy)}
                ${createRow('Nifty FMCG', md.Nifty_FMCG)}
                ${createRow('Nifty IT', md.Nifty_IT)}
                ${createRow('Nifty Metal', md.Nifty_Metal)}
                ${createRow('Nifty Pharma', md.Nifty_Pharma)}
                ${createRow('Nifty Realty', md.Nifty_Realty)}
            `;
        }

        const commTbody = document.querySelector('#commodities-table tbody');
        if (commTbody) {
            commTbody.innerHTML = `
                ${createRow('Gold (per oz)', md.Gold)}
                ${createRow('Silver', md.Silver)}
                ${createRow('Copper', md.Copper)}
                ${createRow('Crude Oil', md.Crude_Oil)}
                ${createRow('Natural Gas', md.Natural_Gas)}
                ${createRow('USD/INR', md.USD_INR)}
            `;
        }
        
        // Events Tables
        const weekTbody = document.querySelector('#week-ahead-table tbody');
        if (weekTbody) {
            if (newsData.week_ahead && newsData.week_ahead.length > 0) {
                weekTbody.innerHTML = newsData.week_ahead.map(evt => 
                    `<tr><td>${evt.date}</td><td>${evt.event}</td></tr>`
                ).join('');
                const figure = weekTbody.closest('figure');
                if (figure) figure.style.display = 'block';
            } else {
                const figure = weekTbody.closest('figure');
                if (figure) figure.style.display = 'none';
            }
        }

        const earningsTbody = document.querySelector('#earnings-table tbody');
        if (earningsTbody) {
            if (newsData.earnings_calendar && newsData.earnings_calendar.length > 0) {
                earningsTbody.innerHTML = newsData.earnings_calendar.map(evt => 
                    `<tr><td>${evt.date}</td><td>${evt.event}</td></tr>`
                ).join('');
                const figure = earningsTbody.closest('figure');
                if (figure) figure.style.display = 'block';
            } else {
                const figure = earningsTbody.closest('figure');
                if (figure) figure.style.display = 'none';
            }
        }

        // Drawer Event Listeners
        const openBtn = document.getElementById('open-insights');
        const closeBtn = document.getElementById('close-insights');
        const drawer = document.getElementById('insights-drawer');
        const overlay = document.getElementById('insights-overlay');

        if(openBtn && closeBtn && drawer && overlay) {
            openBtn.addEventListener('click', () => {
                drawer.setAttribute('aria-hidden', 'false');
                overlay.setAttribute('aria-hidden', 'false');
            });
            const closeDrawer = () => {
                drawer.setAttribute('aria-hidden', 'true');
                overlay.setAttribute('aria-hidden', 'true');
            };
            closeBtn.addEventListener('click', closeDrawer);
            overlay.addEventListener('click', closeDrawer);
        }

    } catch (error) {
        console.error("Error loading data:", error);
        document.getElementById('hero-headline').textContent = "ERROR LOADING DATA. PLEASE CHECK BACK LATER.";
    }
}

document.addEventListener('DOMContentLoaded', loadData);
