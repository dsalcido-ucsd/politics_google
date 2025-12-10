// User Data Requests Visualization - Multi-line Chart with Linked Brushing

function createDataRequestsChart(data, containerId) {
    // Set dimensions
    const margin = { top: 50, right: 140, bottom: 60, left: 80 };
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
        .text('Government Data Requests Over Time (2009–2024)');

    // Create scales
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const xOriginalDomain = x.domain();

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.requests, d.accounts))])
        .nice()
        .range([height, 0]);

    const y2 = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    // Add clip path
    svg.append('defs')
        .append('clipPath')
        .attr('id', 'clip-requests')
        .append('rect')
        .attr('width', width)
        .attr('height', height);

    // Add grid lines
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat('')
        );

    // Line generators
    const requestsLine = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.requests))
        .curve(d3.curveMonotoneX);

    const accountsLine = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.accounts))
        .curve(d3.curveMonotoneX);

    const disclosureLine = d3.line()
        .x(d => x(d.date))
        .y(d => y2(d.disclosureRate))
        .curve(d3.curveMonotoneX);

    // Main chart group with clipping
    const chartArea = svg.append('g')
        .attr('clip-path', 'url(#clip-requests)');

    // Draw lines
    chartArea.append('path')
        .datum(data)
        .attr('class', 'line requests-line')
        .attr('d', requestsLine)
        .style('fill', 'none')
        .style('stroke', '#4A90E2')
        .style('stroke-width', 3);

    chartArea.append('path')
        .datum(data)
        .attr('class', 'line accounts-line')
        .attr('d', accountsLine)
        .style('fill', 'none')
        .style('stroke', '#E24A4A')
        .style('stroke-width', 3);

    chartArea.append('path')
        .datum(data)
        .attr('class', 'line disclosure-line')
        .attr('d', disclosureLine)
        .style('fill', 'none')
        .style('stroke', '#F5A623')
        .style('stroke-width', 2)
        .style('stroke-dasharray', '5,5');

    // Add x-axis
    svg.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10));

    // Add left y-axis
    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y)
            .ticks(10)
            .tickFormat(d => d3.format('.2s')(d)));

    // Add right y-axis for disclosure rate
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(${width},0)`)
        .call(d3.axisRight(y2)
            .ticks(5)
            .tickFormat(d => d + '%'));

    // Add axis labels
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', height + 50)
        .style('text-anchor', 'middle')
        .text('Period');

    svg.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -60)
        .style('text-anchor', 'middle')
        .text('Count');

    svg.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', width + 60)
        .style('text-anchor', 'middle')
        .text('Disclosure Rate (%)');

    // Add legend
    const legendData = [
        { label: 'Requests', color: '#4A90E2', dash: false },
        { label: 'Accounts', color: '#E24A4A', dash: false },
        { label: 'Disclosure Rate', color: '#F5A623', dash: true }
    ];

    const legend = svg.append('g')
        .attr('class', 'legend-group')
        .attr('transform', `translate(${width + 15}, 0)`);

    legend.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .style('font-size', '10px')
        .style('fill', '#b8cfe6')
        .text('Metrics:');

    const legendItems = legend.selectAll('.legend-item')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0,${i * 28 + 5})`);

    legendItems.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 9)
        .attr('y2', 9)
        .style('stroke', d => d.color)
        .style('stroke-width', 2)
        .style('stroke-dasharray', d => d.dash ? '5,5' : 'none');

    legendItems.append('text')
        .attr('x', 26)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('font-size', '11px')
        .style('fill', '#e6eef8')
        .text(d => d.label);

    // Add tooltip
    const tooltip = d3.select('body').select('.tooltip').empty() 
        ? d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0)
        : d3.select('body').select('.tooltip');

    // Tooltip interaction
    const focus = svg.append('g')
        .style('display', 'none');

    focus.append('line')
        .attr('class', 'focus-line')
        .attr('y1', 0)
        .attr('y2', height)
        .style('stroke', 'white')
        .style('stroke-width', 1)
        .style('opacity', 0.5);

    svg.append('rect')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .on('mouseover', () => focus.style('display', null))
        .on('mouseout', () => {
            focus.style('display', 'none');
            tooltip.style('opacity', 0);
        })
        .on('mousemove', function(event) {
            const x0 = x.invert(d3.pointer(event)[0]);
            const bisect = d3.bisector(d => d.date).left;
            const i = bisect(data, x0, 1);
            const d = data[i];

            if (d) {
                focus.select('.focus-line')
                    .attr('transform', `translate(${x(d.date)},0)`);

                tooltip.html(`
                    <strong>${d3.timeFormat('%B %Y')(d.date)}</strong><br/>
                    <span style="color:#4A90E2">●</span> Requests: ${d3.format(',')(d.requests)}<br/>
                    <span style="color:#E24A4A">●</span> Accounts: ${d3.format(',')(d.accounts)}<br/>
                    <span style="color:#F5A623">●</span> Disclosure Rate: ${d3.format('.1f')(d.disclosureRate)}%
                `)
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY - 28) + 'px')
                    .style('opacity', 1);
            }
        });

    // Add chart annotation showing growth
    const annotationGroup = svg.append('g').attr('class', 'chart-annotations');
    
    // Find earliest and latest data points
    const firstPoint = data[0];
    const lastPoint = data[data.length - 1];
    
    if (firstPoint && lastPoint) {
        // Arrow and growth annotation
        const growthFactor = Math.round(lastPoint.requests / firstPoint.requests);
        
        annotationGroup.append('text')
            .attr('x', width - 10)
            .attr('y', y(lastPoint.requests) - 15)
            .attr('text-anchor', 'end')
            .style('fill', '#4A90E2')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text(`${growthFactor}x growth since 2009`);
    }

    // Return chart API
    return {
        updateTimeRange: (extent) => {
            x.domain(extent);
            updateLines();
        }
    };
}
