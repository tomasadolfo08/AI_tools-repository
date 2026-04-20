const SUPABASE_URL = 'https://eorcxcwhvmpbiaewtuug.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcmN4Y3dodm1wYmlhZXd0dXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTE3MzgsImV4cCI6MjA5MTcyNzczOH0.XjlCbmNIJZPisc3EhRrOlFKlihLUPBlmwrCV_JXiRuc';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM ELEMENTS
const userInput = document.getElementById('userInput');
const categorySelect = document.getElementById('categorySelect');
const priceFilter = document.getElementById('priceFilter');
const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');
const resultsDiv = document.getElementById('results');
const topBtn = document.getElementById('topBtn');

// ADD FORM ELEMENTS
const addName = document.getElementById('addName');
const addCat = document.getElementById('addCat');
const addUrl = document.getElementById('addUrl');
const addTags = document.getElementById('addTags');
const addLang = document.getElementById('addLang');
const addPayment = document.getElementById('addPayment');
const addDesc = document.getElementById('addDesc');
const addToolBtn = document.getElementById('addToolBtn');

// INITIAL LOAD
window.addEventListener("DOMContentLoaded", findTools);

// --- CORE FUNCTIONS ---

async function findTools() {
    let { data, error } = await db.from('tbl_AITools').select('*');
    if (error) {
        resultsDiv.innerHTML = "<p>Error loading tools.</p>";
        return;
    }

    const keyword = userInput.value.toLowerCase().trim();
    const category = categorySelect.value;
    const payment = priceFilter.value;

    const filtered = data.filter(t => {
        const catMatch = category === "all" || t.Category === category;
        const payMatch = payment === "all" || t.Payment === payment;
        const text = `${t.Name} ${t.Description} ${Array.isArray(t.Tag) ? t.Tag.join(' ') : ''}`.toLowerCase();
        return (!keyword || text.includes(keyword)) && catMatch && payMatch;
    });

    render(filtered);
}

function render(list) {
    resultsDiv.innerHTML = list.length ? "" : "<p>No tools found.</p>";
    list.forEach(t => {
        resultsDiv.innerHTML += `
        <div class="card">
            <div>
                <span class="badge">${t.Category || "General"}</span>
                <h3>${t.Name}</h3>
                <p>${t.Description || ""}</p>
                <p><strong>${t.Payment}</strong> • ${Array.isArray(t.Languages) ? t.Languages.join(", ") : t.Languages || ""}</p>
            </div>
            <a href="${t.URL}" target="_blank" class="btn-link">Visit Tool →</a>
        </div>`;
    });
}

// --- ADD TOOL LOGIC ---
async function addNewTool() {
    const newTool = {
        Name: addName.value.trim(),
        Category: addCat.value,
        URL: addUrl.value.trim(),
        Description: addDesc.value.trim(),
        Tag: addTags.value ? addTags.value.split(',').map(s => s.trim()) : [],
        Languages: addLang.value ? addLang.value.split(',').map(s => s.trim()) : [],
        Payment: addPayment.value
    };

    if (!newTool.Name || !newTool.URL || !newTool.Category) {
        alert("Please fill in Name, URL, and Category!");
        return;
    }

    const { error } = await db.from('tbl_AITools').insert([newTool]);

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Tool added successfully!");
        // Clear fields
        [addName, addUrl, addTags, addLang, addDesc].forEach(el => el.value = "");
        addCat.value = "";
        findTools(); // Refresh list
    }
}

// --- SUGGESTIONS LOGIC ---
userInput.addEventListener('input', async () => {
    const val = userInput.value.toLowerCase();
    const box = document.getElementById('suggestions');

    if (!val) {
        closeSuggestions();
        return;
    }

    let { data } = await db.from('tbl_AITools').select('Name');
    const matches = data
        .map(d => d.Name)
        .filter(n => n.toLowerCase().startsWith(val))
        .slice(0, 5);

    if (matches.length > 0) {
        box.innerHTML = matches.map(m => `<div class="suggestion-item">${m}</div>`).join("");
        box.style.display = "block";
        userInput.classList.add('search-active');

        // Handle suggestion clicks
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                userInput.value = item.innerText;
                closeSuggestions();
                findTools();
            });
        });
    } else {
        closeSuggestions();
    }
});

function closeSuggestions() {
    const box = document.getElementById('suggestions');
    box.style.display = "none";
    userInput.classList.remove('search-active');
}

// --- EVENT LISTENERS ---
searchBtn.addEventListener('click', findTools);
addToolBtn.addEventListener('click', addNewTool);
resetBtn.addEventListener('click', () => {
    userInput.value = "";
    categorySelect.value = "all";
    priceFilter.value = "all";
    findTools();
});

topBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

// Close suggestions on outside click
document.addEventListener('click', (e) => {
    if (!userInput.contains(e.target)) closeSuggestions();
});
