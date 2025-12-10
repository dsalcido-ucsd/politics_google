# Interfaces of Power: Visualizing U.S. Political Use of Google

This project explores how political actors in the United States interact with Google through three main "interfaces of power":

1. **Political advertising** (Google political ads transparency data)
2. **User-data requests** (government requests for user information)
3. **Content removal requests** (government requests to remove content)

The goal is to build an explorable explanation web page using **Python for data preparation** and **D3.js** for interactive visualizations.

---

## Project Structure

```text
politics_google/
├── docs/                      # GitHub Pages deployment
│   ├── index.html             # Main visualization page
│   ├── css/
│   │   └── styles.css         # Styling
│   ├── js/
│   │   ├── main.js            # App initialization
│   │   ├── utils/
│   │   │   └── data-loader.js # CSV loading utilities
│   │   └── visualizations/
│   │       ├── political-ads.js
│   │       ├── data-requests.js
│   │       └── content-removal.js
│   └── data/processed/        # CSVs for the web app
├── data/
│   ├── raw/                   # Original Google transparency data
│   └── processed/             # Cleaned CSVs (reference copy)
├── notebooks/
│   └── 01_prepare_data.ipynb  # Data preparation notebook
├── README.md
├── PROJECT_WRITEUP.md         # Detailed project documentation
└── DEPLOYMENT.md              # Deployment instructions
```

## Features

- **Responsive D3.js visualizations** with viewBox scaling
- **Stacked area chart** with brush zoom for political ad spending
- **Multi-line chart** for government data requests over time
- **Stacked bar chart** for content removal reasons
- **Horizontal bar chart** for state-by-state spending
- **Aligned timelines** comparing all three data sources
- **Election year annotations** highlighting key dates
- **Linked brushing** for synchronized time range selection
- **Section navigation** with scroll-based progress indicator
- **Keyboard accessibility** for all interactive elements

## Data Sources

- [Google Political Advertising Transparency Report](https://transparencyreport.google.com/political-ads/home)
- [Google User Data Requests](https://transparencyreport.google.com/user-data/overview)
- [Google Government Removal Requests](https://transparencyreport.google.com/government-removals/overview)

