const SUPABASE_URL = 'https://eorcxcwhvmpbiaewtuug.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcmN4Y3dodm1wYmlhZXd0dXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTE3MzgsImV4cCI6MjA5MTcyNzczOH0.XjlCbmNIJZPisc3EhRrOlFKlihLUPBlmwrCV_JXiRuc';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// SELECTORS
const userInput = document.getElementById('userInput');
const priceFilter = document.getElementById('priceFilter');
const resultsDiv = document.getElementById('results');
const resetBtn = document.getElementById('resetBtn');
const searchBtn = document.getElementById('searchBtn');
const topBtn = document.getElementById('topBtn');

// MULTI SELECT
const checkboxes = document.getElementById("checkboxes");
const selectBox = document.getElementById("selectBox");

// ADD FORM
const addName = document.getElementById('addName');
const addCat = document.getElementById('addCat');
const addUrl = document.getElementById('addUrl');
const addTags = document.getElementById('addTags');
const addLang = document.getElementById('addLang');
const addPayment = document.getElementById('addPayment');
const addDesc = document.getElementById('addDesc');
const addToolBtn = document.getElementById('addToolBtn');

window.addEventListener("DOMContentLoaded", findTools);

// DROPDOWN TOGGLE
selectBox.onclick = () => {
    checkboxes.style.display =
        checkboxes.style.display === "block" ? "none" : "block";
};

// SEARCH
async function findTools() {
    let { data, error } = await db.from('tbl_AITools').select('*');
    if (error) {
        resultsDiv.innerHTML = "<p>Error loading tools.</p>";
        return;
    }

    const keyword = userInput.value.toLowerCase().trim();
    const payment = priceFilter.value;

    const selectedCategories = Array.from(
        document.querySelectorAll('#checkboxes input:checked')
    ).map(cb => cb.value);

    const filtered = data.filter(t => {
        const catMatch =
            selectedCategories.includes("all") ||
            selectedCategories.length === 0 ||
            selectedCategories.includes(t.Category);

        const payMatch = payment === "all" || t.Payment === payment;

        const text = `${t.Name} ${t.Description} ${Array.isArray(t.Tag) ? t.Tag.join(' ') : ''}`.toLowerCase();

        return (!keyword || text.includes(keyword)) && catMatch && payMatch;
    });

    render(filtered);
}

// RENDER
function render(list) {
    resultsDiv.innerHTML = list.length ? "" : "<p>No tools found.</p>";
    list.forEach(t => {
        resultsDiv.innerHTML += `
        <div class="card">
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

// RESET
resetBtn.addEventListener('click', () => {
    userInput.value = "";
    priceFilter.value = "all";

    document.querySelectorAll('#checkboxes input').forEach(cb => {
        cb.checked = cb.value === "all";
    });

    selectBox.innerText = "All Categories";

    findTools();
});

// OTHER EVENTS
searchBtn.addEventListener('click', findTools);

topBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
