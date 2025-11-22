// Political Ads Visualization - Stacked Area Chart

function createPoliticalAdsChart(data, containerId) {
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

    // Process data for stacking
    const parties = ['Democratic', 'Republican', 'Other'];
    const partyColors = {
        'Democratic': '#4A90E2',
        'Republican': '#E24A4A',
        'Other': '#9B9B9B'
    };

    // Aggregate by week and party
    const nested = d3.rollup(data,
        v => d3.sum(v, d => d.spend),
        d => d.date.getTime(),
        d => d.party
    );

    // Convert to array format for stacking
    const dateData = Array.from(nested, ([date, parties]) => {
        const obj = { date: new Date(date) };
        parties.forEach((value, party) => {
            obj[party] = value;
        });
        // Fill missing parties with 0
        ['Democratic', 'Republican', 'Other'].forEach(party => {
            if (!obj[party]) obj[party] = 0;
        });
        return obj;
    }).sort((a, b) => a.date - b.date);

    // Stack the data
    const stack = d3.stack()
        .keys(parties)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    const stackedData = stack(dateData);

    // Create scales
    const x = d3.scaleTime()
        .domain(d3.extent(dateData, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(stackedData, layer => d3.max(layer, d => d[1]))])
        .nice()
        .range([height, 0]);

    // Create area generator
    const area = d3.area()
        .x(d => x(d.data.date))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveMonotoneX);

    // Add grid lines
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat('')
        );

    // Draw areas
    const layers = svg.selectAll('.layer')
        .data(stackedData)
        .enter()
        .append('g')
        .attr('class', 'layer');

    layers.append('path')
        .attr('class', 'area')
        .style('fill', d => partyColors[d.key])
        .attr('d', area);

    // Add x-axis
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10));

    // Add y-axis
    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y)
            .ticks(10)
            .tickFormat(d => `$${d3.format('.2s')(d)}`));

    // Add axis labels
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', height + 50)
        .style('text-anchor', 'middle')
        .text('Week');

    svg.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -60)
        .style('text-anchor', 'middle')
        .text('Weekly Ad Spending (USD)');

    // Add legend
    const legend = svg.selectAll('.legend')
        .data(parties)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(${width + 10},${i * 25})`);

    legend.append('rect')
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', d => partyColors[d]);

    legend.append('text')
        .attr('x', 24)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('font-size', '13px')
        .text(d => d);

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
            const i = bisect(dateData, x0, 1);
            const d = dateData[i];

            if (d) {
                focus.select('.focus-line')
                    .attr('transform', `translate(${x(d.date)},0)`);

                const total = d.Democratic + d.Republican + d.Other;
                tooltip.html(`
                    <strong>${d3.timeFormat('%B %d, %Y')(d.date)}</strong><br/>
                    Democratic: $${d3.format(',.0f')(d.Democratic)}<br/>
                    Republican: $${d3.format(',.0f')(d.Republican)}<br/>
                    Other: $${d3.format(',.0f')(d.Other)}<br/>
                    <strong>Total: $${d3.format(',.0f')(total)}</strong>
                `)
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY - 28) + 'px')
                    .style('opacity', 1);
            }
        });
}
