// This file contains functions and logic for visualizing U.S. government requests for user information, including the line chart for requests over time.

const svgWidth = 800;
const svgHeight = 400;

const margin = { top: 20, right: 30, bottom: 30, left: 40 };

const xScale = d3.scaleTime()
    .range([margin.left, svgWidth - margin.right]);

const yScale = d3.scaleLinear()
    .range([svgHeight - margin.bottom, margin.top]);

const line = d3.line()
    .x(d => xScale(new Date(d.date)))
    .y(d => yScale(d.requests));

function drawDataRequests(data) {
    const svg = d3.select("#data-requests-chart")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    xScale.domain(d3.extent(data, d => new Date(d.date)));
    yScale.domain([0, d3.max(data, d => d.requests)]);

    svg.append("g")
        .attr("transform", `translate(0,${svgHeight - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);
}

function loadDataAndDraw() {
    d3.csv("data/processed/data-requests.csv").then(data => {
        data.forEach(d => {
            d.requests = +d.requests;
        });
        drawDataRequests(data);
    });
}

document.addEventListener("DOMContentLoaded", loadDataAndDraw);