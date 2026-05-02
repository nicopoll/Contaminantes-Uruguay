// js/map.js

// Load sample data from JSON
fetch('data/sample-data.json')
    .then(response => response.json())
    .then(data => {
        // Initialize the Leaflet map centered on Uruguay
        const map = L.map('map').setView([-32.5, -56.0], 6);

        // Set up the tile layer for the map
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
        }).addTo(map);

        // Function to filter data by contaminant type
        function filterByContaminantType(data, type) {
            return data.filter(sample => sample.contaminantType === type);
        }

        // Function to filter data by date range
        function filterByDateRange(data, startDate, endDate) {
            return data.filter(sample => {
                const sampleDate = new Date(sample.date);
                return sampleDate >= new Date(startDate) && sampleDate <= new Date(endDate);
            });
        }

        // Function to filter data by specific sample
        function filterBySample(data, sampleId) {
            return data.filter(sample => sample.id === sampleId);
        }

        // Function to populate markers on the map
        function populateMarkers(filteredData) {
            filteredData.forEach(sample => {
                const marker = L.marker([sample.lat, sample.lon]).addTo(map);
                marker.bindPopup(`<b>${sample.contaminantType}</b><br>Date: ${sample.date}<br>Sample ID: ${sample.id}`);
            });
        }

        // Example usage of filtering functions
        const contaminantType = 'Lead'; // Example contaminant type
        const startDate = '2022-01-01'; // Example start date
        const endDate = '2025-12-31'; // Example end date
        const filteredData = filterByContaminantType(data, contaminantType);
        const dateFilteredData = filterByDateRange(filteredData, startDate, endDate);
        populateMarkers(dateFilteredData);
    })
    .catch(error => console.error('Error loading sample data:', error));