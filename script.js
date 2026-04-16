// Configuration
const SUPABASE_URL = 'https://eorcxcwhvmpbiaewtuug.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcmN4Y3dodm1wYmlhZXd0dXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTE3MzgsImV4cCI6MjA5MTcyNzczOH0.XjlCbmNIJZPisc3EhRrOlFKlihLUPBlmwrCV_JXiRuc';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    findTools(); // Load all tools initially
});

/**
 * Fetch unique categories and fill dropdown
 */
async function loadCategories() {
    let { data, error } = await _supabase.from('tbl_AITools').select('Category');
    if (error) return console.error(error);

    const uniqueCategories = [...new Set(data.map(item => item.Category).filter(Boolean))].sort();
    const select = document.getElementById('categorySelect');
    
    // Clear except the first option
    select.innerHTML = '<option value="all">All Categories</option>';
    
    uniqueCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

/**
 * Search and Filter logic
 */
async function findTools() {
    const keyword = document.getElementById('userInput').value.toLowerCase().trim();
    const selectedCat = document.getElementById('categorySelect').value;
    const resultsDiv = document.getElementById('results');
    
    resultsDiv.innerHTML = '<p>Searching...</p>';

    let { data: toolsList, error } = await _supabase.from('tbl_AITools').select('*');

    if (error) {
        resultsDiv.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
        return;
    }

    const matches = toolsList.filter(tool => {
        const categoryMatch = (selectedCat === 'all' || tool.Category === selectedCat);
        
        const nameMatch = tool.Name?.toLowerCase().includes(keyword);
        const descMatch = tool.Description?.toLowerCase().includes(keyword);
        const tagMatch = tool.Tag?.some(t => t.toLowerCase().includes(keyword));

        if (!keyword) return categoryMatch;
        return categoryMatch && (nameMatch || descMatch || tagMatch);
    });

    displayResults(matches);
}

function displayResults(matches) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (matches.length === 0) {
        resultsDiv.innerHTML = '<p>No tools found. Try different criteria.</p>';
        return;
    }

    matches.forEach(tool => {
        resultsDiv.innerHTML += `
            <div class="card">
                <div>
                    <span class="badge">${tool.Category || 'General'}</span>
                    <h3>${tool.Name}</h3>
                    <p>${tool.Description || ''}</p>
                </div>
                <a href="${tool.URL}" target="_blank" class="btn-link">Visit Website →</a>
            </div>
        `;
    });
}

/**
 * Insert new tool
 */
async function addNewTool() {
    const toolData = {
        Name: document.getElementById('addName').value.trim(),
        Description: document.getElementById('addDesc').value.trim(),
        Category: document.getElementById('addCat').value.trim(),
        URL: document.getElementById('addUrl').value.trim(),
        Tag: document.getElementById('addTags').value.split(',').map(t => t.trim().toLowerCase())
    };

    if(!toolData.Name || !toolData.URL) return alert("Name and URL required.");

    const { error } = await _supabase.from('tbl_AITools').insert([toolData]);

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Success!");
        location.reload(); // Refresh to update list and categories
    }
}
