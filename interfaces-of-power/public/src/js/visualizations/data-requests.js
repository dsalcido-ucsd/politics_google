// User Data Requests Visualization - Multi-line Chart

function createDataRequestsChart(data, containerId) {
    // Set dimensions
    const margin = { top: 20, right: 120, bottom: 60, left: 80 };
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

    // Create scales
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.requests, d.accounts))])
        .nice()
        .range([height, 0]);

    const y2 = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

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

    // Draw lines
    svg.append('path')
        .datum(data)
        .attr('class', 'line')
        .attr('d', requestsLine)
        .style('stroke', '#4A90E2')
        .style('stroke-width', 3);

    svg.append('path')
        .datum(data)
        .attr('class', 'line')
        .attr('d', accountsLine)
        .style('stroke', '#E24A4A')
        .style('stroke-width', 3);

    svg.append('path')
        .datum(data)
        .attr('class', 'line')
        .attr('d', disclosureLine)
        .style('stroke', '#F5A623')
        .style('stroke-width', 2)
        .style('stroke-dasharray', '5,5');

    // Add x-axis
    svg.append('g')
        .attr('class', 'axis')
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

    const legend = svg.selectAll('.legend')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(${width + 10},${i * 25})`);

    legend.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 9)
        .attr('y2', 9)
        .style('stroke', d => d.color)
        .style('stroke-width', 2)
        .style('stroke-dasharray', d => d.dash ? '5,5' : 'none');

    legend.append('text')
        .attr('x', 24)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('font-size', '13px')
        .text(d => d.label);

    // Add tooltip
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    // Tooltip interaction
    const focus = svg.append('g')
        .style('display', 'none');

    focus.append('line')
        .attr('class', 'focus-line')
        .attr('y1', 0)
        .attr('y2', height)
        .style('stroke', 'black')
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
                    Requests: ${d3.format(',')(d.requests)}<br/>
                    Accounts: ${d3.format(',')(d.accounts)}<br/>
                    Disclosure Rate: ${d3.format('.1f')(d.disclosureRate)}%
                `)
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY - 28) + 'px')
                    .style('opacity', 1);
            }
        });
}
