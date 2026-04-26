// js/ui/leaderboard.js
'use strict';

// ── Persistence (online + localStorage fallback) ─────────────────

const LB = (() => {
  const LOCAL_KEY    = 'citadel_lb_v4_';
  const BIN_KEY_PRE  = 'citadel_bin_';
  const API_BASE     = 'https://api.jsonbin.io/v3/b';

  let _cache = {};

  // -- localStorage helpers
  function _localGet(mapId) {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY + mapId) || '[]'); }
    catch { return []; }
  }
  function _localSet(mapId, data) {
    try { localStorage.setItem(LOCAL_KEY + mapId, JSON.stringify(data.slice(0, 10))); }
    catch {}
  }

  // -- jsonbin helpers
  function _getBinId(mapId) { return localStorage.getItem(BIN_KEY_PRE + mapId) || null; }
  function _setBinId(mapId, id) { localStorage.setItem(BIN_KEY_PRE + mapId, id); }

  async function _fetchOnline(mapId) {
    const binId = _getBinId(mapId);
    if (!binId) return null;
    try {
      const r = await fetch(`${API_BASE}/${binId}/latest`);
      if (!r.ok) return null;
      const j = await r.json();
      return j.record?.scores || null;
    } catch { return null; }
  }

  async function _pushOnline(mapId, scores) {
    const body  = JSON.stringify({ scores });
    const binId = _getBinId(mapId);
    if (binId) {
      try {
        await fetch(`${API_BASE}/${binId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body,
        });
      } catch {}
    } else {
      // Create a new public bin for this map
      try {
        const r = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Bin-Name': 'citadel_' + mapId, 'X-Bin-Private': 'false' },
          body,
        });
        if (r.ok) {
          const j = await r.json();
          _setBinId(mapId, j.metadata.id);
        }
      } catch {}
    }
  }

  // -- Public API
  async function get(mapId) {
    if (_cache[mapId]) return _cache[mapId];
    const online = await _fetchOnline(mapId);
    if (online) { _cache[mapId] = online; return online; }
    return _localGet(mapId);
  }

  async function add(mapId, name, score, wave) {
    const existing = await get(mapId);
    existing.push({ name: name.trim().slice(0, 16) || 'Anonymous', score, wave, date: Date.now() });
    existing.sort((a, b) => b.score - a.score);
    const top10 = existing.slice(0, 10);
    _cache[mapId] = top10;
    _localSet(mapId, top10);
    _pushOnline(mapId, top10); // fire-and-forget
    return top10;
  }

  function isTopScore(mapId, score) {
    const local = _localGet(mapId);
    return score > 0 && (local.length < 10 || score > (local[local.length - 1]?.score || 0));
  }

  return { get, add, isTopScore };
})();

// ── Leaderboard UI ───────────────────────────────────────────────

let _lbActiveMap = null;

async function openLeaderboard(myScore) {
  document.getElementById('lbm').style.display = 'flex';

  // Build map tabs
  const tabs = document.getElementById('lbtabs');
  tabs.innerHTML = '';
  MAP_ORDER.forEach(id => {
    const m   = MAPS[id];
    const tab = document.createElement('button');
    tab.className   = 'lbtab' + (id === _lbActiveMap ? ' active' : '');
    tab.textContent = m.icon + ' ' + m.name.split(' ')[0];
    tab.onclick = () => {
      _lbActiveMap = id;
      _renderTab(id, myScore);
      document.querySelectorAll('.lbtab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    };
    tabs.appendChild(tab);
  });

  if (!_lbActiveMap) _lbActiveMap = State.selectedMapId || MAP_ORDER[0];
  _renderTab(_lbActiveMap, myScore);
}

function closeLeaderboard() {
  document.getElementById('lbm').style.display = 'none';
}

async function _renderTab(mapId, myScore) {
  const body = document.getElementById('lbbody');
  body.innerHTML = '<div class="lb-loading">Loading…</div>';

  const data = await LB.get(mapId);
  if (!data || !data.length) {
    body.innerHTML = '<div class="lb-empty">No entries yet — be the first!</div>';
    return;
  }

  const rows = data.map((e, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
    const mine  = myScore !== undefined && e.score === myScore;
    return `<tr class="${mine ? 'lb-mine' : ''}">
      <td class="lbr ${i < 3 ? 'top' : ''}">${medal || i + 1}</td>
      <td class="lbnm">${_esc(e.name)}</td>
      <td class="lbsc">${e.score.toLocaleString()}</td>
      <td class="lbwv">${e.wave}/${MAPS[mapId].waves}</td>
    </tr>`;
  }).join('');

  body.innerHTML = `
    <table class="lbt">
      <thead><tr>
        <th style="width:28px">#</th>
        <th>Name</th>
        <th style="text-align:right">Score</th>
        <th style="text-align:center">Wave</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function _esc(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
