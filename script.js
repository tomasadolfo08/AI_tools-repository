const SUPABASE_URL = 'https://eorcxcwhvmpbiaewtuug.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcmN4Y3dodm1wYmlhZXd0dXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTE3MzgsImV4cCI6MjA5MTcyNzczOH0.XjlCbmNIJZPisc3EhRrOlFKlihLUPBlmwrCV_JXiRuc';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const userInput = document.getElementById('userInput');
const categoryDropdown = document.getElementById('categoryDropdown');
const categoryOptions = document.getElementById('categoryOptions');
const selectedCountText = document.getElementById('selectedCount');
const priceFilter = document.getElementById('priceFilter');
const resultsDiv = document.getElementById('results');
const searchBtn = document.getElementById('searchBtn');
const addToolBtn = document.getElementById('addToolBtn');
const resetBtn = document.getElementById('resetBtn');
const topBtn = document.getElementById('topBtn');

const addName = document.getElementById('addName'),
      addCat = document.getElementById('addCat'),
      addUrl = document.getElementById('addUrl'),
      addTags = document.getElementById('addTags'),
      addLang = document.getElementById('addLang'),
      addPayment = document.getElementById('addPayment'),
      addDesc = document.getElementById('addDesc');

window.addEventListener("DOMContentLoaded", findTools);

// --- UI LOGIC ---
categoryDropdown.addEventListener('click', (e) => {
    categoryOptions.classList.toggle('active');
    e.stopPropagation();
});

document.addEventListener('click', () => categoryOptions.classList.remove('active'));

categoryOptions.addEventListener('change', () => {
    const selected = Array.from(categoryOptions.querySelectorAll('input:checked')).map(cb => cb.value);
    selectedCountText.innerText = selected.length === 0 ? "All Categories" : 
                                 selected.length === 1 ? selected[0] : `${selected.length} Categories`;
});

// --- CORE FUNCTIONS ---
async function findTools() {
    resultsDiv.innerHTML = Array(6).fill('<div class="skeleton-card"></div>').join('');

    let { data, error } = await db.from('tbl_AITools').select('*');
    if (error) {
        resultsDiv.innerHTML = "<p>Error loading tools.</p>";
        return;
    }

    const keyword = userInput.value.toLowerCase().trim();
    const payment = priceFilter.value;
    const selectedCats = Array.from(categoryOptions.querySelectorAll('input:checked')).map(cb => cb.value);

    const filtered = data.filter(t => {
        const catMatch = selectedCats.length === 0 || selectedCats.includes(t.Category);
        const payMatch = payment === "all" || t.Payment === payment;
        const tagsStr = Array.isArray(t.Tag) ? t.Tag.join(' ') : (t.Tag || "");
        const text = `${t.Name} ${t.Description} ${tagsStr}`.toLowerCase();
        return (!keyword || text.includes(keyword)) && catMatch && payMatch;
    });

    render(filtered);
}

function render(list) {
    resultsDiv.innerHTML = list.length ? "" : "<p style='grid-column: 1/-1; text-align: center;'>No tools found.</p>";
    list.forEach((t, index) => {
        const delay = index * 0.05;
        resultsDiv.innerHTML += `
        <div class="card" style="animation-delay: ${delay}s">
            <div>
                <span class="badge">${t.Category || "AI"}</span>
                <h3>${t.Name}</h3>
                <p>${t.Description || ""}</p>
                <p><strong>${t.Payment}</strong> • ${Array.isArray(t.Languages) ? t.Languages.join(", ") : t.Languages || ""}</p>
            </div>
            <a href="${t.URL}" target="_blank" class="btn-link">Visit Tool →</a>
        </div>`;
    });
}

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
    if (error) alert("Error: " + error.message);
    else {
        alert("Tool added successfully!");
        [addName, addUrl, addTags, addLang, addDesc].forEach(el => el.value = "");
        addCat.value = "";
        findTools();
    }
}

// --- SUGGESTIONS & RESET ---
userInput.addEventListener('input', async () => {
    const val = userInput.value.toLowerCase();
    const box = document.getElementById('suggestions');
    if (!val) { box.style.display = "none"; return; }

    let { data } = await db.from('tbl_AITools').select('Name');
    const matches = data.map(d => d.Name).filter(n => n.toLowerCase().startsWith(val)).slice(0, 5);

    if (matches.length > 0) {
        box.innerHTML = matches.map(m => `<div class="suggestion-item">${m}</div>`).join("");
        box.style.display = "block";
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.onclick = () => { userInput.value = item.innerText; box.style.display = "none"; findTools(); };
        });
    } else box.style.display = "none";
});

searchBtn.onclick = findTools;
addToolBtn.onclick = addNewTool;
resetBtn.onclick = () => {
    userInput.value = ""; priceFilter.value = "all";
    categoryOptions.querySelectorAll('input').forEach(cb => cb.checked = false);
    selectedCountText.innerText = "All Categories"; findTools();
};
topBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
