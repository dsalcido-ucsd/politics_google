// Data loader utility for loading and parsing CSV files

const DataLoader = {
    // Load political ads data
    async loadPoliticalAds() {
        const data = await d3.csv('data/processed/political_ads_party_weekly.csv');
        return data.map(d => ({
            date: new Date(d.Week_Start_Date),
            party: d.Party,
            spend: +d.Spend_USD
        }));
    },

    // Load user data requests
    async loadUserDataRequests() {
        const data = await d3.csv('data/processed/us_user_data_requests.csv');
        return data.map(d => ({
            date: new Date(d.Period_Ending),
            requests: +d['User Data Requests'],
            accounts: +d.Accounts,
            disclosureRate: +d.Percentage_Disclosed
        }));
    },

    // Load content removal requests
    async loadContentRemoval() {
        const data = await d3.csv('data/processed/us_content_removal_by_reason.csv');
        return data.map(d => ({
            date: new Date(d.Period_Ending),
            reason: d.Reason,
            total: +d.Total
        }));
    },

    // Load state-level spending
    async loadStateSpending() {
        const data = await d3.csv('data/processed/political_ads_state_spend.csv');
        return data.map(d => ({
            state: d.State,
            spend: +d.Spend_USD
        }));
    },

    // Load all data at once
    async loadAll() {
        const [politicalAds, userRequests, contentRemoval, stateSpending] = await Promise.all([
            this.loadPoliticalAds(),
            this.loadUserDataRequests(),
            this.loadContentRemoval(),
            this.loadStateSpending()
        ]);

        return {
            politicalAds,
            userRequests,
            contentRemoval,
            stateSpending
        };
    }
};
