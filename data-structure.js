// Sample data structure for the dashboard
// Replace this with your actual data

const sampleData = {
    "Product Alpha": {
        "Performance Score": [
            { date: "2025-06-29", value: 85.2 },
            { date: "2025-06-30", value: 86.1 },
            { date: "2025-07-01", value: 84.7 },
            { date: "2025-07-02", value: 81.3 }, // Drop > 2%
            { date: "2025-07-03", value: 82.8 },
            // ... continue with daily data for past 2 months
        ],
        "Quality Index": [
            { date: "2025-06-29", value: 92.5 },
            { date: "2025-06-30", value: 93.1 },
            { date: "2025-07-01", value: 91.8 },
            // ... continue with daily data
        ],
        "User Satisfaction": [
            { date: "2025-06-29", value: 78.9 },
            { date: "2025-06-30", value: 79.2 },
            { date: "2025-07-01", value: 76.1 }, // Drop > 2%
            // ... continue with daily data
        ]
    },
    "Product Beta": {
        "Performance Score": [
            // Daily data for past 2 months
        ],
        "Reliability Score": [
            // Daily data for past 2 months
        ]
    }
    // Add more products as needed
};

// To use your actual data, call this function:
// loadActualData(yourDataObject);

/* 
Expected data format:
- Each product should have one or more metrics
- Each metric should be an array of objects with 'date' (YYYY-MM-DD format) and 'value' (percentage)
- Data should cover the past 2 months (approximately 60 days)
- Values should be percentages (0-100)

Example of how to load your data:
loadActualData({
    "Your Product Name": {
        "Your Metric Name": [
            { date: "2025-06-29", value: 85.5 },
            { date: "2025-06-30", value: 87.2 },
            // ... more daily data
        ]
    }
});
*/
