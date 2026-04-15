const SUPABASE_URL = 'https://eorcxcwhvmpbiaewtuug.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcmN4Y3dodm1wYmlhZXd0dXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTE3MzgsImV4cCI6MjA5MTcyNzczOH0.XjlCbmNIJZPisc3EhRrOlFKlihLUPBlmwrCV_JXiRuc';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function findTools() {
    const input = document.getElementById('userInput').value.toLowerCase();
    const resultsDiv = document.getElementById('results');
    
    resultsDiv.innerHTML = '<p>Searching the repository...</p>';

    let { data: tools, error } = await _supabase
        .from('tools')
        .select('*');

    if (error) {
        resultsDiv.innerHTML = '<p>Error connecting to database.</p>';
        console.error(error);
        return;
    }

    const matches = tools.filter(tool => {
        const nameMatch = tool.Name.toLowerCase().includes(input);
        const descMatch = tool.Description.toLowerCase().includes(input);

        
        const tagMatch = tool.Tag && tool.Tag.some(t => input.includes(t.toLowerCase()));
        
        return nameMatch || descMatch || tagMatch;
    });

    
    resultsDiv.innerHTML = '';
    if (matches.length === 0) {
        resultsDiv.innerHTML = '<p>No tools found for that need. Try "logo" or "writing".</p>';
    } else {
        matches.forEach(tool => {
            resultsDiv.innerHTML += `
                <div class="card">
                    <h3>${tool.Name}</h3>
                    <span class="category-badge">${tool.Category}</span>
                    <p>${tool.Description}</p>
                    <a href="${tool.URL}" target="_blank">Open Tool</a>
                </div>
            `;
        });
    }
}


async function addNewTool() {
    const name = document.getElementById('addName').value;
    const desc = document.getElementById('addDesc').value;
    const cat = document.getElementById('addCat').value;
    const url = document.getElementById('addUrl').value;
    
    const tags = document.getElementById('addTags').value.split(',').map(t => t.trim());

    if(!name || !url) {
        alert("Please enter at least a Name and URL");
        return;
    }

    const { data, error } = await _supabase
        .from('tools')
        .insert([
            { 
                Name: name, 
                Description: desc, 
                Category: cat, 
                URL: url, 
                Tag: tags 
            }
        ]);

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Tool added successfully!");

        
        document.getElementById('addName').value = '';
        document.getElementById('addDesc').value = '';
        location.reload(); 
    }
}
