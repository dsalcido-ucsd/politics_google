// Main application file

// Initialize the application
async function init() {
    try {
        console.log('Loading data...');
        
        // Show loading indicators
        document.querySelectorAll('.chart-container').forEach(el => {
            if (!el.querySelector('.chart-loading')) {
                el.innerHTML = '<div class="chart-loading" style="display:flex;align-items:center;justify-content:center;height:300px;color:#6fb0ff;">Loading...</div>';
            }
        });
        
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

        // Initialize section indicator
        initSectionIndicator();

    } catch (error) {
        console.error('Error initializing application:', error);
        document.querySelectorAll('.chart-loading').forEach(el => {
            el.innerHTML = '<div style="color:#E24A4A;">Error loading chart. Check console.</div>';
        });
    }
}

// Section indicator for navigation
function initSectionIndicator() {
    const sections = document.querySelectorAll('.visualization-section');
    const indicator = document.createElement('nav');
    indicator.className = 'section-indicator';
    indicator.setAttribute('aria-label', 'Section navigation');
    
    sections.forEach((section, i) => {
        const dot = document.createElement('button');
        dot.className = 'section-dot';
        dot.setAttribute('aria-label', `Go to section ${i + 1}`);
        dot.setAttribute('tabindex', '0');
        dot.dataset.index = i;
        dot.addEventListener('click', () => {
            section.scrollIntoView({ behavior: 'smooth' });
        });
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
        indicator.appendChild(dot);
    });
    
    document.body.appendChild(indicator);

    // Update active section on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(sections).indexOf(entry.target);
                document.querySelectorAll('.section-dot').forEach((dot, i) => {
                    dot.classList.toggle('active', i === index);
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => observer.observe(section));
}

// State spending visualization (horizontal bar chart)
function createStateSpendingChart(data, containerId) {
    const margin = { top: 50, right: 30, bottom: 60, left: 90 };
    const totalWidth = 1000;
    const totalHeight = 500;
    const width = totalWidth - margin.left - margin.right;
    const height = totalHeight - margin.top - margin.bottom;

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
        .text('Top 15 States by Political Ad Spending');

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

    // Add grid lines
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisBottom(x)
            .tickSize(height)
            .tickFormat('')
        )
        .style('stroke-opacity', 0.1);

    svg.selectAll('.bar')
        .data(topStates)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('y', d => y(d.state))
        .attr('height', y.bandwidth())
        .attr('x', 0)
        .attr('width', 0)
        .attr('fill', d => colorScale(d.spend))
        .attr('rx', 3)
        .transition()
        .duration(800)
        .delay((d, i) => i * 50)
        .attr('width', d => x(d.spend));

    // Add value labels on bars
    svg.selectAll('.bar-label')
        .data(topStates)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('y', d => y(d.state) + y.bandwidth() / 2)
        .attr('x', d => x(d.spend) + 5)
        .attr('dy', '.35em')
        .style('font-size', '11px')
        .style('fill', '#b8cfe6')
        .style('opacity', 0)
        .text(d => `$${d3.format('.2s')(d.spend)}`)
        .transition()
        .duration(500)
        .delay((d, i) => 800 + i * 50)
        .style('opacity', 1);

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
        .attr('y', height + 45)
        .style('text-anchor', 'middle')
        .text('Total Ad Spending (USD)');

    const tooltip = d3.select('body').select('.tooltip').empty() 
        ? d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0)
        : d3.select('body').select('.tooltip');

    svg.selectAll('.bar')
        .on('mouseover', function(event, d) {
            d3.select(this).style('opacity', 0.8);
            tooltip.html(`
                <strong>${d.state}</strong><br/>
                Spending: $${d3.format(',.0f')(d.spend)}
            `)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 28) + 'px')
                .style('opacity', 1);
        })
        .on('mouseout', function() {
            d3.select(this).style('opacity', 1);
            tooltip.style('opacity', 0);
        });
}

// Aligned timelines visualization
function createAlignedTimelines(data, containerId) {
    const margin = { top: 50, right: 80, bottom: 60, left: 120 };
    const totalWidth = 1000;
    const chartHeight = 120;
    const spacing = 40;
    const totalHeight = (chartHeight + spacing) * 3 + margin.top + margin.bottom;

    d3.select(`#${containerId}`).selectAll('*').remove();

    // Create responsive SVG with viewBox
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('height', 'auto')
        .style('max-height', `${totalHeight}px`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const width = totalWidth - margin.left - margin.right;

    // Add chart title inside SVG
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', -25)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('fill', '#e6eef8')
        .text('Three Dimensions of Political Power Over Time');

    // Shared x scale
    const allDates = [
        ...data.politicalAds.map(d => d.date),
        ...data.userRequests.map(d => d.date),
        ...data.contentRemoval.map(d => d.date)
    ];
    const x = d3.scaleTime()
        .domain(d3.extent(allDates))
        .range([0, width]);

    // Election dates for annotations
    const electionDates = [
        { date: new Date('2018-11-06'), label: '\'18' },
        { date: new Date('2020-11-03'), label: '\'20' },
        { date: new Date('2022-11-08'), label: '\'22' },
        { date: new Date('2024-11-05'), label: '\'24' }
    ];

    // 1. Political Ads
    const adsData = d3.rollup(data.politicalAds, v => d3.sum(v, d => d.spend), d => d.date.getTime());
    const adsArray = Array.from(adsData, ([date, spend]) => ({ date: new Date(date), value: spend }))
        .sort((a, b) => a.date - b.date);

    const y1 = d3.scaleLinear()
        .domain([0, d3.max(adsArray, d => d.value)])
        .range([chartHeight, 0]);

    const area1 = d3.area()
        .x(d => x(d.date))
        .y0(chartHeight)
        .y1(d => y1(d.value))
        .curve(d3.curveMonotoneX);

    const g1 = svg.append('g');

    // Add area fill
    g1.append('path')
        .datum(adsArray)
        .attr('fill', 'rgba(102, 126, 234, 0.3)')
        .attr('d', area1);
    
    g1.append('path')
        .datum(adsArray)
        .attr('fill', 'none')
        .attr('stroke', '#667eea')
        .attr('stroke-width', 2)
        .attr('d', d3.line().x(d => x(d.date)).y(d => y1(d.value)).curve(d3.curveMonotoneX));

    // Add election lines
    electionDates.forEach(e => {
        if (e.date >= x.domain()[0] && e.date <= x.domain()[1]) {
            g1.append('line')
                .attr('x1', x(e.date))
                .attr('x2', x(e.date))
                .attr('y1', 0)
                .attr('y2', chartHeight)
                .style('stroke', '#FFD700')
                .style('stroke-width', 1)
                .style('stroke-dasharray', '3,3')
                .style('opacity', 0.5);
        }
    });

    g1.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y1).ticks(3).tickFormat(d => `$${d3.format('.2s')(d)}`));

    g1.append('text')
        .attr('x', -70)
        .attr('y', chartHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-weight', 'bold')
        .style('font-size', '12px')
        .style('fill', '#667eea')
        .text('Ads');

    // 2. User Requests
    const y2 = d3.scaleLinear()
        .domain([0, d3.max(data.userRequests, d => d.requests)])
        .range([chartHeight, 0]);

    const area2 = d3.area()
        .x(d => x(d.date))
        .y0(chartHeight)
        .y1(d => y2(d.requests))
        .curve(d3.curveMonotoneX);

    const g2 = svg.append('g')
        .attr('transform', `translate(0,${chartHeight + spacing})`);

    g2.append('path')
        .datum(data.userRequests)
        .attr('fill', 'rgba(74, 144, 226, 0.3)')
        .attr('d', area2);

    g2.append('path')
        .datum(data.userRequests)
        .attr('fill', 'none')
        .attr('stroke', '#4A90E2')
        .attr('stroke-width', 2)
        .attr('d', d3.line().x(d => x(d.date)).y(d => y2(d.requests)).curve(d3.curveMonotoneX));

    electionDates.forEach(e => {
        if (e.date >= x.domain()[0] && e.date <= x.domain()[1]) {
            g2.append('line')
                .attr('x1', x(e.date))
                .attr('x2', x(e.date))
                .attr('y1', 0)
                .attr('y2', chartHeight)
                .style('stroke', '#FFD700')
                .style('stroke-width', 1)
                .style('stroke-dasharray', '3,3')
                .style('opacity', 0.5);
        }
    });

    g2.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y2).ticks(3).tickFormat(d => d3.format('.2s')(d)));

    g2.append('text')
        .attr('x', -70)
        .attr('y', chartHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-weight', 'bold')
        .style('font-size', '12px')
        .style('fill', '#4A90E2')
        .text('Requests');

    // 3. Content Removal
    const removalData = d3.rollup(data.contentRemoval, v => d3.sum(v, d => d.total), d => d.date.getTime());
    const removalArray = Array.from(removalData, ([date, total]) => ({ date: new Date(date), value: total }))
        .sort((a, b) => a.date - b.date);

    const y3 = d3.scaleLinear()
        .domain([0, d3.max(removalArray, d => d.value)])
        .range([chartHeight, 0]);

    const area3 = d3.area()
        .x(d => x(d.date))
        .y0(chartHeight)
        .y1(d => y3(d.value))
        .curve(d3.curveMonotoneX);

    const g3 = svg.append('g')
        .attr('transform', `translate(0,${(chartHeight + spacing) * 2})`);

    g3.append('path')
        .datum(removalArray)
        .attr('fill', 'rgba(226, 74, 74, 0.3)')
        .attr('d', area3);

    g3.append('path')
        .datum(removalArray)
        .attr('fill', 'none')
        .attr('stroke', '#E24A4A')
        .attr('stroke-width', 2)
        .attr('d', d3.line().x(d => x(d.date)).y(d => y3(d.value)).curve(d3.curveMonotoneX));

    electionDates.forEach(e => {
        if (e.date >= x.domain()[0] && e.date <= x.domain()[1]) {
            g3.append('line')
                .attr('x1', x(e.date))
                .attr('x2', x(e.date))
                .attr('y1', 0)
                .attr('y2', chartHeight)
                .style('stroke', '#FFD700')
                .style('stroke-width', 1)
                .style('stroke-dasharray', '3,3')
                .style('opacity', 0.5);
        }
    });

    g3.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y3).ticks(3));

    g3.append('text')
        .attr('x', -70)
        .attr('y', chartHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-weight', 'bold')
        .style('font-size', '12px')
        .style('fill', '#E24A4A')
        .text('Removals');

    // Shared x-axis at bottom
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${(chartHeight + spacing) * 3 - spacing})`)
        .call(d3.axisBottom(x).ticks(10));

    // Election year labels at bottom
    const legendG = svg.append('g')
        .attr('transform', `translate(${width + 10}, 0)`);

    legendG.append('text')
        .attr('x', 0)
        .attr('y', 10)
        .style('font-size', '10px')
        .style('fill', '#FFD700')
        .text('Elections:');

    electionDates.forEach((e, i) => {
        legendG.append('text')
            .attr('x', 0)
            .attr('y', 28 + i * 16)
            .style('font-size', '9px')
            .style('fill', '#FFD700')
            .text(e.label.replace('\'', '20'));
    });
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
