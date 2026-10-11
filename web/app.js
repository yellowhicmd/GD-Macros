/* Dash Archive starter. Set DOWNLOAD_BASE_URL only to a public directory containing approved release copies. */
const DOWNLOAD_BASE_URL = 'macros/'; // Example: 'https://example.com/macros/' — must end in /
const state = { levels: [], query: '', sort: 'name-asc' };
const $ = (id) => document.getElementById(id);
const grid = $('levelGrid');
const dialog = $('levelDialog');

function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function hasFile(level) { return Boolean(level.file && level.file.trim()); }
function filteredLevels() {
  const q = state.query.trim().toLocaleLowerCase();
  return state.levels.filter(l => [l.name,l.id,l.creator,l.host,l.file].some(v => String(v || '').toLocaleLowerCase().includes(q)))
    .sort((a,b) => state.sort === 'name-desc' ? b.name.localeCompare(a.name) : state.sort === 'creator-asc' ? (a.creator || a.host || '').localeCompare(b.creator || b.host || '') : a.name.localeCompare(b.name));
}
function render() {
  const levels = filteredLevels();
  $('resultCount').textContent = `${levels.length} of ${state.levels.length} levels`;
  $('levelCount').textContent = state.levels.length;
  $('fileCount').textContent = state.levels.filter(hasFile).length;
  $('emptyState').hidden = levels.length !== 0;
  grid.innerHTML = levels.map((l) => `<article class="level-card" tabindex="0" role="button" aria-label="View ${esc(l.name)} details" data-level="${esc(l.name)}">
    <div class="card-top"><span class="level-symbol">${esc(l.name.trim().charAt(0).toUpperCase() || 'G')}</span><span class="file-tag">${hasFile(l) ? esc(l.file.split('.').slice(-2).join('.').toUpperCase()) : 'NO FILE'}</span></div>
    <h3>${esc(l.name)}</h3><div class="creator">${esc(l.creator || (l.host ? `Host: ${l.host}` : 'Creator not listed'))}</div>
    <div class="card-meta"><span>ID <strong>${esc(l.id)}</strong></span><span class="card-action">View details ↗</span></div></article>`).join('');
  grid.querySelectorAll('[data-level]').forEach(card => {
    const open = () => showDetails(state.levels.find(l => l.name === card.dataset.level));
    card.addEventListener('click', open); card.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){e.preventDefault();open();} });
  });
}
function showDetails(level) {
  if (!level) return;
  const creator = level.creator || 'Not listed';
  const id = level.id === 'Main Level (Official level by RobTop, no level ID needed)' ? 'Official main level · no custom ID' : level.id;
  const file = hasFile(level) ? level.file : 'Not provided in source document';
  const canDownload = hasFile(level) && DOWNLOAD_BASE_URL.trim();
  $('dialogContent').innerHTML = `<div class="dialog-kicker">LEVEL DETAILS</div><h2>${esc(level.name)}</h2><div class="dialog-creator">${esc(creator)}</div>
    <div class="detail-list"><div class="detail-row"><span>Level ID</span><strong>${esc(id)}</strong></div>${level.host ? `<div class="detail-row"><span>Host</span><strong>${esc(level.host)}</strong></div>` : ''}<div class="detail-row"><span>Macro filename</span><strong>${esc(file)}</strong></div><div class="detail-row"><span>Format</span><strong>${hasFile(level) ? esc(level.file.split('.').slice(1).join('.').toUpperCase()) : 'Unavailable'}</strong></div></div>
    <button class="download-button" id="downloadButton" ${canDownload ? '' : 'disabled'}>${canDownload ? '↓ Download macro' : hasFile(level) ? 'Download not configured yet' : 'Macro file not listed'}</button>
    <p class="download-note">${canDownload ? 'You will receive the approved public release file.' : 'Downloads will be enabled once a public delivery location for approved macro files is configured. Private repository files are not exposed.'}</p>`;
  if (canDownload) $('downloadButton').addEventListener('click', () => { const a = document.createElement('a'); a.href = DOWNLOAD_BASE_URL.replace(/\/?$/, '/') + encodeURIComponent(level.file).replace(/%2F/g, '/'); a.download = level.file; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); });
  dialog.showModal();
}
$('searchInput').addEventListener('input', e => { state.query = e.target.value; render(); });
$('sortSelect').addEventListener('change', e => { state.sort = e.target.value; render(); });
$('clearSearch').addEventListener('click', () => { $('searchInput').value = ''; state.query = ''; render(); });
$('closeDialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
$('themeToggle').addEventListener('click', () => { const dark = document.documentElement.dataset.theme !== 'dark'; document.documentElement.dataset.theme = dark ? 'dark' : 'light'; $('themeIcon').textContent = dark ? '☀' : '☾'; });
fetch('levels.json').then(r => { if(!r.ok) throw new Error('Could not load levels.json'); return r.json(); }).then(data => { state.levels = data; render(); }).catch(err => { grid.innerHTML = `<p>Could not load the level list. Make sure <code>levels.json</code> is next to <code>index.html</code>.</p>`; $('resultCount').textContent = 'Data unavailable'; console.error(err); });
