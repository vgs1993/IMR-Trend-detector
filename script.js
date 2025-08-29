// Sample data structure - replace with your actual data
let metricsData = {
    // This will be populated with your actual data
    // Structure: productName: { metricName: [{ date: 'YYYY-MM-DD', value: percentage }] }
};

let currentChart = null;

// DOM elements
const excelFileInput = document.getElementById('excelFile');
const loadDataBtn = document.getElementById('loadDataBtn');
const productSelect = document.getElementById('productSelect');
const metricSelect = document.getElementById('metricSelect');
const refreshBtn = document.getElementById('refreshBtn');
const aiAnalysisBtn = document.getElementById('aiAnalysisBtn');
const dataInfo = document.getElementById('dataInfo');
const dataDetails = document.getElementById('dataDetails');
const aiAnalysisSection = document.getElementById('aiAnalysisSection');
const analysisLoading = document.getElementById('analysisLoading');
const analysisResults = document.getElementById('analysisResults');

// Initialize the dashboard
function initializeDashboard() {
    // Load data from CSV file first
    loadCSVData();
    setupEventListeners();
}

// Load CSV data from sample-your-format.csv
async function loadCSVData() {
    try {
        const response = await fetch('./sample-your-format.csv');
        const csvText = await response.text();
        
        // Parse CSV
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        const jsonData = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length >= headers.length && values[0]) { // Skip empty lines
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                jsonData.push(row);
            }
        }
        
        // Parse the CSV data using our existing parser
        const parsedData = {};
        parsedData['Sample Product'] = parseSheetData(jsonData, 'Sample Product');
        
        if (Object.keys(parsedData['Sample Product']).length > 0) {
            metricsData = parsedData;
            populateProductDropdown();
            productSelect.disabled = false;
            showDataInfo(`CSV data loaded: ${Object.keys(parsedData['Sample Product']).join(', ')}`);
            console.log('Loaded CSV data:', parsedData);
        } else {
            // Fallback to sample data if CSV parsing fails
            loadSampleData();
            populateProductDropdown();
            showDataInfo("Sample data loaded for demonstration");
        }
        
    } catch (error) {
        console.error('Error loading CSV file:', error);
        // Fallback to sample data
        loadSampleData();
        populateProductDropdown();
        showDataInfo("Sample data loaded for demonstration (CSV load failed)");
    }
}

// Load sample data (replace with your actual data loading)
function loadSampleData() {
    // This is sample data - you'll replace this with your actual data
    metricsData = {
        'Product A': {
            'Performance Score': generateSampleData(85, 5),
            'Quality Index': generateSampleData(92, 3),
            'User Satisfaction': generateSampleData(78, 7)
        },
        'Product B': {
            'Performance Score': generateSampleData(76, 8),
            'Reliability Score': generateSampleData(89, 4),
            'Speed Index': generateSampleData(82, 6)
        },
        'Product C': {
            'Performance Score': generateSampleData(91, 3),
            'Quality Index': generateSampleData(87, 5),
            'Innovation Score': generateSampleData(94, 2)
        }
    };
}

// Generate sample data for the past 2 months
function generateSampleData(baseValue, variance) {
    const data = [];
    const today = new Date();
    
    for (let i = 60; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Generate some realistic variation with occasional drops
        let value = baseValue + (Math.random() - 0.5) * variance;
        
        // Occasionally create significant drops (>2%)
        if (Math.random() < 0.1) {
            value -= (2.5 + Math.random() * 3); // Drop of 2.5-5.5%
        }
        
        // Ensure value stays within reasonable bounds
        value = Math.max(0, Math.min(100, value));
        
        data.push({
            date: date.toISOString().split('T')[0],
            value: Math.round(value * 100) / 100
        });
    }
    
    return data;
}

// Load Excel data
function loadExcelData(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Parse the workbook
            const parsedData = parseExcelWorkbook(workbook);
            
            if (Object.keys(parsedData).length === 0) {
                alert('No valid data found in the Excel file. Please check the format.');
                return;
            }
            
            // Load the parsed data
            metricsData = parsedData;
            populateProductDropdown();
            clearDashboard();
            
            // Enable product selection
            productSelect.disabled = false;
            
            // Show data info
            showDataInfo(`Excel file loaded: ${Object.keys(parsedData).length} products found`);
            
            console.log('Loaded data:', parsedData);
            
        } catch (error) {
            console.error('Error parsing Excel file:', error);
            alert('Error reading Excel file. Please ensure it\'s a valid .xlsx or .xls file.');
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// Parse Excel workbook into our data structure
function parseExcelWorkbook(workbook) {
    const parsedData = {};
    
    // Method 1: Each sheet represents a product
    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) return;
        
        // Try to parse the sheet data
        const productData = parseSheetData(jsonData, sheetName);
        if (productData && Object.keys(productData).length > 0) {
            parsedData[sheetName] = productData;
        }
    });
    
    return parsedData;
}

// Parse individual sheet data
function parseSheetData(jsonData, sheetName) {
    const productMetrics = {};
    
    if (jsonData.length === 0) return productMetrics;
    
    const firstRow = jsonData[0];
    const columns = Object.keys(firstRow);
    
    // Format 1: Your custom format with Date - Year, Date - Quarter, Date - Month, Date - Day, Value, VanityName
    if (columns.includes('Date - Year') && columns.includes('Date - Month') && 
        columns.includes('Date - Day') && columns.includes('Value') && 
        columns.includes('VanityName')) {
        
        // Group data by VanityName (this becomes the metric name)
        const metricGroups = {};
        
        jsonData.forEach(row => {
            const year = parseInt(row['Date - Year']);
            const month = parseInt(row['Date - Month']);
            const day = parseInt(row['Date - Day']);
            const value = parseFloat(row['Value']);
            const metricName = row['VanityName'];
            
            // Create date from year, month, day
            if (!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(value) && metricName) {
                const date = new Date(year, month - 1, day); // month is 0-based in JS
                const dateString = date.toISOString().split('T')[0];
                
                if (!metricGroups[metricName]) {
                    metricGroups[metricName] = {};
                }
                
                // Use object to handle duplicates - latest entry wins
                metricGroups[metricName][dateString] = value;
            }
        });
        
        // Convert to array format and sort each metric group by date
        Object.keys(metricGroups).forEach(metricName => {
            productMetrics[metricName] = [];
            
            Object.keys(metricGroups[metricName]).forEach(dateString => {
                productMetrics[metricName].push({
                    date: dateString,
                    value: metricGroups[metricName][dateString]
                });
            });
            
            // Sort by date
            productMetrics[metricName].sort((a, b) => new Date(a.date) - new Date(b.date));
        });
        
        return productMetrics;
    }
    
    // Format 2: Date + multiple metric columns
    else if (columns.includes('Date') || columns.includes('date')) {
        const dateColumn = columns.find(col => 
            col.toLowerCase() === 'date' || 
            col.toLowerCase().includes('date')
        );
        
        // Get metric columns (all columns except date)
        const metricColumns = columns.filter(col => 
            col !== dateColumn && 
            !col.toLowerCase().includes('date')
        );
        
        metricColumns.forEach(metricName => {
            productMetrics[metricName] = [];
            
            jsonData.forEach(row => {
                const date = parseDate(row[dateColumn]);
                const value = parseFloat(row[metricName]);
                
                if (date && !isNaN(value)) {
                    productMetrics[metricName].push({
                        date: date,
                        value: value
                    });
                }
            });
            
            // Sort by date
            if (productMetrics[metricName].length > 0) {
                productMetrics[metricName].sort((a, b) => new Date(a.date) - new Date(b.date));
            }
        });
    }
    
    // Format 3: Product, Metric, Date, Value columns
    else if (columns.includes('Product') && columns.includes('Metric') && columns.includes('Value')) {
        // This format allows multiple products in one sheet
        const currentSheetData = {};
        
        jsonData.forEach(row => {
            const product = row['Product'];
            const metric = row['Metric'];
            const date = parseDate(row['Date']);
            const value = parseFloat(row['Value']);
            
            if (product && metric && date && !isNaN(value)) {
                if (!currentSheetData[product]) {
                    currentSheetData[product] = {};
                }
                if (!currentSheetData[product][metric]) {
                    currentSheetData[product][metric] = [];
                }
                
                currentSheetData[product][metric].push({
                    date: date,
                    value: value
                });
            }
        });
        
        // Sort all metrics by date
        Object.keys(currentSheetData).forEach(product => {
            Object.keys(currentSheetData[product]).forEach(metric => {
                currentSheetData[product][metric].sort((a, b) => new Date(a.date) - new Date(b.date));
            });
        });
        
        // If multiple products found, return the first one for this sheet
        const productNames = Object.keys(currentSheetData);
        if (productNames.length > 0) {
            return currentSheetData[productNames[0]];
        }
    }
    
    return productMetrics;
}

// Parse various date formats
function parseDate(dateValue) {
    if (!dateValue) return null;
    
    // If it's already a Date object
    if (dateValue instanceof Date) {
        return dateValue.toISOString().split('T')[0];
    }
    
    // If it's a string, try to parse it
    if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    }
    
    // If it's an Excel serial number
    if (typeof dateValue === 'number') {
        const excelDate = XLSX.SSF.parse_date_code(dateValue);
        if (excelDate) {
            const date = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
            return date.toISOString().split('T')[0];
        }
    }
    
    return null;
}

// Show data information
function showDataInfo(message) {
    dataInfo.style.display = 'block';
    dataDetails.innerHTML = `
        <div class="data-detail">${message}</div>
        <div class="data-detail">Products: ${Object.keys(metricsData).join(', ')}</div>
        <div class="data-detail">Total Metrics: ${Object.values(metricsData).reduce((total, product) => 
            total + Object.keys(product).length, 0)}</div>
    `;
}

// Populate product dropdown
function populateProductDropdown() {
    productSelect.innerHTML = '<option value="">Choose a product...</option>';
    
    Object.keys(metricsData).forEach(product => {
        const option = document.createElement('option');
        option.value = product;
        option.textContent = product;
        productSelect.appendChild(option);
    });
}

// Populate metric dropdown based on selected product
function populateMetricDropdown(product) {
    metricSelect.innerHTML = '<option value="">Choose a metric...</option>';
    metricSelect.disabled = false;
    
    if (metricsData[product]) {
        Object.keys(metricsData[product]).forEach(metric => {
            const option = document.createElement('option');
            option.value = metric;
            option.textContent = metric;
            metricSelect.appendChild(option);
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Excel file input change
    excelFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        loadDataBtn.disabled = !file;
    });

    // Load data button
    loadDataBtn.addEventListener('click', () => {
        const file = excelFileInput.files[0];
        if (file) {
            loadExcelData(file);
        }
    });

    productSelect.addEventListener('change', (e) => {
        const selectedProduct = e.target.value;
        if (selectedProduct) {
            populateMetricDropdown(selectedProduct);
            refreshBtn.disabled = false;
            aiAnalysisBtn.disabled = false;
        } else {
            metricSelect.innerHTML = '<option value="">Choose a metric...</option>';
            metricSelect.disabled = true;
            refreshBtn.disabled = true;
            aiAnalysisBtn.disabled = true;
            clearDashboard();
        }
    });

    metricSelect.addEventListener('change', () => {
        updateDashboard();
    });

    refreshBtn.addEventListener('click', () => {
        updateDashboard();
    });

    // AI Analysis button
    aiAnalysisBtn.addEventListener('click', () => {
        runAIAnalysis();
    });
}

// Update dashboard with selected data
function updateDashboard() {
    const selectedProduct = productSelect.value;
    const selectedMetric = metricSelect.value;
    
    if (!selectedProduct || !selectedMetric) {
        clearDashboard();
        return;
    }
    
    const data = metricsData[selectedProduct][selectedMetric];
    if (!data) {
        clearDashboard();
        return;
    }
    
    updateChart(data, selectedProduct, selectedMetric);
}

// Update the line chart
function updateChart(data, product, metric) {
    const ctx = document.getElementById('metricsChart').getContext('2d');
    
    // Destroy existing chart
    if (currentChart) {
        currentChart.destroy();
    }
    
    const labels = data.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const values = data.map(item => item.value);
    
    // Simple color coding - keep the threshold line but simplify point colors
    const backgroundColors = values.map((value) => {
        return value < 98 ? 'rgba(243, 156, 18, 0.8)' : 'rgba(102, 126, 234, 0.8)';
    });
    
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${metric} (%)`,
                data: values,
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: backgroundColors,
                pointBorderColor: backgroundColors,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${product} - ${metric} Trend`,
                    font: {
                        size: 18,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
                            if (context.parsed.y < 98) {
                                label += ` (Below 98% threshold)`;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 90,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });

    // Add horizontal line at 98% threshold
    const chartArea = currentChart.chartArea;
    const ctx2 = currentChart.ctx;
    
    // Add custom plugin for threshold line
    Chart.register({
        id: 'thresholdLine',
        afterDraw: function(chart) {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const yScale = chart.scales.y;
            
            const thresholdValue = 98;
            const yPosition = yScale.getPixelForValue(thresholdValue);
            
            ctx.save();
            ctx.strokeStyle = 'rgba(243, 156, 18, 0.8)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(chartArea.left, yPosition);
            ctx.lineTo(chartArea.right, yPosition);
            ctx.stroke();
            
            // Add label
            ctx.fillStyle = 'rgba(243, 156, 18, 1)';
            ctx.font = 'bold 12px Arial';
            ctx.fillText('98% Threshold', chartArea.left + 5, yPosition - 5);
            ctx.restore();
        }
    });
}

// Update statistics panel
function updateStats(data) {
    const values = data.map(item => item.value);
    const currentValue = values[values.length - 1];
    const previousValue = values[values.length - 2];
    
    const trend = currentValue - previousValue;
    trendValueEl.textContent = `${trend >= 0 ? '+' : ''}${trend.toFixed(2)}%`;
    trendValueEl.className = `stat-value ${trend >= 0 ? 'trend-positive' : 'trend-negative'}`;
    
    const drops = identifySignificantDrops(data);
    alertsCountEl.textContent = drops.length;
    
    const thresholdAlerts = identifyThresholdAlerts(data);
    thresholdAlertsEl.textContent = thresholdAlerts.length;
}

// Identify significant drops (>2%)
function identifySignificantDrops(data) {
    const drops = [];
    
    for (let i = 1; i < data.length; i++) {
        const currentValue = data[i].value;
        const previousValue = data[i - 1].value;
        const drop = previousValue - currentValue;
        
        if (drop > 2) {
            drops.push({
                index: i,
                date: data[i].date,
                currentValue: currentValue,
                previousValue: previousValue,
                dropAmount: drop
            });
        }
    }
    
    return drops;
}

// Identify values below 98% threshold
function identifyThresholdAlerts(data) {
    const alerts = [];
    
    for (let i = 0; i < data.length; i++) {
        const value = data[i].value;
        
        if (value < 98) {
            alerts.push({
                index: i,
                date: data[i].date,
                value: value,
                threshold: 98
            });
        }
    }
    
    return alerts;
}

// Update alerts section
// Update alerts section
function updateAlerts(data) {
    const drops = identifySignificantDrops(data);
    const thresholdAlerts = identifyThresholdAlerts(data);
    
    // Update >2% drops section
    if (drops.length > 0) {
        alertsSection.style.display = 'block';
        alertsList.innerHTML = '';
        
        drops.forEach(drop => {
            const alertItem = document.createElement('div');
            alertItem.className = 'alert-item';
            alertItem.innerHTML = `
                <div>
                    <div class="alert-date">${new Date(drop.date).toLocaleDateString()}</div>
                    <div>Dropped from ${drop.previousValue.toFixed(2)}% to ${drop.currentValue.toFixed(2)}%</div>
                </div>
                <div class="alert-drop">-${drop.dropAmount.toFixed(2)}%</div>
            `;
            alertsList.appendChild(alertItem);
        });
    } else {
        alertsSection.style.display = 'none';
    }
    
    // Update <98% threshold alerts section
    if (thresholdAlerts.length > 0) {
        thresholdAlertsSection.style.display = 'block';
        thresholdAlertsList.innerHTML = '';
        
        thresholdAlerts.forEach(alert => {
            const alertItem = document.createElement('div');
            alertItem.className = 'alert-item';
            alertItem.innerHTML = `
                <div>
                    <div class="alert-date">${new Date(alert.date).toLocaleDateString()}</div>
                    <div>Value below 98% threshold</div>
                </div>
                <div class="alert-drop">${alert.value.toFixed(2)}%</div>
            `;
            thresholdAlertsList.appendChild(alertItem);
        });
    } else {
        thresholdAlertsSection.style.display = 'none';
    }
}

// AI Analysis function
async function runAIAnalysis() {
    const selectedProduct = productSelect.value;
    const selectedMetric = metricSelect.value;
    
    if (!selectedProduct || !selectedMetric) {
        alert('Please select both a product and metric before running AI analysis.');
        return;
    }
    
    // Show the analysis section and loading spinner
    aiAnalysisSection.style.display = 'block';
    analysisLoading.style.display = 'flex';
    analysisResults.innerHTML = '';
    
    try {
        // Get the current data
        const data = metricsData[selectedProduct][selectedMetric];
        
        // Simulate AI analysis (replace with actual API call)
        const analysisResult = await performAIAnalysis(data, selectedProduct, selectedMetric);
        
        // Hide loading and show results
        analysisLoading.style.display = 'none';
        displayAnalysisResults(analysisResult);
        
    } catch (error) {
        analysisLoading.style.display = 'none';
        analysisResults.innerHTML = `
            <div class="analysis-result">
                <h4>❌ Analysis Error</h4>
                <p>Failed to perform AI analysis: ${error.message}</p>
                <p>Please check your internet connection and try again.</p>
            </div>
        `;
    }
}

// Simulate AI analysis (replace with actual API integration)
async function performAIAnalysis(data, product, metric) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Analyze the data for patterns and correlations
    const analysisResult = {
        summary: generateAnalysisSummary(data, metric),
        correlations: generateCorrelationAnalysis(data),
        recommendations: generateRecommendations(data, metric),
        timeline: generateTimelineAnalysis(data)
    };
    
    return analysisResult;
}

// Generate analysis summary
function generateAnalysisSummary(data, metric) {
    const values = data.map(d => d.value);
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const below98Count = values.filter(v => v < 98).length;
    
    return {
        avgValue: avgValue.toFixed(2),
        minValue: minValue.toFixed(2),
        maxValue: maxValue.toFixed(2),
        below98Count: below98Count,
        totalDays: data.length,
        below98Percentage: ((below98Count / data.length) * 100).toFixed(1)
    };
}

// Generate correlation analysis with system updates
function generateCorrelationAnalysis(data) {
    const correlations = [];
    
    // Simulate driver/OS update correlations
    const drops = [];
    for (let i = 1; i < data.length; i++) {
        const drop = data[i-1].value - data[i].value;
        if (drop > 1) { // Significant drops > 1%
            drops.push({
                date: data[i].date,
                drop: drop,
                fromValue: data[i-1].value,
                toValue: data[i].value
            });
        }
    }
    
    // Simulate potential correlations
    drops.forEach((drop, index) => {
        const updateTypes = ['Windows Update', 'Graphics Driver Update', 'Network Driver Update', 'BIOS Update', 'Security Patch'];
        const randomUpdate = updateTypes[Math.floor(Math.random() * updateTypes.length)];
        const correlationStrength = drop.drop > 2 ? 'High' : drop.drop > 1.5 ? 'Medium' : 'Low';
        
        correlations.push({
            date: drop.date,
            updateType: randomUpdate,
            correlation: correlationStrength,
            impact: `${drop.drop.toFixed(2)}% decrease`,
            details: `${randomUpdate} deployed around ${drop.date} may have contributed to performance decrease from ${drop.fromValue.toFixed(2)}% to ${drop.toValue.toFixed(2)}%`
        });
    });
    
    return correlations;
}

// Generate recommendations
function generateRecommendations(data, metric) {
    const recommendations = [];
    const values = data.map(d => d.value);
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
    const below98Count = values.filter(v => v < 98).length;
    
    if (below98Count > 0) {
        recommendations.push({
            priority: 'High',
            title: 'Address Below-Threshold Performance',
            description: `${below98Count} days showed ${metric} below 98% threshold. Consider implementing performance monitoring and rollback procedures for system updates.`
        });
    }
    
    if (avgValue < 97) {
        recommendations.push({
            priority: 'Medium',
            title: 'Improve Overall Performance',
            description: `Average ${metric} is ${avgValue.toFixed(2)}%. Consider proactive maintenance and testing procedures before deploying updates.`
        });
    }
    
    recommendations.push({
        priority: 'Low',
        title: 'Implement Predictive Monitoring',
        description: 'Set up automated alerts and correlation tracking with system update schedules to prevent performance regressions.'
    });
    
    return recommendations;
}

// Generate timeline analysis
function generateTimelineAnalysis(data) {
    const timeline = [];
    const significantEvents = [];
    
    for (let i = 1; i < data.length; i++) {
        const drop = data[i-1].value - data[i].value;
        if (drop > 1.5) {
            significantEvents.push({
                date: data[i].date,
                type: 'Performance Drop',
                magnitude: drop.toFixed(2),
                description: `Significant decrease of ${drop.toFixed(2)}% detected`
            });
        }
    }
    
    return significantEvents;
}

// Display analysis results
function displayAnalysisResults(result) {
    analysisResults.innerHTML = `
        <div class="analysis-result">
            <h4>📊 Performance Summary</h4>
            <p><strong>Average Value:</strong> ${result.summary.avgValue}%</p>
            <p><strong>Range:</strong> ${result.summary.minValue}% - ${result.summary.maxValue}%</p>
            <p><strong>Below 98% Threshold:</strong> ${result.summary.below98Count} days (${result.summary.below98Percentage}% of time)</p>
        </div>

        <div class="analysis-result">
            <h4>🔗 System Update Correlations</h4>
            ${result.correlations.length > 0 ? 
                result.correlations.map(corr => `
                    <div class="correlation-item correlation-${corr.correlation.toLowerCase()}">
                        <div>
                            <strong>${corr.updateType}</strong> - ${corr.date}
                            <br><small>${corr.details}</small>
                        </div>
                        <div class="correlation-score score-${corr.correlation.toLowerCase()}">
                            ${corr.correlation}
                        </div>
                    </div>
                `).join('') : 
                '<p>No significant correlations with system updates detected.</p>'
            }
        </div>

        <div class="analysis-result">
            <h4>💡 Recommendations</h4>
            ${result.recommendations.map(rec => `
                <div class="correlation-item">
                    <div>
                        <strong>[${rec.priority} Priority]</strong> ${rec.title}
                        <br><small>${rec.description}</small>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="analysis-result">
            <h4>📅 Timeline Analysis</h4>
            ${result.timeline.length > 0 ?
                result.timeline.map(event => `
                    <div class="correlation-item">
                        <div>
                            <strong>${event.date}</strong> - ${event.type}
                            <br><small>${event.description}</small>
                        </div>
                        <div class="correlation-score score-high">
                            -${event.magnitude}%
                        </div>
                    </div>
                `).join('') :
                '<p>No significant performance events detected in timeline.</p>'
            }
        </div>

        <div class="analysis-result">
            <h4>🤖 AI Integration Notes</h4>
            <p><strong>Next Steps:</strong> This analysis can be enhanced by connecting to:</p>
            <ul style="margin-left: 20px; margin-top: 10px;">
                <li>Windows Update logs and deployment schedules</li>
                <li>Driver update tracking systems</li>
                <li>Change management databases</li>
                <li>Performance monitoring APIs</li>
                <li>Machine learning models for predictive analysis</li>
            </ul>
        </div>
    `;
}

// Clear dashboard
function clearDashboard() {
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
}

// Function to load your actual data
function loadActualData(data) {
    // Replace the sample data with your actual data
    // Expected format:
    // {
    //     'ProductName': {
    //         'MetricName': [
    //             { date: 'YYYY-MM-DD', value: percentage },
    //             ...
    //         ]
    //     }
    // }
    metricsData = data;
    populateProductDropdown();
    clearDashboard();
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);
