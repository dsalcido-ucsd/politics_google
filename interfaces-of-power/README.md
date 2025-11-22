# Interfaces of Power: Visualizing U.S. Political Use of Google

This project explores how political actors in the United States interact with Google through three main “interfaces of power”:

1. **Political advertising** (Google political ads transparency data)
2. **User-data requests** (government requests for user information)
3. **Content removal requests** (government requests to remove content)

The goal is to build an explorable explanation web page using **Python for data preparation** and **D3.js** for interactive visualizations.

## Objectives

- Analyze and visualize the impact of political advertising on Google.
- Examine government requests for user data and their implications.
- Investigate content removal requests and the reasons behind them.

## Datasets

The project utilizes data from Google's transparency reports, which include:

- Political advertising data (ad spend, targeting, etc.)
- User-data request statistics (number of requests, types of data requested)
- Content removal requests (reasons for removal, number of requests)

## Project Structure

```text
interfaces-of-power/
  data/
    raw/          # original Excel files from Google's transparency downloads (NOT in git)
    processed/    # small, cleaned CSVs for D3 (OK to commit)
  notebooks/
    01_prepare_data.ipynb   # data prep & aggregation
  src/
    js/           # D3 visualizations
  public/
    data/
      processed/  # copies of processed CSVs for the web app
    index.html    # main prototype page
  README.md
```

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd interfaces-of-power
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Prepare the data using the Jupyter notebook:
   - Open `notebooks/01_prepare_data.ipynb` and run the cells to clean and process the datasets.

4. Open the main HTML file in a web browser:
   - Navigate to `public/index.html` to view the interactive visualizations.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or suggestions.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.