// This file contains functions and logic for creating visualizations related to U.S. political advertising, such as the stacked area chart for ad spend by party over time.

const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg = d3.select("#political-ads")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

function drawPoliticalAds(data) {
  const x = d3.scaleTime()
    .domain(d3.extent(data, d => new Date(d.date)))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.adSpend)])
    .range([height, 0]);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const area = d3.area()
    .x(d => x(new Date(d.date)))
    .y0(d => y(d3.sum(d.values, v => v.adSpend)))
    .y1(d => y(d3.sum(d.values, v => v.adSpend) - d.adSpend));

  const stack = d3.stack()
    .keys(data.columns.slice(1))
    .value((d, key) => d[key]);

  const stackedData = stack(data);

  svg.selectAll(".layer")
    .data(stackedData)
    .enter().append("path")
    .attr("class", "layer")
    .attr("d", area)
    .style("fill", (d, i) => color(i));

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));
}

// Load data and call drawPoliticalAds
d3.csv("data/processed/political_ads.csv").then(data => {
  data.forEach(d => {
    d.adSpend = +d.adSpend;
    d.date = d3.timeParse("%Y-%m-%d")(d.date);
  });
  drawPoliticalAds(data);
});