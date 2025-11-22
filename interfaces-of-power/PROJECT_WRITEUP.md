# Interfaces of Power: Project Writeup

## What Have We Done So Far?

We have developed an interactive explorable explanation that visualizes three critical dimensions of political power operating through Google's infrastructure. The project began with extensive data preparation, where we cleaned and processed multiple datasets from Google's transparency reports, including over 1 million government data requests, 12,000 content removal requests, and $2.2 billion in political advertising spending spanning from 2009 to 2024. Using Python and Pandas in Jupyter notebooks, we aggregated this complex multi-year, multi-jurisdiction data into coherent time series that could reveal meaningful patterns across election cycles and political administrations.

On the visualization front, we have implemented three fully interactive D3.js charts with advanced user interactions. The political advertising visualization features a sophisticated brush-and-zoom interface that allows users to select specific time ranges for detailed examination, along with clickable legend items that enable filtering by political party with smooth animated transitions. The user data requests chart uses a multi-line design with dual y-axes to simultaneously display request volumes and disclosure rates, while the content removal chart employs a stacked bar approach to categorize the reasons governments seek to suppress content. All three visualizations include hover tooltips that provide detailed contextual information, and the entire site has been styled with a custom dark theme that matches the user's portfolio aesthetic, creating a cohesive and professional presentation.

## What Will Be Most Challenging to Design?

The most challenging aspects of this project moving forward will be implementing the geographic map visualization and the radar chart that synthesizes all three data dimensions. The U.S. map showing state-level political ad spending presents technical challenges including obtaining accurate GeoJSON or TopoJSON data for state boundaries, implementing proper map projections (likely Albers USA for optimal state representation), creating an effective color scale that handles the extreme range from small states like Vermont ($2.5M) to California ($245M), and designing interactive features such as tooltips and state highlighting that work smoothly across different screen sizes. Additionally, the map must handle the complexity of overlaying quantitative data on geographic space while maintaining readability and avoiding visual clutter, particularly for smaller northeastern states where space is limited.

The radar chart (also called a spider chart) comparing persuasion, surveillance, and censorship metrics for each time period presents an entirely different set of challenges. First, we must normalize three fundamentally different scales—advertising spending (in billions), data requests (in thousands), and content removals (in hundreds)—into comparable dimensions without losing the meaningful relationships between them. The chart needs to dynamically update as users select different time periods, requiring sophisticated data filtering and aggregation logic that can handle varying time granularities (political ads are weekly, data requests are semi-annual, and content removal varies by year). Furthermore, the radar chart must clearly communicate how each period "leans" toward different types of power exercise, which requires careful axis labeling, color coding, and potentially animated transitions as users explore different time ranges. Finally, both of these advanced visualizations need to be integrated seamlessly with the existing brush-and-filter interactions, creating a coordinated multi-view system where selections in one chart update all others—a significant engineering challenge that requires careful state management and event handling across multiple D3.js components.

---

## Key Insights from Current Visualizations

### Political Ad Spending
"Other" advertisers (PACs, advocacy groups, ballot measures) outspend both major parties combined, representing $1.56 billion vs. $359M (Democratic) and $285M (Republican). Spending peaks sharply before November elections, demonstrating clear cyclical patterns tied to the electoral calendar.

### Government Data Requests
Government surveillance through Google has grown steadily, from approximately 3,600 requests in 2009 to over 60,000 per period by 2024. Google's disclosure rate has fluctuated between 70-90% over time, indicating varying levels of transparency in response to legal demands.

### Content Removal Requests
Defamation (6,731 requests) dominates content removal, followed by privacy concerns (1,346) and fraud (1,005). National security requests, while highly publicized in media coverage, represent a smaller fraction of total removals, suggesting that content moderation is driven more by civil disputes than security concerns.

### Geographic Distribution (Planned)
California leads with $245M in spending (driven by large population), followed by Pennsylvania ($189M), Michigan ($141M), and Georgia ($137M)—all critical swing states in recent elections. This pattern reveals how political advertising concentrates resources in competitive electoral battlegrounds.

### Temporal Alignment (Planned)
Political advertising follows a strong cyclical pattern tied to elections, while surveillance and content removal show steady, long-term growth independent of election cycles. This divergence suggests different operational logics: advertising responds to electoral competition, while government data access and content moderation operate on continuous, bureaucratic timelines.
