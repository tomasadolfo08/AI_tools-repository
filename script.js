const SUPABASE_URL = 'https://eorcxcwhvmpbiaewtuug.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcmN4Y3dodm1wYmlhZXd0dXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTE3MzgsImV4cCI6MjA5MTcyNzczOH0.XjlCbmNIJZPisc3EhRrOlFKlihLUPBlmwrCV_JXiRuc';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', findTools);

// SEARCH
async function findTools() {
    const keyword = userInput.value.toLowerCase().trim();
    const selectedCats = [...categorySelect.selectedOptions].map(o => o.value);
    const price = priceFilter.value;
    const resultsDiv = document.getElementById('results');

    resultsDiv.innerHTML = '<p>Searching...</p>';

    let { data: toolsList, error } = await _supabase.from('tbl_AITools').select('*');

    if (error) {
        resultsDiv.innerHTML = `<p style="color:red;">Error loading tools.</p>`;
        return;
    }

    const matches = toolsList.filter(tool => {

        const categoryMatch =
            selectedCats.includes('all') ||
            selectedCats.length === 0 ||
            selectedCats.includes(tool.Category);

        const priceMatch =
            price === 'all' || tool.Price === price;

        const text = [
            tool.Name,
            tool.Description,
            ...(tool.Tag || [])
        ].join(' ').toLowerCase();

        return categoryMatch && priceMatch && (!keyword || text.includes(keyword));
    });

    displayResults(matches);
}

// DISPLAY
function displayResults(matches) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (!matches.length) {
        resultsDiv.innerHTML = '<p>No tools found.</p>';
        return;
    }

    matches.forEach(tool => {
        resultsDiv.innerHTML += `
        <div class="card">
            <div>
                <span class="badge">${tool.Category}</span>
                <h3>${tool.Name}</h3>
                <p>${tool.Description || ''}</p>
                <p><strong>${tool.Price || ''}</strong> • ${tool.Languages?.join(', ') || ''}</p>
            </div>
            <a href="${tool.URL}" target="_blank" class="btn-link">Visit Website →</a>
        </div>`;
    });
}

// ADD TOOL
async function addNewTool() {
    const name = addName.value.trim();
    const cat = addCat.value;
    const url = addUrl.value.trim();
    const desc = addDesc.value.trim();
    const tagsInput = addTags.value;
    const langInput = addLang.value;
    const price = addPrice.value;

    const tagsArray = tagsInput ? tagsInput.split(',').map(t => t.trim().toLowerCase()) : [];
    const languagesArray = langInput ? langInput.split(',').map(l => l.trim()) : [];

    if(!name || !url || !cat) {
        alert("Please fill in Name, Category, and URL.");
        return;
    }

    const { error } = await _supabase.from('tbl_AITools').insert([{
        Name: name,
        Description: desc,
        Category: cat,
        URL: url,
        Tag: tagsArray,
        Price: price,
        Languages: languagesArray
    }]);

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Tool added!");
        addName.value = '';
        addUrl.value = '';
        addDesc.value = '';
        addTags.value = '';
        addLang.value = '';
        addCat.selectedIndex = 0;

        findTools();
    }
}

// RESET
resetBtn.onclick = () => {
    userInput.value = '';
    categorySelect.selectedIndex = 0;
    priceFilter.value = 'all';
    findTools();
};

// TOP BUTTON
topBtn.onclick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// SUGGESTIONS
userInput.addEventListener('input', showSuggestions);

async function showSuggestions() {
    const value = userInput.value.toLowerCase();
    const box = document.getElementById('suggestions');

    if (!value) return box.innerHTML = '';

    const { data } = await _supabase.from('tbl_AITools').select('Name');

    const matches = data
        .map(t => t.Name)
        .filter(name => name.toLowerCase().startsWith(value))
        .slice(0, 5);

    box.innerHTML = matches.map(m =>
        `<div onclick="selectSuggestion('${m}')">${m}</div>`
    ).join('');
}

function selectSuggestion(text) {
    userInput.value = text;
    document.getElementById('suggestions').innerHTML = '';
}
