// Configuration
const SUPABASE_URL = 'https://eorcxcwhvmpbiaewtuug.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcmN4Y3dodm1wYmlhZXd0dXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTE3MzgsImV4cCI6MjA5MTcyNzczOH0.XjlCbmNIJZPisc3EhRrOlFKlihLUPBlmwrCV_JXiRuc';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Search for AI tools in tbl_AITools
 */
async function findTools() {
    const input = document.getElementById('userInput').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('results');
    
    if (!input) {
        resultsDiv.innerHTML = '<p>Please enter a search term.</p>';
        return;
    }

    resultsDiv.innerHTML = '<p>Searching the database...</p>';

    // IMPORTANT: Table name changed to match your Supabase table exactly
    let { data: toolsList, error } = await _supabase
        .from('tbl_AITools') 
        .select('*');

    if (error) {
        console.error("Supabase Error:", error);
        resultsDiv.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
        return;
    }

    const inputWords = input.split(/\s+/);

    const matches = toolsList.filter(tool => {
        // Matches your capitalized column names: Name, Description, Tag
        const nameMatch = tool.Name && tool.Name.toLowerCase().includes(input);
        const descMatch = tool.Description && tool.Description.toLowerCase().includes(input);
        
        // Search inside the 'Tag' text array
        const tagMatch = tool.Tag && tool.Tag.some(t => 
            inputWords.some(word => word.length > 2 && t.toLowerCase().includes(word))
        );

        return nameMatch || descMatch || tagMatch;
    });

    displayResults(matches);
}

/**
 * Render the filtered list to the UI
 */
function displayResults(matches) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (matches.length === 0) {
        resultsDiv.innerHTML = '<p>No tools found for that request. Try different keywords.</p>';
        return;
    }

    matches.forEach(tool => {
        // Using your exact Column Names: Name, Category, Description, URL
        resultsDiv.innerHTML += `
            <div class="card">
                <div>
                    <h3>${tool.Name}</h3>
                    <span class="badge">${tool.Category || 'General AI'}</span>
                    <p>${tool.Description || 'No description available.'}</p>
                </div>
                <a href="${tool.URL}" target="_blank" class="btn-link">Open Tool</a>
            </div>
        `;
    });
}

/**
 * Insert a new tool into tbl_AITools
 */
async function addNewTool() {
    const name = document.getElementById('addName').value.trim();
    const desc = document.getElementById('addDesc').value.trim();
    const cat = document.getElementById('addCat').value.trim();
    const url = document.getElementById('addUrl').value.trim();
    const tagsInput = document.getElementById('addTags').value;
    
    // Process comma-separated tags into a clean array
    const tagsArray = tagsInput ? tagsInput.split(',').map(t => t.trim().toLowerCase()) : [];

    if(!name || !url) {
        alert("A Name and URL are required to submit.");
        return;
    }

    // IMPORTANT: Table name and keys match your Supabase setup exactly
    const { data, error } = await _supabase
        .from('tbl_AITools') 
        .insert([{ 
            Name: name, 
            Description: desc, 
            Category: cat, 
            URL: url, 
            Tag: tagsArray 
        }]);

    if (error) {
        console.error("Insert Error:", error);
        // Handle Unique Constraint violations for Name or URL
        if (error.code === '23505') {
            alert("This tool (Name or URL) already exists in the repository.");
        } else {
            alert("Failed to add tool: " + error.message);
        }
    } else {
        alert("Tool successfully added to the repository!");
        
        // Clear the form
        document.querySelectorAll('.add-section input, .add-section textarea').forEach(el => el.value = '');
        
        // Refresh the list
        findTools();
    }
}
