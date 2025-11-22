// Political Ads Visualization - Stacked Area Chart with Brushing and Filtering

function createPoliticalAdsChart(data, containerId) {
    // Set dimensions
    const margin = { top: 20, right: 120, bottom: 100, left: 80 };
    const margin2 = { top: 450, right: 120, bottom: 60, left: 80 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    const height2 = 500 - margin2.top - margin2.bottom;

    // Clear any existing chart
    d3.select(`#${containerId}`).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', 500)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Process data for stacking
    const parties = ['Democratic', 'Republican', 'Other'];
    const partyColors = {
        'Democratic': '#4A90E2',
        'Republican': '#E24A4A',
        'Other': '#9B9B9B'
    };

    // Track which parties are visible
    const visibleParties = new Set(parties);

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

    // Function to update chart based on visible parties
    function updateChart(extent = null) {
        // Filter parties
        const currentParties = parties.filter(p => visibleParties.has(p));
        
        // Stack the data
        const stack = d3.stack()
            .keys(currentParties)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        const stackedData = stack(dateData);

        // Filter data by brush extent if provided
        let filteredData = dateData;
        if (extent) {
            filteredData = dateData.filter(d => d.date >= extent[0] && d.date <= extent[1]);
        }

        // Update scales
        x.domain(extent || d3.extent(dateData, d => d.date));
        y.domain([0, d3.max(stackedData, layer => d3.max(layer, d => d[1]))]).nice();

        // Update areas with transition
        const areas = svg.selectAll('.layer')
            .data(stackedData, d => d.key);

        // Exit
        areas.exit()
            .transition()
            .duration(500)
            .style('opacity', 0)
            .remove();

        // Enter + Update
        const areasEnter = areas.enter()
            .append('g')
            .attr('class', 'layer');

        areasEnter.append('path')
            .attr('class', 'area')
            .style('fill', d => partyColors[d.key])
            .style('opacity', 0);

        svg.selectAll('.layer')
            .select('.area')
            .transition()
            .duration(500)
            .style('opacity', 1)
            .attr('d', area);

        // Update axes
        svg.select('.x-axis')
            .transition()
            .duration(500)
            .call(d3.axisBottom(x).ticks(10));

        svg.select('.y-axis')
            .transition()
            .duration(500)
            .call(d3.axisLeft(y)
                .ticks(10)
                .tickFormat(d => `$${d3.format('.2s')(d)}`));
    }

    // Create scales
    const x = d3.scaleTime()
        .domain(d3.extent(dateData, d => d.date))
        .range([0, width]);

    const x2 = d3.scaleTime()
        .domain(x.domain())
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(dateData, d => d.Democratic + d.Republican + d.Other)])
        .nice()
        .range([height, 0]);

    const y2 = d3.scaleLinear()
        .domain(y.domain())
        .range([height2, 0]);

    // Create area generators
    const area = d3.area()
        .x(d => x(d.data.date))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveMonotoneX);

    const area2 = d3.area()
        .x(d => x2(d.data.date))
        .y0(d => y2(d[0]))
        .y1(d => y2(d[1]))
        .curve(d3.curveMonotoneX);

    // Add clip path for main chart
    svg.append('defs')
        .append('clipPath')
        .attr('id', 'clip')
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

    // Main chart group
    const focus = svg.append('g')
        .attr('class', 'focus')
        .attr('clip-path', 'url(#clip)');

    // Add x-axis
    svg.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10));

    // Add y-axis
    svg.append('g')
        .attr('class', 'axis y-axis')
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

    // Add context/brush chart
    const context = svg.append('g')
        .attr('class', 'context')
        .attr('transform', `translate(0,${margin2.top - margin.top})`);

    // Stack data for context
    const stackContext = d3.stack()
        .keys(parties)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    const stackedDataContext = stackContext(dateData);

    context.selectAll('.layer')
        .data(stackedDataContext)
        .enter()
        .append('path')
        .attr('class', 'area')
        .style('fill', d => partyColors[d.key])
        .attr('d', area2);

    context.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${height2})`)
        .call(d3.axisBottom(x2).ticks(5));

    // Add brush
    const brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on('brush end', brushed);

    context.append('g')
        .attr('class', 'brush')
        .call(brush);

    function brushed(event) {
        if (event.selection) {
            const extent = event.selection.map(x2.invert);
            updateChart(extent);
        }
    }

    // Add legend with click interaction
    const legend = svg.selectAll('.legend')
        .data(parties)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(${width + 10},${i * 25})`)
        .style('cursor', 'pointer')
        .on('click', function(event, d) {
            // Toggle visibility
            if (visibleParties.has(d)) {
                visibleParties.delete(d);
                d3.select(this).style('opacity', 0.3);
            } else {
                visibleParties.add(d);
                d3.select(this).style('opacity', 1);
            }
            updateChart();
        });

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
    const focusLine = svg.append('g')
        .attr('class', 'focus-group')
        .style('display', 'none');

    focusLine.append('line')
        .attr('class', 'focus-line')
        .attr('y1', 0)
        .attr('y2', height)
        .style('stroke', 'white')
        .style('stroke-width', 1)
        .style('opacity', 0.7);

    svg.append('rect')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .on('mouseover', () => focusLine.style('display', null))
        .on('mouseout', () => {
            focusLine.style('display', 'none');
            tooltip.style('opacity', 0);
        })
        .on('mousemove', function(event) {
            const x0 = x.invert(d3.pointer(event)[0]);
            const bisect = d3.bisector(d => d.date).left;
            const i = bisect(dateData, x0, 1);
            const d = dateData[i];

            if (d) {
                focusLine.select('.focus-line')
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

    // Initial render
    updateChart();
}
