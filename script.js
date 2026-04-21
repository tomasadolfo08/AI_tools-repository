const SUPABASE_URL = 'https://eorcxcwhvmpbiaewtuug.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcmN4Y3dodm1wYmlhZXd0dXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTE3MzgsImV4cCI6MjA5MTcyNzczOH0.XjlCbmNIJZPisc3EhRrOlFKlihLUPBlmwrCV_JXiRuc';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// SELECTORS
const userInput = document.getElementById('userInput');
const categoryOptions = document.getElementById('categoryOptions');
const selectedCountText = document.getElementById('selectedCount');
const priceFilter = document.getElementById('priceFilter');
const resultsDiv = document.getElementById('results');
const searchBtn = document.getElementById('searchBtn');
const addToolBtn = document.getElementById('addToolBtn');

// --- VISUAL: HEADER SCROLL EFFECT ---
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    header.classList.toggle('scrolled', window.scrollY > 50);
});

window.addEventListener("DOMContentLoaded", findTools);

// --- SEARCH & RENDER ---
async function findTools() {
    // VISUAL: Show Skeleton Loaders while fetching
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
    resultsDiv.innerHTML = list.length ? "" : "<p>No tools found.</p>";
    list.forEach((t, index) => {
        // VISUAL: Staggered animation delay
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

if(searchBtn) searchBtn.addEventListener('click', findTools);
if(addToolBtn) addToolBtn.addEventListener('click', addNewTool);
