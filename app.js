async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        document.getElementById('timestamp').textContent = `AS OF: ${data.timestamp}`;
        
        // Populate Market Data safely
        const md = data.market_data || {};
        document.getElementById('us-10y').textContent = typeof md.US_10Y === 'number' ? md.US_10Y.toFixed(2) + '%' : '--';
        document.getElementById('india-10y').textContent = typeof md.India_10Y === 'number' ? md.India_10Y.toFixed(2) + '%' : '--';
        document.getElementById('fed-prob').textContent = md.Fed_Rate_Cut_Prob || '--';
        
        // Populate Deals
        const dealsList = document.getElementById('deals-list');
        (data.deals || []).forEach(deal => {
            const li = document.createElement('li');
            const typeSpan = document.createElement('strong');
            typeSpan.textContent = `[${deal.type}] `;
            li.appendChild(typeSpan);
            li.appendChild(document.createTextNode(deal.title || ''));
            dealsList.appendChild(li);
        });
        
        // Populate Summaries
        const summaryList = document.getElementById('summary-list');
        (data.summaries || []).forEach(summary => {
            const li = document.createElement('li');
            li.textContent = summary;
            summaryList.appendChild(li);
        });
        
    } catch (error) {
        console.error("Error loading data:", error);
        document.getElementById('timestamp').textContent = "ERROR LOADING DATA";
    }
}

document.addEventListener('DOMContentLoaded', loadData);
