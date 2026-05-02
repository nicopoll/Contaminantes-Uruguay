// js/table.js

// Sample data that would typically come from an API or database
const data = [
    { id: 1, name: 'Sample Data 1', value: 10 },
    { id: 2, name: 'Sample Data 2', value: 20 },
    { id: 3, name: 'Sample Data 3', value: 30 },
    // More data entries
];

// Function to filter data based on a search term
function filterData(searchTerm) {
    return data.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
}

// Function to populate the table with given data
function populateTable(dataToDisplay) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ''; // Clear existing table rows

    dataToDisplay.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.value}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Example usage
// const filteredData = filterData('Sample');
// populateTable(filteredData);