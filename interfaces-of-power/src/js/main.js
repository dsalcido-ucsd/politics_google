// Entry point for the JavaScript code for the Interfaces of Power project
// This file initializes the visualizations and handles interactions on the webpage

// Import necessary visualization modules
import { renderPoliticalAds } from './visualizations/political-ads.js';
import { renderDataRequests } from './visualizations/data-requests.js';
import { renderContentRemoval } from './visualizations/content-removal.js';

// Function to initialize the visualizations
function init() {
    renderPoliticalAds();
    renderDataRequests();
    renderContentRemoval();
}

// Wait for the DOM to fully load before initializing visualizations
document.addEventListener('DOMContentLoaded', init);