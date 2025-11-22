# Interfaces of Power: Visualizing U.S. Political Use of Google

This project explores how political actors in the United States interact with Google through three main “interfaces of power”:

1. **Political advertising** (Google political ads transparency data)
2. **User-data requests** (government requests for user information)
3. **Content removal requests** (government requests to remove content)

The goal is to build an explorable explanation web page using **Python for data preparation** and **D3.js** for interactive visualizations.

---

## Repo Structure

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
