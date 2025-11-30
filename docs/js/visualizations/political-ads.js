// Political Ads Visualization - Stacked Area Chart with Brushing, Filtering, and Line Mode Toggle

function createPoliticalAdsChart(data, containerId) {
    // Set dimensions
    const margin = { top: 60, right: 140, bottom: 100, left: 80 };
    const margin2 = { top: 470, right: 140, bottom: 40, left: 80 };
    const totalWidth = 1000;
    const totalHeight = 540;
    const width = totalWidth - margin.left - margin.right;
    const height = 380;
    const height2 = 50;

    // Chart mode: 'stacked' or 'line'
    let chartMode = 'stacked';
    let currentExtent = null;

    // Clear any existing chart
    d3.select(`#${containerId}`).selectAll('*').remove();

    // Show loading state
    const container = d3.select(`#${containerId}`);
    const loadingEl = container.append('div')
        .attr('class', 'chart-loading')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('justify-content', 'center')
        .style('height', '400px')
        .style('color', '#6fb0ff')
        .text('Loading chart...');

    // Create responsive SVG with viewBox
    const svg = container
        .append('svg')
        .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('height', 'auto')
        .style('max-height', '540px')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Remove loading state
    loadingEl.remove();

    // Add chart title inside SVG
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', -35)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('fill', '#e6eef8')
        .text('Weekly Political Ad Spending by Party (2018–2024)');

    // Process data for stacking
    const parties = ['Democratic', 'Republican', 'Other'];
    const partyColors = {
        'Democratic': '#4A90E2',
        'Republican': '#E24A4A',
        'Other': '#9B9B9B'
    };

    // Track which parties are visible
    const visibleParties = new Set(parties);

    // Election dates for annotations
    const electionDates = [
        { date: new Date('2018-11-06'), label: '2018 Midterms' },
        { date: new Date('2020-11-03'), label: '2020 Presidential' },
        { date: new Date('2022-11-08'), label: '2022 Midterms' },
        { date: new Date('2024-11-05'), label: '2024 Presidential' }
    ];

    // Aggregate by week and party
    const nested = d3.rollup(data,
        v => d3.sum(v, d => d.spend),
        d => d.date.getTime(),
        d => d.party
    );

    // Convert to array format for stacking
    const dateData = Array.from(nested, ([date, partyMap]) => {
        const obj = { date: new Date(date) };
        partyMap.forEach((value, party) => {
            obj[party] = value;
        });
        // Fill missing parties with 0
        ['Democratic', 'Republican', 'Other'].forEach(party => {
            if (!obj[party]) obj[party] = 0;
        });
        return obj;
    }).sort((a, b) => a.date - b.date);

    // Line generators for line mode
    const lineGenerator = party => d3.line()
        .x(d => x(d.date))
        .y(d => y(d[party]))
        .curve(d3.curveMonotoneX);

    // Function to draw election annotation lines
    function drawElectionLines() {
        const currentDomain = x.domain();
        const visibleElections = electionDates.filter(e => 
            e.date >= currentDomain[0] && e.date <= currentDomain[1]
        );

        const lines = focus.selectAll('.election-line')
            .data(visibleElections, d => d.label);

        lines.exit().remove();

        const linesEnter = lines.enter()
            .append('g')
            .attr('class', 'election-line');

        linesEnter.append('line')
            .attr('y1', 0)
            .attr('y2', height)
            .style('stroke', '#FFD700')
            .style('stroke-width', 2)
            .style('stroke-dasharray', '5,5')
            .style('opacity', 0.7);

        linesEnter.append('text')
            .attr('y', -5)
            .style('fill', '#FFD700')
            .style('font-size', '10px')
            .style('text-anchor', 'middle')
            .text(d => d.label);

        focus.selectAll('.election-line')
            .attr('transform', d => `translate(${x(d.date)},0)`);
    }

    // Function to update chart based on visible parties
    function updateChart(extent = null, skipBrushDispatch = false) {
        const currentParties = parties.filter(p => visibleParties.has(p));
        
        if (extent) {
            currentExtent = extent;
            x.domain(extent);
        }

        if (chartMode === 'stacked') {
            // Stacked area mode
            const stack = d3.stack()
                .keys(currentParties)
                .order(d3.stackOrderNone)
                .offset(d3.stackOffsetNone);

            const stackedData = stack(dateData);

            // Update y domain for stacked
            y.domain([0, d3.max(stackedData, layer => d3.max(layer, d => d[1]))]).nice();

            // Remove line paths if switching from line mode
            focus.selectAll('.line-path').remove();

            // Update areas with transition
            const areas = focus.selectAll('.layer')
                .data(stackedData, d => d.key);

            areas.exit()
                .transition()
                .duration(300)
                .style('opacity', 0)
                .remove();

            const areasEnter = areas.enter()
                .append('g')
                .attr('class', 'layer');

            areasEnter.append('path')
                .attr('class', 'area')
                .style('fill', d => partyColors[d.key])
                .style('opacity', 0);

            focus.selectAll('.layer')
                .select('.area')
                .transition()
                .duration(500)
                .style('opacity', 0.85)
                .attr('d', area);
        } else {
            // Line mode
            focus.selectAll('.layer').remove();

            // Update y domain for line mode (max of individual values)
            const maxVal = d3.max(dateData, d => 
                Math.max(...currentParties.map(p => d[p] || 0))
            );
            y.domain([0, maxVal]).nice();

            const lines = focus.selectAll('.line-path')
                .data(currentParties, d => d);

            lines.exit().remove();

            lines.enter()
                .append('path')
                .attr('class', 'line-path')
                .style('fill', 'none')
                .style('stroke', d => partyColors[d])
                .style('stroke-width', 2.5)
                .merge(lines)
                .transition()
                .duration(500)
                .attr('d', d => lineGenerator(d)(dateData));
        }

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

        // Update grid
        svg.select('.grid')
            .transition()
            .duration(500)
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat('')
            );

        // Draw election lines
        drawElectionLines();

        // Dispatch linked brush event
        if (!skipBrushDispatch && extent) {
            window.dispatchEvent(new CustomEvent('timeRangeBrush', {
                detail: { extent: extent, source: 'political-ads' }
            }));
        }
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
        .attr('id', 'clip-ads')
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
        .attr('clip-path', 'url(#clip-ads)');

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
        .attr('y', height + 45)
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
        .attr('transform', `translate(0,${height + 55})`);

    // Stack data for context
    const stackContext = d3.stack()
        .keys(parties)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    const stackedDataContext = stackContext(dateData);

    context.selectAll('.context-layer')
        .data(stackedDataContext)
        .enter()
        .append('path')
        .attr('class', 'area context-layer')
        .style('fill', d => partyColors[d.key])
        .attr('d', area2);

    context.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${height2})`)
        .call(d3.axisBottom(x2).ticks(8));

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

    // Listen for linked brush events from other charts
    window.addEventListener('timeRangeBrush', (e) => {
        if (e.detail.source !== 'political-ads' && e.detail.extent) {
            updateChart(e.detail.extent, true);
        }
    });

    // Mode toggle buttons
    const toggleGroup = svg.append('g')
        .attr('class', 'mode-toggle')
        .attr('transform', `translate(${width + 15}, 60)`);

    toggleGroup.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .style('font-size', '10px')
        .style('fill', '#b8cfe6')
        .text('View Mode:');

    const stackedBtn = toggleGroup.append('g')
        .attr('class', 'toggle-btn active')
        .attr('transform', 'translate(0, 5)')
        .style('cursor', 'pointer')
        .attr('role', 'button')
        .attr('tabindex', 0)
        .on('click', () => setMode('stacked'))
        .on('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') setMode('stacked'); });

    stackedBtn.append('rect')
        .attr('width', 65)
        .attr('height', 22)
        .attr('rx', 4)
        .style('fill', '#6fb0ff');

    stackedBtn.append('text')
        .attr('x', 32)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#fff')
        .text('Stacked');

    const lineBtn = toggleGroup.append('g')
        .attr('class', 'toggle-btn')
        .attr('transform', 'translate(0, 32)')
        .style('cursor', 'pointer')
        .attr('role', 'button')
        .attr('tabindex', 0)
        .on('click', () => setMode('line'))
        .on('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') setMode('line'); });

    lineBtn.append('rect')
        .attr('width', 65)
        .attr('height', 22)
        .attr('rx', 4)
        .style('fill', 'rgba(255,255,255,0.1)');

    lineBtn.append('text')
        .attr('x', 32)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#e6eef8')
        .text('Lines');

    function setMode(mode) {
        chartMode = mode;
        stackedBtn.classed('active', mode === 'stacked');
        lineBtn.classed('active', mode === 'line');
        stackedBtn.select('rect').style('fill', mode === 'stacked' ? '#6fb0ff' : 'rgba(255,255,255,0.1)');
        lineBtn.select('rect').style('fill', mode === 'line' ? '#6fb0ff' : 'rgba(255,255,255,0.1)');
        updateChart(currentExtent);
    }

    // Add legend with click interaction
    const legend = svg.append('g')
        .attr('class', 'legend-group')
        .attr('transform', `translate(${width + 15}, 120)`);

    legend.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .style('font-size', '10px')
        .style('fill', '#b8cfe6')
        .text('Filter Party:');

    const legendItems = legend.selectAll('.legend-item')
        .data(parties)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0,${i * 26 + 5})`)
        .style('cursor', 'pointer')
        .attr('tabindex', 0)
        .attr('role', 'checkbox')
        .attr('aria-checked', 'true')
        .on('click', function(event, d) { toggleParty(d, this); })
        .on('keydown', function(event, d) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleParty(d, this);
            }
        });

    function toggleParty(party, element) {
        if (visibleParties.has(party)) {
            visibleParties.delete(party);
            d3.select(element).style('opacity', 0.3).attr('aria-checked', 'false');
            d3.select(element).select('.check-mark').style('opacity', 0);
        } else {
            visibleParties.add(party);
            d3.select(element).style('opacity', 1).attr('aria-checked', 'true');
            d3.select(element).select('.check-mark').style('opacity', 1);
        }
        updateChart(currentExtent);
    }

    legendItems.append('rect')
        .attr('width', 16)
        .attr('height', 16)
        .attr('rx', 3)
        .style('fill', d => partyColors[d]);

    legendItems.append('text')
        .attr('class', 'check-mark')
        .attr('x', 8)
        .attr('y', 12)
        .attr('text-anchor', 'middle')
        .style('fill', '#fff')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('✓');

    legendItems.append('text')
        .attr('x', 22)
        .attr('y', 12)
        .style('font-size', '11px')
        .style('fill', '#e6eef8')
        .text(d => d);

    // Add tooltip
    const tooltip = d3.select('body').select('.tooltip').empty() 
        ? d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0)
        : d3.select('body').select('.tooltip');

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
                    <span style="color:${partyColors.Democratic}">●</span> Democratic: $${d3.format(',.0f')(d.Democratic)}<br/>
                    <span style="color:${partyColors.Republican}">●</span> Republican: $${d3.format(',.0f')(d.Republican)}<br/>
                    <span style="color:${partyColors.Other}">●</span> Other: $${d3.format(',.0f')(d.Other)}<br/>
                    <strong>Total: $${d3.format(',.0f')(total)}</strong>
                `)
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY - 28) + 'px')
                    .style('opacity', 1);
            }
        });

    // Initial render
    updateChart();

    // Return chart API for external control
    return {
        updateTimeRange: (extent) => updateChart(extent, true),
        setMode: setMode,
        getDateData: () => dateData
    };
}
