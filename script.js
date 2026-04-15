const SUPABASE_URL = 'https://eorcxcwhvmpbiaewtuug.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcmN4Y3dodm1wYmlhZXd0dXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTE3MzgsImV4cCI6MjA5MTcyNzczOH0.XjlCbmNIJZPisc3EhRrOlFKlihLUPBlmwrCV_JXiRuc';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function findTools() {
    const input = document.getElementById('userInput').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('results');
    
    if (!input) {
        resultsDiv.innerHTML = '<p>Please enter something to search for.</p>';
        return;
    }

    resultsDiv.innerHTML = '<p>Scouring the database...</p>';

    let { data: tools, error } = await _supabase.from('tools').select('*');

    if (error) {
        resultsDiv.innerHTML = '<p>Error: Could not connect to Supabase.</p>';
        return;
    }

    const inputWords = input.split(/\s+/);

    const matches = tools.filter(tool => {
        const nameMatch = tool.name.toLowerCase().includes(input);
        const descMatch = tool.description?.toLowerCase().includes(input);
        
        // Search inside the text array
        const tagMatch = tool.tag && tool.tag.some(t => 
            inputWords.some(word => word.length > 2 && t.toLowerCase().includes(word))
        );

        return nameMatch || descMatch || tagMatch;
    });

    displayResults(matches);
}

function displayResults(matches) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (matches.length === 0) {
        resultsDiv.innerHTML = '<p>No matches found. Try specific keywords.</p>';
        return;
    }

    matches.forEach(tool => {
        resultsDiv.innerHTML += `
            <div class="card">
                <div>
                    <h3>${tool.name}</h3>
                    <span class="badge">${tool.category || 'AI Tool'}</span>
                    <p>${tool.description || ''}</p>
                </div>
                <a href="${tool.url}" target="_blank" class="btn-link">View Tool</a>
            </div>
        `;
    });
}

async function addNewTool() {
    const name = document.getElementById('addName').value.trim();
    const desc = document.getElementById('addDesc').value.trim();
    const cat = document.getElementById('addCat').value.trim();
    const url = document.getElementById('addUrl').value.trim();
    const tagsInput = document.getElementById('addTags').value;
    
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim().toLowerCase()) : [];

    if(!name || !url) {
        alert("Name and URL are required.");
        return;
    }

    const { error } = await _supabase
        .from('tools')
        .insert([{ 
            name: name, 
            description: desc, 
            category: cat, 
            url: url, 
            tag: tags 
        }]);

    if (error) {
        if (error.code === '23505') {
            const conflict = error.message.includes('name') ? 'Name' : 'URL';
            alert(`Error: This ${conflict} is already in the database.`);
        } else {
            alert("Error: " + error.message);
        }
    } else {
        alert("Tool added successfully!");
        document.querySelectorAll('.add-section input, .add-section textarea').forEach(el => el.value = '');
        findTools();
    }
}
