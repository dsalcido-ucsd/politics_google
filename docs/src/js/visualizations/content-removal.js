// Content Removal Visualization - Stacked Bar Chart

function createContentRemovalChart(data, containerId) {
    // Set dimensions
    const margin = { top: 20, right: 200, bottom: 80, left: 80 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Clear any existing chart
    d3.select(`#${containerId}`).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get top 8 reasons by total
    const reasonTotals = d3.rollup(data, v => d3.sum(v, d => d.total), d => d.reason);
    const topReasons = Array.from(reasonTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(d => d[0]);

    // Filter data to top reasons
    const filteredData = data.filter(d => topReasons.includes(d.reason));

    // Group by date (year)
    const yearData = d3.rollup(filteredData,
        v => d3.sum(v, d => d.total),
        d => d.date.getFullYear(),
        d => d.reason
    );

    // Convert to array format for stacking
    const chartData = Array.from(yearData, ([year, reasons]) => {
        const obj = { year: year };
        reasons.forEach((value, reason) => {
            obj[reason] = value;
        });
        // Fill missing reasons with 0
        topReasons.forEach(reason => {
            if (!obj[reason]) obj[reason] = 0;
        });
        return obj;
    }).sort((a, b) => a.year - b.year);

    // Color scale
    const colorScale = d3.scaleOrdinal()
        .domain(topReasons)
        .range(d3.schemeSet3);

    // Stack the data
    const stack = d3.stack()
        .keys(topReasons)
        .order(d3.stackOrderDescending);

    const stackedData = stack(chartData);

    // Create scales
    const x = d3.scaleBand()
        .domain(chartData.map(d => d.year))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(stackedData, layer => d3.max(layer, d => d[1]))])
        .nice()
        .range([height, 0]);

    // Add grid lines
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat('')
        );

    // Draw bars
    const layers = svg.selectAll('.layer')
        .data(stackedData)
        .enter()
        .append('g')
        .attr('class', 'layer')
        .attr('fill', d => colorScale(d.key));

    layers.selectAll('rect')
        .data(d => d)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.data.year))
        .attr('y', d => y(d[1]))
        .attr('height', d => y(d[0]) - y(d[1]))
        .attr('width', x.bandwidth());

    // Add x-axis
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'middle');

    // Add y-axis
    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y)
            .ticks(10)
            .tickFormat(d => d3.format(',')(d)));

    // Add axis labels
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', height + 50)
        .style('text-anchor', 'middle')
        .text('Year');

    svg.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -60)
        .style('text-anchor', 'middle')
        .text('Number of Removal Requests');

    // Add legend
    const legend = svg.selectAll('.legend')
        .data(topReasons)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(${width + 10},${i * 25})`);

    legend.append('rect')
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', d => colorScale(d));

    legend.append('text')
        .attr('x', 24)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('font-size', '11px')
        .text(d => d);

    // Add tooltip
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    // Tooltip interaction
    layers.selectAll('rect')
        .on('mouseover', function(event, d) {
            const reason = d3.select(this.parentNode).datum().key;
            tooltip.html(`
                <strong>${d.data.year}</strong><br/>
                ${reason}: ${d3.format(',')(d.data[reason])}
            `)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 28) + 'px')
                .style('opacity', 1);
        })
        .on('mouseout', () => {
            tooltip.style('opacity', 0);
        });
}
