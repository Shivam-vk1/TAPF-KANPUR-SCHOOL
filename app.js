// ---------- Route colors (kitchen-warm, distinguishable on dark map) ----------
const ROUTE_COLORS = {
  'BAIRI': '#e8a33d',
  'Barra': '#7fb298',
  'GOVIND NAGAR': '#7c9ee0',
  'KIDWAI NAGAR': '#d16257',
  'Shastri Nagar': '#c99be0',
  'VIJAY NAGAR': '#e0c25c'
};
function routeColor(name){ return ROUTE_COLORS[name] || '#9aa79f'; }

// ---------- State ----------
const state = {
  query: '',
  route: 'ALL',
  currentView: 'list',
  filtered: [],
  markers: {},     // id -> Leaflet marker
  routeLine: null,
  activeId: null
};

// ---------- Build route list ----------
const ROUTE_NAMES = [...new Set(SCHOOLS.map(s => s.routeName))].sort();

// ---------- Map init ----------
const map = L.map('map', { zoomControl: true, attributionControl: true }).setView([26.45, 80.28], 12);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
  maxZoom: 19
}).addTo(map);

function makeIcon(color, active){
  const size = active ? 16 : 11;
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid ${active ? '#f2ede0' : 'rgba(18,33,26,0.9)'};box-shadow:0 0 0 2px rgba(0,0,0,0.25);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
}

SCHOOLS.forEach(s => {
  if (typeof s.lat !== 'number' || typeof s.lon !== 'number') return;
  const marker = L.marker([s.lat, s.lon], { icon: makeIcon(routeColor(s.routeName), false) });
  marker.bindPopup(popupHtml(s));
  marker.on('click', () => openDrawer(s.id));
  state.markers[s.id] = marker;
});

function popupHtml(s){
  return `<b>${escapeHtml(s.schoolName)}</b><br>
    <span class="mono">${escapeHtml(s.routeName)} · ${escapeHtml(s.nodeCode)}</span><br>
    ${escapeHtml(s.address || 'Address not listed')}`;
}

function escapeHtml(str){
  return (str ?? '').toString().replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// ---------- Route chips ----------
const chipsEl = document.getElementById('routeChips');
function renderChips(){
  let html = `<button class="chip ${state.route==='ALL'?'active':''}" data-route="ALL">All routes</button>`;
  ROUTE_NAMES.forEach(r => {
    html += `<button class="chip ${state.route===r?'active':''}" data-route="${escapeHtml(r)}">
      <span class="dot" style="background:${routeColor(r)}"></span>${escapeHtml(r)}
    </button>`;
  });
  chipsEl.innerHTML = html;
  chipsEl.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.route = btn.dataset.route;
      applyFilters();
    });
  });
}
renderChips();

// ---------- Filtering ----------
function matchesQuery(s, q){
  if (!q) return true;
  const hay = [s.schoolName, s.nodeGroupName, s.udise, s.nodeCode, s.routeCode, s.routeName, s.address, s.spocName, s.pincode]
    .map(v => (v ?? '').toString().toLowerCase()).join(' | ');
  return hay.includes(q);
}

function applyFilters(){
  const q = state.query.trim().toLowerCase();
  state.filtered = SCHOOLS.filter(s => (state.route === 'ALL' || s.routeName === state.route) && matchesQuery(s, q));
  renderList();
  updateMapMarkers();
  drawRouteLine();
  renderChips();
  document.getElementById('resultCount').innerHTML =
    `<b>${state.filtered.length}</b> of ${SCHOOLS.length} schools${state.route!=='ALL' ? ` &middot; route: <b>${escapeHtml(state.route)}</b>` : ''}`;
}

// ---------- List rendering ----------
const listPane = document.getElementById('listPane');
function renderList(){
  if (state.filtered.length === 0){
    listPane.innerHTML = `<div class="empty-state">
      <div class="big">Koi school nahi mila</div>
      Search ya route filter badal kar dekhein.
    </div>`;
    return;
  }
  listPane.innerHTML = state.filtered.map(s => `
    <div class="school-card" tabindex="0" data-id="${s.id}">
      <div class="top-row">
        <div class="name">${escapeHtml(s.schoolName)}</div>
        <div class="route-tag" style="background:${routeColor(s.routeName)}22; color:${routeColor(s.routeName)}; border:1px solid ${routeColor(s.routeName)}55;">${escapeHtml(s.routeName)}</div>
      </div>
      <div class="meta">
        <span>${escapeHtml(s.nodeCode)}</span>
        ${s.udise ? `<span>UDISE ${escapeHtml(s.udise)}</span>` : ''}
        <span>${escapeHtml(s.category)}</span>
      </div>
      ${s.address ? `<div class="addr">${escapeHtml(s.address)}</div>` : ''}
    </div>
  `).join('');
  listPane.querySelectorAll('.school-card').forEach(card => {
    const id = Number(card.dataset.id);
    card.addEventListener('click', () => openDrawer(id));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openDrawer(id); });
  });
}

// ---------- Map marker visibility ----------
function updateMapMarkers(){
  const visibleIds = new Set(state.filtered.map(s => s.id));
  Object.entries(state.markers).forEach(([id, marker]) => {
    const has = map.hasLayer(marker);
    if (visibleIds.has(Number(id)) && !has) marker.addTo(map);
    if (!visibleIds.has(Number(id)) && has) map.removeLayer(marker);
  });
}

// ---------- Route line (sequence of stops on selected route) ----------
function drawRouteLine(){
  if (state.routeLine){ map.removeLayer(state.routeLine); state.routeLine = null; }
  if (state.route === 'ALL') return;
  const stops = SCHOOLS.filter(s => s.routeName === state.route);
  if (stops.length < 2) {
    if (stops.length === 1) map.setView([stops[0].lat, stops[0].lon], 15);
    return;
  }
  const latlngs = stops.map(s => [s.lat, s.lon]);
  state.routeLine = L.polyline(latlngs, {
    color: routeColor(state.route), weight: 3, opacity: 0.75, dashArray: '1,9', lineCap: 'round'
  }).addTo(map);
  map.fitBounds(state.routeLine.getBounds(), { padding: [40, 40] });
}

// ---------- Detail drawer ----------
const overlay = document.getElementById('overlay');
const drawer = document.getElementById('drawer');

function fieldRow(k, v){
  if (!v) return '';
  return `<div class="field-row"><span class="k">${k}</span><span class="v">${escapeHtml(v)}</span></div>`;
}

function openDrawer(id){
  const s = SCHOOLS.find(x => x.id === id);
  if (!s) return;
  state.activeId = id;

  // highlight marker
  Object.entries(state.markers).forEach(([mid, marker]) => {
    marker.setIcon(makeIcon(routeColor(SCHOOLS.find(x=>x.id===Number(mid)).routeName), Number(mid) === id));
  });
  if (map.hasLayer(state.markers[id])) {
    map.flyTo([s.lat, s.lon], Math.max(map.getZoom(), 15), { duration: 0.6 });
    state.markers[id].openPopup();
  }

  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lon}`;

  drawer.innerHTML = `
    <div class="drawer-head">
      <div>
        <h2>${escapeHtml(s.schoolName)}</h2>
        <span class="route-pill" style="background:${routeColor(s.routeName)}22; color:${routeColor(s.routeName)}; border:1px solid ${routeColor(s.routeName)}55;">${escapeHtml(s.routeName)} &middot; ${escapeHtml(s.nodeCode)}</span>
      </div>
      <button class="close-btn" id="closeDrawerBtn">&times;</button>
    </div>
    <div class="drawer-body">
      <div class="field-group">
        <div class="action-row">
          <a class="action-btn primary" href="${gmapsUrl}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8 2 5 5.5 5 9.5c0 5.5 7 12.5 7 12.5s7-7 7-12.5C19 5.5 16 2 12 2z"/><circle cx="12" cy="9.5" r="2.5"/></svg>
            Directions
          </a>
          ${s.driverContact ? `<a class="action-btn" href="tel:${s.driverContact}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>Driver</a>` : ''}
        </div>
      </div>

      <div class="field-group">
        <div class="label">School</div>
        ${fieldRow('Node group', s.nodeGroup)}
        ${fieldRow('UDISE code', s.udise || '—')}
        ${fieldRow('Category', s.category)}
        ${fieldRow('Pincode', s.pincode)}
      </div>

      <div class="field-group">
        <div class="label">Route</div>
        ${fieldRow('Route name', s.routeName)}
        ${fieldRow('Route code', s.routeCode)}
        ${fieldRow('Node code', s.nodeCode)}
      </div>

      ${s.address ? `<div class="field-group">
        <div class="label">Address</div>
        <div class="addr-block">${escapeHtml(s.address)}</div>
      </div>` : ''}

      <div class="field-group">
        <div class="label">Contacts</div>
        ${fieldRow('Driver', s.driverName)}
        ${s.driverContact ? `<div class="field-row"><span class="k">Driver contact</span><a class="v" style="color:var(--amber);text-decoration:none;" href="tel:${s.driverContact}">${escapeHtml(s.driverContact)}</a></div>` : ''}
        ${fieldRow('Route executive', s.routeExecutive)}
        ${s.routeExecutiveContact ? `<div class="field-row"><span class="k">Route exec. contact</span><a class="v" style="color:var(--amber);text-decoration:none;" href="tel:${s.routeExecutiveContact}">${escapeHtml(s.routeExecutiveContact)}</a></div>` : ''}
        ${fieldRow('School SPOC', s.spocName)}
        ${s.spocContact ? `<div class="field-row"><span class="k">SPOC contact</span><a class="v" style="color:var(--amber);text-decoration:none;" href="tel:${s.spocContact}">${escapeHtml(s.spocContact)}</a></div>` : ''}
      </div>
    </div>
  `;
  document.getElementById('closeDrawerBtn').addEventListener('click', closeDrawer);
  overlay.classList.add('show');
  drawer.classList.add('show');

  if (window.innerWidth <= 860) setView('map');
}

function closeDrawer(){
  overlay.classList.remove('show');
  drawer.classList.remove('show');
  if (state.activeId != null && state.markers[state.activeId]) {
    const s = SCHOOLS.find(x => x.id === state.activeId);
    state.markers[state.activeId].setIcon(makeIcon(routeColor(s.routeName), false));
  }
  state.activeId = null;
}
overlay.addEventListener('click', closeDrawer);

// ---------- View toggle (mobile) ----------
function setView(view){
  state.currentView = view;
  document.querySelectorAll('#viewToggle button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  document.getElementById('listPane').classList.toggle('hide', view !== 'list');
  document.getElementById('mapPane').classList.toggle('hide', view !== 'map');
  if (view === 'map') setTimeout(() => map.invalidateSize(), 50);
}
document.getElementById('viewToggle').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (btn) setView(btn.dataset.view);
});

// ---------- Search ----------
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
searchInput.addEventListener('input', () => {
  state.query = searchInput.value;
  clearBtn.classList.toggle('show', state.query.length > 0);
  applyFilters();
});
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  state.query = '';
  clearBtn.classList.remove('show');
  applyFilters();
  searchInput.focus();
});

// ---------- Init ----------
applyFilters();
if (window.innerWidth > 860) setTimeout(() => map.invalidateSize(), 50);
