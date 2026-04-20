const SUPABASE_URL = 'https://eorcxcwhvmpbiaewtuug.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcmN4Y3dodm1wYmlhZXd0dXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTE3MzgsImV4cCI6MjA5MTcyNzczOH0.XjlCbmNIJZPisc3EhRrOlFKlihLUPBlmwrCV_JXiRuc';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const userInput = document.getElementById('userInput');
const categorySelect = document.getElementById('categorySelect');
const priceFilter = document.getElementById('priceFilter');
const resultsDiv = document.getElementById('results');
const resetBtn = document.getElementById('resetBtn');
const topBtn = document.getElementById('topBtn');

// INIT
window.addEventListener("DOMContentLoaded", findTools);

// SEARCH LOGIC
async function findTools() {
    const keyword = userInput.value.toLowerCase().trim();
    const category = categorySelect.value;
    const payment = priceFilter.value;

    let { data, error } = await db.from('tbl_AITools').select('*');

    if (error) {
        resultsDiv.innerHTML = "<p>Error loading tools.</p>";
        return;
    }

    const filtered = data.filter(tool => {
        const categoryMatch = category === "all" || tool.Category === category;
        const paymentMatch = payment === "all" || tool.Payment === payment;
        const text = (
            tool.Name + " " + 
            (tool.Description || "") + " " + 
            (Array.isArray(tool.Tag) ? tool.Tag.join(" ") : "")
        ).toLowerCase();
        
        return (!keyword || text.includes(keyword)) && categoryMatch && paymentMatch;
    });

    render(filtered);
}

function render(list) {
    resultsDiv.innerHTML = list.length ? "" : "<p>No tools found.</p>";
    list.forEach(t => {
        resultsDiv.innerHTML += `
        <div class="card">
            <div>
                <span class="badge">${t.Category || ""}</span>
                <h3>${t.Name}</h3>
                <p>${t.Description || ""}</p>
                <p>${t.Payment || ""} • ${(t.Languages || []).join(", ")}</p>
            </div>
            <a href="${t.URL}" target="_blank" class="btn-link">Visit</a>
        </div>`;
    });
}

// SUGGESTIONS LOGIC
userInput.addEventListener("input", async () => {
    const val = userInput.value.toLowerCase();
    const box = document.getElementById("suggestions");

    if (!val) {
        closeSuggestions();
        return;
    }

    let { data } = await db.from('tbl_AITools').select('Name');
    if (!data) return;

    const matches = data
        .map(x => x.Name)
        .filter(n => n.toLowerCase().startsWith(val))
        .slice(0, 5);

    if (matches.length > 0) {
        box.innerHTML = matches.map(m =>
            `<div onclick="selectSuggestion('${m}')">${m}</div>`
        ).join("");
        
        box.style.display = "block"; 
        userInput.classList.add('search-active');
    } else {
        closeSuggestions();
    }
});

function selectSuggestion(text) {
    userInput.value = text;
    closeSuggestions();
    findTools();
}

function closeSuggestions() {
    const box = document.getElementById("suggestions");
    if(box) {
        box.innerHTML = "";
        box.style.display = "none";
    }
    userInput.classList.remove('search-active');
}

// Close suggestions if user clicks outside
document.addEventListener('click', (e) => {
    const box = document.getElementById("suggestions");
    if (!userInput.contains(e.target) && box && !box.contains(e.target)) {
        closeSuggestions();
    }
});

// RESET
resetBtn.onclick = () => {
    userInput.value = "";
    categorySelect.value = "all";
    priceFilter.value = "all";
    closeSuggestions();
    findTools();
};

// TOP BUTTON
topBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
