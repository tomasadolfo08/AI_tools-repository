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

// DROPDOWN
const categoryBtn = document.getElementById("categoryBtn");
const categoryMenu = document.getElementById("categoryMenu");

// OPEN / CLOSE
categoryBtn.onclick = () => {
    categoryMenu.style.display =
        categoryMenu.style.display === "block" ? "none" : "block";
};

// CLOSE IF CLICK OUTSIDE
document.addEventListener("click", (e) => {
    if (!categoryBtn.contains(e.target) && !categoryMenu.contains(e.target)) {
        categoryMenu.style.display = "none";
    }
});

// UPDATE LABEL TEXT
document.querySelectorAll('#categoryMenu input').forEach(cb => {
    cb.addEventListener('change', () => {
        const selected = Array.from(
            document.querySelectorAll('#categoryMenu input:checked')
        ).map(c => c.value);

        if (selected.includes("all") || selected.length === 0) {
            categoryBtn.innerText = "All Categories";
        } else {
            categoryBtn.innerText = selected.length + " selected";
        }
    });
});

// SEARCH
async function findTools() {
    let { data } = await db.from('tbl_AITools').select('*');

    const keyword = userInput.value.toLowerCase().trim();
    const payment = priceFilter.value;

    const selectedCategories = Array.from(
        document.querySelectorAll('#categoryMenu input:checked')
    ).map(cb => cb.value);

    const filtered = data.filter(t => {
        const catMatch =
            selectedCategories.includes("all") ||
            selectedCategories.includes(t.Category);

        const payMatch = payment === "all" || t.Payment === payment;

        const text = `${t.Name} ${t.Description}`.toLowerCase();

        return (!keyword || text.includes(keyword)) && catMatch && payMatch;
    });

    render(filtered);
}

// RENDER
function render(list) {
    resultsDiv.innerHTML = list.map(t => `
        <div class="card">
            <h3>${t.Name}</h3>
            <p>${t.Description}</p>
        </div>
    `).join('');
}

// EVENTS
searchBtn.onclick = findTools;

resetBtn.onclick = () => {
    userInput.value = "";
    priceFilter.value = "all";

    document.querySelectorAll('#categoryMenu input').forEach(cb => {
        cb.checked = cb.value === "all";
    });

    categoryBtn.innerText = "All Categories";

    findTools();
};

window.onload = findTools;
