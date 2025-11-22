// Main application file

// Initialize the application
async function init() {
    try {
        console.log('Loading data...');
        
        // Load all data
        const data = await DataLoader.loadAll();
        
        console.log('Data loaded successfully:', {
            politicalAds: data.politicalAds.length,
            userRequests: data.userRequests.length,
            contentRemoval: data.contentRemoval.length,
            stateSpending: data.stateSpending.length
        });

        // Create visualizations
        console.log('Creating visualizations...');
        
        // 1. Political Ads Chart
        if (data.politicalAds.length > 0) {
            createPoliticalAdsChart(data.politicalAds, 'ads-chart');
            console.log('✓ Political ads chart created');
        }

        // 2. User Data Requests Chart
        if (data.userRequests.length > 0) {
            createDataRequestsChart(data.userRequests, 'requests-chart');
            console.log('✓ Data requests chart created');
        }

        // 3. Content Removal Chart
        if (data.contentRemoval.length > 0) {
            createContentRemovalChart(data.contentRemoval, 'removal-chart');
            console.log('✓ Content removal chart created');
        }

        // 4. State Map Chart (simplified bar chart for now)
        if (data.stateSpending.length > 0) {
            createStateSpendingChart(data.stateSpending, 'map-chart');
            console.log('✓ State spending chart created');
        }

        // 5. Aligned Small Multiples
        createAlignedTimelines(data, 'aligned-chart');
        console.log('✓ Aligned timelines created');

        console.log('All visualizations created successfully!');

    } catch (error) {
        console.error('Error initializing application:', error);
        alert('Error loading data. Please check the console for details.');
    }
}

// State spending visualization (horizontal bar chart)
function createStateSpendingChart(data, containerId) {
    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    d3.select(`#${containerId}`).selectAll('*').remove();

    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Show top 15 states
    const topStates = data.sort((a, b) => b.spend - a.spend).slice(0, 15);

    const x = d3.scaleLinear()
        .domain([0, d3.max(topStates, d => d.spend)])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(topStates.map(d => d.state))
        .range([0, height])
        .padding(0.2);

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(topStates, d => d.spend)]);

    svg.selectAll('.bar')
        .data(topStates)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('y', d => y(d.state))
        .attr('height', y.bandwidth())
        .attr('x', 0)
        .attr('width', d => x(d.spend))
        .attr('fill', d => colorScale(d.spend));

    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y));

    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .ticks(5)
            .tickFormat(d => `$${d3.format('.2s')(d)}`));

    svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', height + 50)
        .style('text-anchor', 'middle')
        .text('Total Ad Spending (USD)');

    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    svg.selectAll('.bar')
        .on('mouseover', function(event, d) {
            tooltip.html(`
                <strong>${d.state}</strong><br/>
                Spending: $${d3.format(',.0f')(d.spend)}
            `)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 28) + 'px')
                .style('opacity', 1);
        })
        .on('mouseout', () => tooltip.style('opacity', 0));
}

// Aligned timelines visualization
function createAlignedTimelines(data, containerId) {
    const margin = { top: 20, right: 60, bottom: 60, left: 80 };
    const width = 1000 - margin.left - margin.right;
    const chartHeight = 120;
    const spacing = 40;
    const totalHeight = (chartHeight + spacing) * 3;

    d3.select(`#${containerId}`).selectAll('*').remove();

    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', totalHeight + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Shared x scale
    const allDates = [
        ...data.politicalAds.map(d => d.date),
        ...data.userRequests.map(d => d.date),
        ...data.contentRemoval.map(d => d.date)
    ];
    const x = d3.scaleTime()
        .domain(d3.extent(allDates))
        .range([0, width]);

    // 1. Political Ads
    const adsData = d3.rollup(data.politicalAds, v => d3.sum(v, d => d.spend), d => d.date.getTime());
    const adsArray = Array.from(adsData, ([date, spend]) => ({ date: new Date(date), value: spend }))
        .sort((a, b) => a.date - b.date);

    const y1 = d3.scaleLinear()
        .domain([0, d3.max(adsArray, d => d.value)])
        .range([chartHeight, 0]);

    const line1 = d3.line()
        .x(d => x(d.date))
        .y(d => y1(d.value))
        .curve(d3.curveMonotoneX);

    const g1 = svg.append('g');
    
    g1.append('path')
        .datum(adsArray)
        .attr('fill', 'none')
        .attr('stroke', '#667eea')
        .attr('stroke-width', 2)
        .attr('d', line1);

    g1.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y1).ticks(3).tickFormat(d => `$${d3.format('.2s')(d)}`));

    g1.append('text')
        .attr('x', -10)
        .attr('y', -5)
        .style('text-anchor', 'end')
        .style('font-weight', 'bold')
        .style('font-size', '13px')
        .text('Political Ads');

    // 2. User Requests
    const y2 = d3.scaleLinear()
        .domain([0, d3.max(data.userRequests, d => d.requests)])
        .range([chartHeight, 0]);

    const line2 = d3.line()
        .x(d => x(d.date))
        .y(d => y2(d.requests))
        .curve(d3.curveMonotoneX);

    const g2 = svg.append('g')
        .attr('transform', `translate(0,${chartHeight + spacing})`);

    g2.append('path')
        .datum(data.userRequests)
        .attr('fill', 'none')
        .attr('stroke', '#4A90E2')
        .attr('stroke-width', 2)
        .attr('d', line2);

    g2.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y2).ticks(3).tickFormat(d => d3.format('.2s')(d)));

    g2.append('text')
        .attr('x', -10)
        .attr('y', -5)
        .style('text-anchor', 'end')
        .style('font-weight', 'bold')
        .style('font-size', '13px')
        .text('User Requests');

    // 3. Content Removal
    const removalData = d3.rollup(data.contentRemoval, v => d3.sum(v, d => d.total), d => d.date.getTime());
    const removalArray = Array.from(removalData, ([date, total]) => ({ date: new Date(date), value: total }))
        .sort((a, b) => a.date - b.date);

    const y3 = d3.scaleLinear()
        .domain([0, d3.max(removalArray, d => d.value)])
        .range([chartHeight, 0]);

    const line3 = d3.line()
        .x(d => x(d.date))
        .y(d => y3(d.value))
        .curve(d3.curveMonotoneX);

    const g3 = svg.append('g')
        .attr('transform', `translate(0,${(chartHeight + spacing) * 2})`);

    g3.append('path')
        .datum(removalArray)
        .attr('fill', 'none')
        .attr('stroke', '#E24A4A')
        .attr('stroke-width', 2)
        .attr('d', line3);

    g3.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y3).ticks(3));

    g3.append('text')
        .attr('x', -10)
        .attr('y', -5)
        .style('text-anchor', 'end')
        .style('font-weight', 'bold')
        .style('font-size', '13px')
        .text('Content Removal');

    // Shared x-axis at bottom
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${totalHeight})`)
        .call(d3.axisBottom(x).ticks(10));

    svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', totalHeight + 50)
        .style('text-anchor', 'middle')
        .text('Timeline');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
