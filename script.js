const supabase = window.supabase.createClient(
  'https://eorcxcwhvmpbiaewtuug.supabase.co',
  'YOUR_KEY'
);

const $ = id => document.getElementById(id);

document.addEventListener('DOMContentLoaded', loadTools);
$('searchBtn').onclick = loadTools;
$('addBtn').onclick = addTool;

// LOAD + SEARCH
async function loadTools() {
  const keyword = $('search').value.toLowerCase();
  const category = $('category').value;
  const results = $('results');

  results.innerHTML = 'Loading...';

  const { data, error } = await supabase.from('tbl_AITools').select('*');
  if (error) return results.innerHTML = 'Error loading';

  const filtered = data.filter(t =>
    (category === 'all' || t.Category === category) &&
    (!keyword ||
      t.Name?.toLowerCase().includes(keyword) ||
      t.Description?.toLowerCase().includes(keyword) ||
      t.Tag?.some(tag => tag.includes(keyword)))
  );

  results.innerHTML = filtered.length
    ? filtered.map(card).join('')
    : 'No results';
}

// CARD TEMPLATE
const card = t => `
<div class="card">
  <h3>${t.Name}</h3>
  <p>${t.Description || ''}</p>
  <a href="${t.URL}" target="_blank">Visit</a>
</div>`;

// ADD TOOL
async function addTool() {
  const tool = {
    Name: $('name').value,
    URL: $('url').value,
    Description: $('desc').value,
    Category: $('cat').value,
    Tag: $('tags').value.split(',').map(t => t.trim().toLowerCase())
  };

  if (!tool.Name || !tool.URL || !tool.Category) {
    return alert('Missing fields');
  }

  const { error } = await supabase.from('tbl_AITools').insert([tool]);

  if (error) return alert(error.message);

  alert('Added!');
  document.querySelectorAll('input, textarea').forEach(i => i.value = '');
  loadTools();
}
