# Excel Data Format Guide

The dashboard can read Excel files (.xlsx, .xls) in multiple formats:

## Format 1: Your Custom Format (Date Parts + VanityName)

| Date - Year | Date - Quarter | Date - Month | Date - Day | Value | VanityName        |
|-------------|----------------|--------------|------------|-------|-------------------|
| 2025        | Q3             | 6            | 29         | 85.2  | Performance Score |
| 2025        | Q3             | 6            | 30         | 86.1  | Performance Score |
| 2025        | Q3             | 7            | 1          | 84.7  | Performance Score |
| 2025        | Q3             | 6            | 29         | 92.5  | Quality Index     |
| 2025        | Q3             | 6            | 30         | 93.1  | Quality Index     |
| ...         | ...            | ...          | ...        | ...   | ...               |

**Rules:**
- Column names must be exactly: "Date - Year", "Date - Quarter", "Date - Month", "Date - Day", "Value", "VanityName"
- **Date - Year**: 4-digit year (e.g., 2025)
- **Date - Quarter**: Can be any format (Q1, Q2, etc.) - not used for calculation
- **Date - Month**: Month number (1-12)
- **Date - Day**: Day number (1-31)
- **Value**: Metric percentage value (0-100)
- **VanityName**: This becomes the metric name in the dashboard
- Sheet name becomes the product name

## Format 2: One Sheet per Product (Alternative)

**Sheet Name:** Product Name (e.g., "Product Alpha")

| Date       | Performance Score | Quality Index | User Satisfaction |
|------------|-------------------|---------------|-------------------|
| 2025-06-29 | 85.2             | 92.5         | 78.9             |
| 2025-06-30 | 86.1             | 93.1         | 79.2             |
| 2025-07-01 | 84.7             | 91.8         | 76.1             |
| ...        | ...              | ...          | ...              |

**Rules:**
- Sheet name becomes the product name
- First column must be "Date" (format: YYYY-MM-DD or Excel date)
- Each additional column represents a metric
- Values should be percentages (0-100)

## Format 3: All Data in One Sheet

| Product    | Metric           | Date       | Value |
|------------|------------------|------------|-------|
| Product A  | Performance Score| 2025-06-29 | 85.2  |
| Product A  | Performance Score| 2025-06-30 | 86.1  |
| Product A  | Quality Index    | 2025-06-29 | 92.5  |
| Product B  | Performance Score| 2025-06-29 | 76.3  |
| ...        | ...              | ...        | ...   |

**Rules:**
- Columns must be named exactly: "Product", "Metric", "Date", "Value"
- Date format: YYYY-MM-DD or Excel date
- Value should be percentage (0-100)

## Sample Data Structure

For best results, ensure you have:
- Daily data for the past 2 months (approximately 60 days)
- Consistent date formatting
- Numeric values for metrics
- Clear product and metric names

## Tips

1. **Date Formatting:** Use Excel's date format or YYYY-MM-DD text format
2. **Missing Data:** Leave cells empty rather than using 0 for missing data
3. **Multiple Products:** Use separate sheets (Format 1) or combine in one sheet (Format 2)
4. **File Size:** Keep files under 10MB for better performance

## Example File Structure

```
MyData.xlsx
├── Product Alpha (Sheet)
├── Product Beta (Sheet)
└── Product Gamma (Sheet)
```

OR

```
MyData.xlsx
└── All Data (Sheet with Product, Metric, Date, Value columns)
```
