alert("JS LOADED");
const SUPABASE_URL = 'https://eorcxcwhvmpbiaewtuug.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcmN4Y3dodm1wYmlhZXd0dXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTE3MzgsImV4cCI6MjA5MTcyNzczOH0.XjlCbmNIJZPisc3EhRrOlFKlihLUPBlmwrCV_JXiRuc';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM
const userInput = document.getElementById('userInput');
const categorySelect = document.getElementById('categorySelect');
const priceFilter = document.getElementById('priceFilter');

const addName = document.getElementById('addName');
const addCat = document.getElementById('addCat');
const addUrl = document.getElementById('addUrl');
const addTags = document.getElementById('addTags');
const addLang = document.getElementById('addLang');
const addPayment = document.getElementById('addPayment');
const addDesc = document.getElementById('addDesc');

const resultsDiv = document.getElementById('results');
const resetBtn = document.getElementById('resetBtn');
const topBtn = document.getElementById('topBtn');

// INIT
window.addEventListener("DOMContentLoaded", findTools);

// SEARCH
async function findTools() {
    const keyword = userInput.value.toLowerCase().trim();
    const category = categorySelect.value;
    const payment = priceFilter.value;

    let { data, error } = await supabase.from('tbl_AITools').select('*');

    if (error) {
        console.error("FETCH ERROR:", error);
        resultsDiv.innerHTML = "<p>Error loading tools.</p>";
        return;
    }

    if (!data || data.length === 0) {
        resultsDiv.innerHTML = "<p>No tools found.</p>";
        return;
    }

    const filtered = data.filter(tool => {
        const categoryMatch = category === "all" || tool.Category === category;
        const paymentMatch = payment === "all" || tool.Payment === payment;

        const text = (
            tool.Name + " " +
            tool.Description + " " +
            (Array.isArray(tool.Tag) ? tool.Tag.join(" ") : "")
        ).toLowerCase();

        return (!keyword || text.includes(keyword)) && categoryMatch && paymentMatch;
    });

    if (!filtered.length) {
        resultsDiv.innerHTML = "<p>No tools found.</p>";
        return;
    }

    render(filtered);
}

// RENDER
function render(list) {
    resultsDiv.innerHTML = "";

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

// ADD TOOL
async function addNewTool() {
    const tool = {
        Name: addName.value.trim(),
        Category: addCat.value,
        URL: addUrl.value.trim(),
        Description: addDesc.value.trim(),
        Tag: addTags.value ? addTags.value.split(",").map(t => t.trim()) : [],
        Languages: addLang.value ? addLang.value.split(",").map(l => l.trim()) : [],
        Payment: addPayment.value
    };

    if (!tool.Name || !tool.URL || !tool.Category) {
        alert("Fill Name, URL and Category");
        return;
    }

    console.log("SENDING:", tool);

    const { data, error } = await supabase.from('tbl_AITools').insert([tool]);

    if (error) {
        console.error("INSERT ERROR:", error);
        alert("Error: " + error.message);
        return;
    }

    console.log("INSERT SUCCESS:", data);
    alert("Tool added!");

    // clear form
    addName.value = "";
    addUrl.value = "";
    addDesc.value = "";
    addTags.value = "";
    addLang.value = "";
    addCat.value = "";

    findTools();
}

// RESET
resetBtn.onclick = () => {
    userInput.value = "";
    categorySelect.value = "all";
    priceFilter.value = "all";
    findTools();
};

// TOP BUTTON
topBtn.onclick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
};

// SUGGESTIONS
userInput.addEventListener("input", async () => {
    const val = userInput.value.toLowerCase();
    const box = document.getElementById("suggestions");

    if (!val) {
        box.innerHTML = "";
        return;
    }

    let { data } = await supabase.from('tbl_AITools').select('Name');

    if (!data) return;

    const matches = data
        .map(x => x.Name)
        .filter(n => n.toLowerCase().startsWith(val))
        .slice(0, 5);

    box.innerHTML = matches.map(m =>
        `<div onclick="selectSuggestion('${m}')">${m}</div>`
    ).join("");
});

function selectSuggestion(text) {
    userInput.value = text;
    document.getElementById("suggestions").innerHTML = "";
}
