// This file contains functions and logic for visualizing content removal requests, such as the stacked area or bar chart for requests by reason category.

async function loadContentRemovalData() {
    const response = await d3.csv("data/processed/content_removal.csv");
    return response;
}

function createContentRemovalChart(data) {
    const svg = d3.select("#content-removal-chart")
        .attr("width", 800)
        .attr("height", 400);

    const x = d3.scaleBand()
        .domain(data.map(d => d.reason))
        .range([0, 800])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.requests)])
        .nice()
        .range([400, 0]);

    svg.append("g")
        .selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.reason))
        .attr("y", d => y(d.requests))
        .attr("width", x.bandwidth())
        .attr("height", d => 400 - y(d.requests));

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0,400)")
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));
}

async function renderContentRemovalVisualization() {
    const data = await loadContentRemovalData();
    createContentRemovalChart(data);
}

document.addEventListener("DOMContentLoaded", renderContentRemovalVisualization);