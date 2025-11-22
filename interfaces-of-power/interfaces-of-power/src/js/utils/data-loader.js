function loadCSV(url) {
    return d3.csv(url)
        .then(data => {
            // Process data if necessary
            return data;
        })
        .catch(error => {
            console.error('Error loading the CSV file:', error);
        });
}

function loadMultipleCSVs(urls) {
    const promises = urls.map(url => loadCSV(url));
    return Promise.all(promises)
        .then(dataArrays => {
            // Combine data from all CSVs if necessary
            return dataArrays;
        })
        .catch(error => {
            console.error('Error loading multiple CSV files:', error);
        });
}