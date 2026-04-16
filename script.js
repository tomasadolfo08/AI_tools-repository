// Configuration
const SUPABASE_URL = 'https://eorcxcwhvmpbiaewtuug.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcmN4Y3dodm1wYmlhZXd0dXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTE3MzgsImV4cCI6MjA5MTcyNzczOH0.XjlCbmNIJZPisc3EhRrOlFKlihLUPBlmwrCV_JXiRuc';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Load all tools when page opens
document.addEventListener('DOMContentLoaded', () => {
    findTools();
});

/**
 * Search and Category Filtering
 */
async function findTools() {
    const keyword = document.getElementById('userInput').value.toLowerCase().trim();
    const selectedCat = document.getElementById('categorySelect').value;
    const resultsDiv = document.getElementById('results');
    
    resultsDiv.innerHTML = '<p>Searching...</p>';

    let { data: toolsList, error } = await _supabase.from('tbl_AITools').select('*');

    if (error) {
        resultsDiv.innerHTML = `<p style="color:red;">Error loading tools.</p>`;
        return;
    }

    const matches = toolsList.filter(tool => {
        // Matches the EXACT category selected or "all"
        const categoryMatch = (selectedCat === 'all' || tool.Category === selectedCat);
        
        // Matches keyword in Name, Description, or Tags
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
        resultsDiv.innerHTML = '<p>No tools found for this selection.</p>';
        return;
    }

    matches.forEach(tool => {
        resultsDiv.innerHTML += `
            <div class="card">
                <div>
                    <span class="badge">${tool.Category}</span>
                    <h3>${tool.Name}</h3>
                    <p>${tool.Description || ''}</p>
                </div>
                <a href="${tool.URL}" target="_blank" class="btn-link">Visit Website →</a>
            </div>
        `;
    });
}

/**
 * Add New Tool Logic
 */
async function addNewTool() {
    const name = document.getElementById('addName').value.trim();
    const cat = document.getElementById('addCat').value;
    const url = document.getElementById('addUrl').value.trim();
    const desc = document.getElementById('addDesc').value.trim();
    const tagsInput = document.getElementById('addTags').value;
    
    const tagsArray = tagsInput ? tagsInput.split(',').map(t => t.trim().toLowerCase()) : [];

    if(!name || !url || !cat) {
        alert("Please fill in Name, Category, and URL.");
        return;
    }

    const { error } = await _supabase
        .from('tbl_AITools')
        .insert([{ 
            Name: name, 
            Description: desc, 
            Category: cat, 
            URL: url, 
            Tag: tagsArray 
        }]);

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Tool added successfully!");
        // Clear inputs
        document.getElementById('addName').value = '';
        document.getElementById('addUrl').value = '';
        document.getElementById('addDesc').value = '';
        document.getElementById('addTags').value = '';
        document.getElementById('addCat').selectedIndex = 0;
        
        // Refresh list
        findTools();
    }
}
