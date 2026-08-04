async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        document.getElementById('timestamp').textContent = `AS OF: ${data.timestamp}`;
        
        // Populate Market Data
        document.getElementById('us-10y').textContent = data.market_data.US_10Y.toFixed(2) + '%';
        document.getElementById('india-10y').textContent = data.market_data.India_10Y.toFixed(2) + '%';
        document.getElementById('fed-prob').textContent = data.market_data.Fed_Rate_Cut_Prob;
        
        // Populate Deals
        const dealsList = document.getElementById('deals-list');
        data.deals.forEach(deal => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>[${deal.type}]</strong> ${deal.title}`;
            dealsList.appendChild(li);
        });
        
        // Populate Summaries
        const summaryList = document.getElementById('summary-list');
        data.summaries.forEach(summary => {
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
