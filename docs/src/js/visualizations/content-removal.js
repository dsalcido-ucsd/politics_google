// Content Removal Visualization - Stacked Bar Chart with Responsive SVG

function createContentRemovalChart(data, containerId) {
    // Set dimensions
    const margin = { top: 50, right: 200, bottom: 80, left: 80 };
    const totalWidth = 1000;
    const totalHeight = 500;
    const width = totalWidth - margin.left - margin.right;
    const height = totalHeight - margin.top - margin.bottom;

    // Clear any existing chart
    d3.select(`#${containerId}`).selectAll('*').remove();

    // Create responsive SVG with viewBox
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('height', 'auto')
        .style('max-height', '500px')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add chart title inside SVG
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', -25)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('fill', '#e6eef8')
        .text('Content Removal Requests by Reason (2011–2024)');

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
    const legend = svg.append('g')
        .attr('class', 'legend-group')
        .attr('transform', `translate(${width + 15}, 0)`);

    legend.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .style('font-size', '10px')
        .style('fill', '#b8cfe6')
        .text('Removal Reasons:');

    const legendItems = legend.selectAll('.legend-item')
        .data(topReasons)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0,${i * 24 + 5})`);

    legendItems.append('rect')
        .attr('width', 14)
        .attr('height', 14)
        .attr('rx', 2)
        .style('fill', d => colorScale(d));

    legendItems.append('text')
        .attr('x', 20)
        .attr('y', 7)
        .attr('dy', '.35em')
        .style('font-size', '10px')
        .style('fill', '#e6eef8')
        .text(d => d.length > 18 ? d.slice(0, 16) + '...' : d);

    // Add tooltip
    const tooltip = d3.select('body').select('.tooltip').empty() 
        ? d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0)
        : d3.select('body').select('.tooltip');

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
