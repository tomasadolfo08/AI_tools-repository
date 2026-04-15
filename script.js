async function findTools() {
    const response = await fetch('tools.json');
    const tools = await response.json();
    const input = document.getElementById('userInput').value.toLowerCase();
    const resultsDiv = document.getElementById('results');
    
    // Clear previous results
    resultsDiv.innerHTML = '';

    // Filter tools based on keywords in tags or description
    const matches = tools.filter(tool => {
        return tool.tags.some(tag => input.includes(tag)) || 
               tool.description.toLowerCase().includes(input);
    });

    // Display the tools
    matches.forEach(tool => {
        resultsDiv.innerHTML += `
            <div class="card">
                <h3>${tool.name}</h3>
                <p>${tool.description}</p>
                <a href="${tool.url}" target="_blank">Visit Tool</a>
            </div>
        `;
    });

    if(matches.length === 0) {
        resultsDiv.innerHTML = '<p>No tools found. Try searching for "logo" or "writing".</p>';
    }
}
