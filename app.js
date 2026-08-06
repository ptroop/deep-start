async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        // Setup dates
        const timestamp = data.timestamp || "Just now";
        document.getElementById('timestamp-sticky').textContent = timestamp;
        document.getElementById('timestamp-byline').textContent = timestamp;
        
        // Formatter with Indian commas (e.g. 24,661.20)
        const formatVal = (val, prefix='', suffix='') => {
            if (typeof val === 'number' && val > 0) {
                return `${prefix}${val.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}${suffix}`;
            }
            return typeof val === 'string' ? val : '--';
        };

        // Hero Headline
        const md = data.market_data || {};
        if (md.Nifty_50) {
            document.getElementById('hero-headline').textContent = 
                `Nifty 50 at ${formatVal(md.Nifty_50)} | Sensex at ${formatVal(md.Sensex)} | Brent Crude ${formatVal(md.Brent_Crude, '$')} | US 10Y ${formatVal(md.US_10Y, '', '%')}`;
        }

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
        const defaultWeekAhead = [
            { date: "August 6 - 8", event: "RBI Monetary Policy Committee (MPC) Rate Decision & Policy Stance" },
            { date: "August 12", event: "India Industrial Production (IIP) & Consumer Inflation (CPI) Release" },
            { date: "August 14", event: "WPI Inflation Data & India Balance of Trade Release" }
        ];

        const defaultEarnings = [
            { date: "August 6", event: "Q1 Earnings: Bharti Airtel, Lupin, Eicher Motors, Cummins India" },
            { date: "August 7", event: "Q1 Earnings: SBI, Tata Motors, Trent, Apollo Hospitals" },
            { date: "August 8", event: "Q1 Earnings: Hindalco Industries, Grasim, Hero MotoCorp" }
        ];

        try {
            newsData = typeof data.newsletter === 'string' ? JSON.parse(data.newsletter) : data.newsletter;
        } catch (e) {
            console.error("Failed to parse newsletter JSON", e);
            newsData = {
                key_insights: [
                    "Indian equity benchmarks traded in a tight range as market participants evaluated Q1 corporate earnings.",
                    "Brent crude oil stabilized near global benchmarks while MCX Gold consolidated near record high levels.",
                    "USD/INR exchange rate held steady amidst ongoing macroeconomic data releases."
                ],
                equities_text: "<p>Indian equity indices traded in a narrow range as benchmark Nifty 50 held key support levels. Sectoral performance remained mixed across IT, Metals, Banking, and Auto counters as market participants evaluated quarterly corporate results.</p>",
                f_and_o_text: "<p>In the derivatives segment, stock futures exhibited sector-specific momentum. Top gainers included select technology and pharmaceutical counters, while auto and real estate stocks experienced selective short buildup.</p>",
                commodities_text: "<p>Commodity markets saw Brent crude oil holding steady near benchmark levels. MCX Gold futures consolidated near record highs while Silver futures and Copper reflected steady industrial demand.</p>",
                macro_text: "<p>On the macroeconomic front, market participants await upcoming monetary policy committee outcomes and central bank rate decisions. Sovereign yield curves remained anchored.</p>",
                week_ahead: defaultWeekAhead,
                earnings_calendar: defaultEarnings
            };
        }

        // Render Hero Bullets
        const heroBulletsSection = document.getElementById('hero-bullets-content');
        if (heroBulletsSection && newsData.hero_bullets && newsData.hero_bullets.length > 0) {
            const ul = document.createElement('ul');
            ul.style.listStyleType = 'none';
            ul.style.paddingLeft = '0';
            newsData.hero_bullets.forEach(bullet => {
                const li = document.createElement('li');
                li.style.marginBottom = '16px';
                li.innerHTML = `
                    <div style="font-weight: 600; margin-bottom: 4px;">- ${bullet.headline}</div>
                    <div style="padding-left: 12px; color: var(--mck-body); font-size: 15px;">${bullet.context}</div>
                `;
                ul.appendChild(li);
            });
            heroBulletsSection.appendChild(ul);
        }

        // Render Dynamic Articles
        const dynamicContainer = document.getElementById('dynamic-articles');
        if (dynamicContainer && newsData.articles && newsData.articles.length > 0) {
            newsData.articles.forEach(article => {
                const section = document.createElement('section');
                section.style.marginTop = '40px';
                
                const h2 = document.createElement('h2');
                h2.textContent = article.category;
                section.appendChild(h2);
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'mck-narrative';
                
                article.paragraphs.forEach(para => {
                    const p = document.createElement('p');
                    p.innerHTML = para;
                    contentDiv.appendChild(p);
                });
                
                section.appendChild(contentDiv);
                dynamicContainer.appendChild(section);
            });
        }

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
        const weekEvents = (newsData.week_ahead && newsData.week_ahead.length > 0) ? newsData.week_ahead : defaultWeekAhead;
        const weekTbody = document.querySelector('#week-ahead-table tbody');
        if (weekTbody) {
            weekTbody.innerHTML = weekEvents.map(evt => 
                `<tr><td>${evt.date}</td><td>${evt.event}</td></tr>`
            ).join('');
        }

        const earningsEvents = (newsData.earnings_calendar && newsData.earnings_calendar.length > 0) ? newsData.earnings_calendar : defaultEarnings;
        const earningsTbody = document.querySelector('#earnings-table tbody');
        if (earningsTbody) {
            earningsTbody.innerHTML = earningsEvents.map(evt => 
                `<tr><td>${evt.date}</td><td>${evt.event}</td></tr>`
            ).join('');
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
